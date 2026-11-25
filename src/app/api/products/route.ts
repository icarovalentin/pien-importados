import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Product, ProductVariant } from '@/types/product';
import { isAdminAuthenticated, isSameOrigin } from '@/lib/auth';
import {
  getSupabaseAdmin,
  isSupabaseConfigured,
  mapProductToRow,
  mapRowToProduct,
  PRODUCT_IMAGES_BUCKET,
  ProductRow,
} from '@/lib/supabase';

const filePath = path.join(process.cwd(), 'src', 'data', 'products.json');
const ALLOWED_CATEGORIES = new Set([
  'farmacia',
  'perfumes',
  'arabes',
  'beleza',
  'eletronicos',
  'smartphones',
  'acessorios',
]);
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
const MAX_IMAGES = 8;
// O catalogo importado da Victoria's Secret tem ate 55 variacoes por produto.
const MAX_VARIANTS = 200;
const MAX_IMAGE_URL_LENGTH = 1000;
const PRICE_MIN = 0.01;
const PRICE_MAX = 9999999999.99;
const isProd = process.env.NODE_ENV === 'production';

function logError(context: string, error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : error && typeof error === 'object' && typeof (error as { message?: unknown }).message === 'string'
        ? (error as { message: string }).message
        : String(error);
  const code =
    error && typeof error === 'object' && 'code' in error
      ? (error as { code?: unknown }).code
      : undefined;
  console.error(`[${context}] ${message}${code !== undefined ? ` (code: ${String(code)})` : ''}`);
}

function getLocalProducts(): Product[] {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    logError('getLocalProducts', err);
    return [];
  }
}

function saveLocalProducts(products: Product[]) {
  if (isProd) {
    throw new Error('Escrita no catálogo local bloqueada em produção');
  }
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
}

function getAllowedImageHosts(): string[] {
  const hosts = ['images.unsplash.com'];
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      hosts.push(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname);
    }
  } catch {
    // ignora URL inválida
  }
  return hosts;
}

function isSafeImageUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.length > MAX_IMAGE_URL_LENGTH) return false;
  if (/^\/(uploads|catalog)\/[A-Za-z0-9._\/-]+$/.test(trimmed) && !trimmed.includes('..')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' && getAllowedImageHosts().includes(parsed.hostname);
  } catch {
    return false;
  }
}

/** Remove do Supabase Storage as imagens do bucket que deixaram de ser usadas. */
async function removeOrphanImages(urls: string[]) {
  if (!isSupabaseConfigured() || urls.length === 0) return;
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const paths = urls
    .map((u) => {
      const i = u.indexOf(marker);
      return i >= 0 ? decodeURIComponent(u.slice(i + marker.length)) : null;
    })
    .filter((p): p is string => !!p && p.startsWith('products/'));
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
  if (error) logError('removeOrphanImages', error);
}

function sanitizeString(value: unknown, fallback = '', maxLen = 500): string {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, maxLen);
}

function sanitizeStringList(raw: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s: unknown): s is string => typeof s === 'string' && s.trim().length > 0)
    .map((s) => s.trim().slice(0, maxLen))
    .slice(0, maxItems);
}

function sanitizeVariants(raw: unknown): ProductVariant[] {
  if (!Array.isArray(raw)) return [];
  const result: ProductVariant[] = [];
  const usedLabels = new Set<string>();
  for (let i = 0; i < raw.length && result.length < MAX_VARIANTS; i++) {
    const item = raw[i] as ProductVariant | null;
    if (!item || typeof item !== 'object') continue;
    const label = sanitizeString(item.label, '', 60);
    if (!label || usedLabels.has(label)) continue; // o rótulo identifica a variação na sacola
    usedLabels.add(label);
    const rawPrice = item.price;
    let price: number | undefined;
    if (rawPrice !== undefined && rawPrice !== null && String(rawPrice).trim() !== '') {
      const parsed = Number(rawPrice);
      if (Number.isFinite(parsed) && parsed > 0) {
        price = parsed;
      }
    }
    const id = sanitizeString(item.id, `var-${i + 1}`, 60) || `var-${i + 1}`;
    const variant: ProductVariant = { id, label, price };
    const images = Array.isArray(item.images) ? item.images.filter(isSafeImageUrl).slice(0, 10) : [];
    if (images.length > 0) variant.images = images;
    const description = sanitizeString(item.description, '', 2000);
    if (description) variant.description = description;
    const specs = sanitizeStringList(item.specs, 20, 200);
    if (specs.length > 0) variant.specs = specs;
    result.push(variant);
  }
  return result;
}

function validatePrice(
  value: unknown,
  fieldName: string
): { ok: true; value: number } | { ok: false; error: string } {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return { ok: false, error: `${fieldName} deve ser um número válido` };
  }

  const rounded = Math.round((value + Number.EPSILON) * 100) / 100;
  if (rounded < PRICE_MIN || rounded > PRICE_MAX) {
    return {
      ok: false,
      error: `${fieldName} deve estar entre ${PRICE_MIN.toFixed(2)} e ${PRICE_MAX.toFixed(2)}`,
    };
  }

  return { ok: true, value: rounded };
}

function validateBoolean(
  value: unknown,
  fieldName: string
): { ok: true; value: boolean } | { ok: false; error: string } {
  if (typeof value !== 'boolean') {
    return { ok: false, error: `${fieldName} deve ser true ou false` };
  }
  return { ok: true, value };
}

function validateImages(
  images: unknown
): { ok: true; value: string[] } | { ok: false; error: string } {
  if (!Array.isArray(images)) {
    return { ok: false, error: 'Imagens deve ser um array' };
  }
  if (images.length > MAX_IMAGES) {
    return { ok: false, error: `Máximo de ${MAX_IMAGES} imagens por produto` };
  }
  const valid = images.filter(isSafeImageUrl);
  if (valid.length !== images.length) {
    return { ok: false, error: 'Uma ou mais URLs de imagem inválidas' };
  }
  return { ok: true, value: valid };
}

function validateVariants(
  raw: unknown
): { ok: true; value: ProductVariant[] } | { ok: false; error: string } {
  if (!Array.isArray(raw)) {
    return { ok: false, error: 'Variantes deve ser um array' };
  }
  if (raw.length > MAX_VARIANTS) {
    return { ok: false, error: `Máximo de ${MAX_VARIANTS} variantes por produto` };
  }
  return { ok: true, value: sanitizeVariants(raw) };
}

// GET /api/products (público — leitura da vitrine)
export async function GET() {
  let supabaseFailure: unknown = null;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return NextResponse.json((data as ProductRow[]).map(mapRowToProduct));
      }

      supabaseFailure = error ?? new Error('Resposta inválida do Supabase');
    } else {
      supabaseFailure = new Error('Cliente Supabase indisponível');
    }
  }

  if (isProd) {
    logError(
      'GET /api/products',
      supabaseFailure ?? new Error('Supabase não configurado em produção')
    );
    return NextResponse.json(
      { error: 'Catálogo indisponível' },
      { status: 503, headers: { 'X-Catalogo': 'fallback' } }
    );
  }

  if (supabaseFailure) {
    logError('GET /api/products (fallback local)', supabaseFailure);
  }

  return NextResponse.json(getLocalProducts());
}

// POST /api/products (restrito ao admin autenticado)
export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Origem inválida' }, { status: 403 });
  }

  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 });
    }

    const priceResult = validatePrice(body.price, 'Preço');
    if (!priceResult.ok) {
      return NextResponse.json({ error: priceResult.error }, { status: 400 });
    }
    const price = priceResult.value;

    let originalPrice: number | undefined;
    if (body.originalPrice !== undefined && body.originalPrice !== '' && body.originalPrice !== null) {
      const originalPriceResult = validatePrice(body.originalPrice, 'Preço original');
      if (!originalPriceResult.ok) {
        return NextResponse.json({ error: originalPriceResult.error }, { status: 400 });
      }
      originalPrice = originalPriceResult.value;
    }

    let isFeatured = false;
    if (body.isFeatured !== undefined) {
      const featuredResult = validateBoolean(body.isFeatured, 'isFeatured');
      if (!featuredResult.ok) {
        return NextResponse.json({ error: featuredResult.error }, { status: 400 });
      }
      isFeatured = featuredResult.value;
    }

    let validImages: string[] = [];
    if (body.images !== undefined) {
      const imagesResult = validateImages(body.images);
      if (!imagesResult.ok) {
        return NextResponse.json({ error: imagesResult.error }, { status: 400 });
      }
      validImages = imagesResult.value;
    }

    let variants: ProductVariant[] = [];
    if (body.variants !== undefined) {
      const variantsResult = validateVariants(body.variants);
      if (!variantsResult.ok) {
        return NextResponse.json({ error: variantsResult.error }, { status: 400 });
      }
      variants = variantsResult.value;
    }

    const category =
      typeof body.category === 'string' && ALLOWED_CATEGORIES.has(body.category)
        ? body.category
        : 'perfumes';

    const status = body.status === 'encomenda' ? 'encomenda' : 'pronta_entrega';

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: sanitizeString(body.name, 'Produto sem nome', 160),
      brand: sanitizeString(body.brand, 'Importado', 80),
      category,
      categoryLabel: sanitizeString(body.categoryLabel, 'Diversos', 80),
      price,
      originalPrice,
      status,
      deliveryTime: sanitizeString(
        body.deliveryTime,
        status === 'encomenda' ? 'Sob Encomenda (10 a 15 dias)' : 'Envio Imediato (em até 24h)',
        120
      ),
      images: validImages.length > 0 ? validImages : [DEFAULT_IMAGE],
      description: sanitizeString(body.description, '', 2000),
      specs: Array.isArray(body.specs)
        ? body.specs
            .filter((s: unknown): s is string => typeof s === 'string' && s.trim().length > 0)
            .map((s: string) => s.trim().slice(0, 200))
            .slice(0, 20)
        : [],
      isFeatured,
      batchCodeInfo: sanitizeString(
        body.batchCodeInfo,
        'Produto com selo e garantia de originalidade.',
        300
      ),
      variants,
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('products')
          .insert(mapProductToRow(newProduct))
          .select('*')
          .single();

        if (error) {
          logError('POST /api/products INSERT', error);
          return NextResponse.json(
            { error: 'Falha ao salvar produto no banco.' },
            { status: isProd ? 503 : 500 }
          );
        }

        return NextResponse.json({
          success: true,
          product: mapRowToProduct(data as ProductRow),
        });
      }
    }

    if (isProd) {
      logError('POST /api/products', new Error('Supabase não configurado em produção'));
      return NextResponse.json({ error: 'Banco não configurado' }, { status: 503 });
    }

    const products = getLocalProducts();
    products.unshift(newProduct);
    saveLocalProducts(products);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    logError('POST /api/products', error);
    return NextResponse.json({ error: 'Falha ao salvar produto' }, { status: 500 });
  }
}

// PUT /api/products (restrito ao admin autenticado) — aceita atualização parcial
export async function PUT(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Origem inválida' }, { status: 403 });
  }

  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 });
    }

    const id = sanitizeString(body.id, '', 80);
    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
    }

    let current: Product | undefined;
    let localProducts: Product[] = [];

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        if (isProd) {
          logError('PUT /api/products', new Error('Cliente Supabase indisponível'));
          return NextResponse.json({ error: 'Banco indisponível' }, { status: 503 });
        }
        localProducts = getLocalProducts();
        current = localProducts.find((p) => p.id === id);
      } else {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          logError('PUT /api/products SELECT', error);
          return NextResponse.json(
            { error: 'Falha ao consultar produto' },
            { status: isProd ? 503 : 500 }
          );
        }
        if (data) current = mapRowToProduct(data as ProductRow);
      }
    } else {
      localProducts = getLocalProducts();
      current = localProducts.find((p) => p.id === id);
    }

    if (!current) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    let nextPrice = current.price;
    if (body.price !== undefined) {
      const priceResult = validatePrice(body.price, 'Preço');
      if (!priceResult.ok) {
        return NextResponse.json({ error: priceResult.error }, { status: 400 });
      }
      nextPrice = priceResult.value;
    }

    let nextOriginalPrice = current.originalPrice;
    if (body.originalPrice !== undefined) {
      if (body.originalPrice === '' || body.originalPrice === null) {
        nextOriginalPrice = undefined;
      } else {
        const originalPriceResult = validatePrice(body.originalPrice, 'Preço original');
        if (!originalPriceResult.ok) {
          return NextResponse.json({ error: originalPriceResult.error }, { status: 400 });
        }
        nextOriginalPrice = originalPriceResult.value;
      }
    }

    let nextIsFeatured = Boolean(current.isFeatured);
    if (body.isFeatured !== undefined) {
      const featuredResult = validateBoolean(body.isFeatured, 'isFeatured');
      if (!featuredResult.ok) {
        return NextResponse.json({ error: featuredResult.error }, { status: 400 });
      }
      nextIsFeatured = featuredResult.value;
    }

    let nextImages = current.images;
    if (body.images !== undefined) {
      const imagesResult = validateImages(body.images);
      if (!imagesResult.ok) {
        return NextResponse.json({ error: imagesResult.error }, { status: 400 });
      }
      nextImages = imagesResult.value.length > 0 ? imagesResult.value : current.images;
    }

    let nextVariants = current.variants;
    if (body.variants !== undefined) {
      const variantsResult = validateVariants(body.variants);
      if (!variantsResult.ok) {
        return NextResponse.json({ error: variantsResult.error }, { status: 400 });
      }
      nextVariants = variantsResult.value;
    }

    const updatedProduct: Product = {
      ...current,
      name: body.name !== undefined ? sanitizeString(body.name, current.name, 160) : current.name,
      brand: body.brand !== undefined ? sanitizeString(body.brand, current.brand, 80) : current.brand,
      category:
        typeof body.category === 'string' && ALLOWED_CATEGORIES.has(body.category)
          ? body.category
          : current.category,
      categoryLabel:
        body.categoryLabel !== undefined
          ? sanitizeString(body.categoryLabel, current.categoryLabel, 80)
          : current.categoryLabel,
      price: nextPrice,
      originalPrice: nextOriginalPrice,
      status:
        body.status === 'encomenda' || body.status === 'pronta_entrega'
          ? body.status
          : current.status,
      deliveryTime:
        body.deliveryTime !== undefined
          ? sanitizeString(body.deliveryTime, current.deliveryTime, 120)
          : current.deliveryTime,
      images: nextImages.length > 0 ? nextImages : current.images,
      description:
        body.description !== undefined
          ? sanitizeString(body.description, '', 2000)
          : current.description,
      specs: Array.isArray(body.specs)
        ? body.specs
            .filter((s: unknown): s is string => typeof s === 'string' && s.trim().length > 0)
            .map((s: string) => s.trim().slice(0, 200))
            .slice(0, 20)
        : current.specs,
      batchCodeInfo:
        body.batchCodeInfo !== undefined
          ? sanitizeString(body.batchCodeInfo, '', 300)
          : current.batchCodeInfo,
      isFeatured: nextIsFeatured,
      variants: nextVariants,
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const row = mapProductToRow(updatedProduct);
        const { data, error } = await supabase
          .from('products')
          .update(row)
          .eq('id', id)
          .select('*')
          .single();

        if (error) {
          logError('PUT /api/products UPDATE', error);
          return NextResponse.json(
            { error: 'Falha ao atualizar produto' },
            { status: isProd ? 503 : 500 }
          );
        }

        const removed = current.images.filter((u) => !updatedProduct.images.includes(u));
        await removeOrphanImages(removed);

        return NextResponse.json({
          success: true,
          product: mapRowToProduct(data as ProductRow),
        });
      }
    }

    if (isProd) {
      logError('PUT /api/products', new Error('Supabase não configurado em produção'));
      return NextResponse.json({ error: 'Banco não configurado' }, { status: 503 });
    }

    const index = localProducts.findIndex((p) => p.id === id);
    localProducts[index] = updatedProduct;
    saveLocalProducts(localProducts);

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    logError('PUT /api/products', error);
    return NextResponse.json({ error: 'Falha ao atualizar produto' }, { status: 500 });
  }
}

// DELETE /api/products?id=... (restrito ao admin autenticado)
export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Origem inválida' }, { status: 403 });
  }

  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        if (isProd) {
          logError('DELETE /api/products', new Error('Cliente Supabase indisponível'));
          return NextResponse.json({ error: 'Banco indisponível' }, { status: 503 });
        }
      } else {
        const { data: existing, error: existingError } = await supabase
          .from('products')
          .select('images')
          .eq('id', id)
          .maybeSingle();

        if (existingError) {
          logError('DELETE /api/products SELECT', existingError);
        }

        const { data, error } = await supabase
          .from('products')
          .delete()
          .eq('id', id)
          .select('id');

        if (error) {
          logError('DELETE /api/products', error);
          return NextResponse.json(
            { error: 'Falha ao excluir produto' },
            { status: isProd ? 503 : 500 }
          );
        }

        if (!data || data.length === 0) {
          return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
        }

        await removeOrphanImages((existing?.images as string[] | null) ?? []);
        return NextResponse.json({ success: true, message: 'Produto removido com sucesso' });
      }
    }

    if (isProd) {
      logError('DELETE /api/products', new Error('Supabase não configurado em produção'));
      return NextResponse.json({ error: 'Banco não configurado' }, { status: 503 });
    }

    const products = getLocalProducts();
    const updated = products.filter((p) => p.id !== id);

    if (updated.length === products.length) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    saveLocalProducts(updated);
    return NextResponse.json({ success: true, message: 'Produto removido com sucesso' });
  } catch (error) {
    logError('DELETE /api/products', error);
    return NextResponse.json({ error: 'Falha ao excluir produto' }, { status: 500 });
  }
}
