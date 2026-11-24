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
  'perfumes',
  'beleza',
  'eletronicos',
  'smartphones',
  'acessorios',
]);
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

function getLocalProducts(): Product[] {
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler products.json:', err);
    return [];
  }
}

function saveLocalProducts(products: Product[]) {
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
  if (trimmed.length > 1000) return false;
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
  if (error) console.error('Erro ao remover imagens órfãs:', error);
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
  for (let i = 0; i < raw.length && result.length < 100; i++) {
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

// GET /api/products (público — leitura da vitrine)
export async function GET() {
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
      console.error('Erro ao buscar produtos no Supabase:', error);
    }
  }

  return NextResponse.json(getLocalProducts());
}

// POST /api/products (restrito ao admin autenticado)
export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Origem inválida' }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'Preço inválido' }, { status: 400 });
    }

    const originalPrice =
      body.originalPrice !== undefined && body.originalPrice !== '' && body.originalPrice !== null
        ? Number(body.originalPrice)
        : undefined;
    if (originalPrice !== undefined && (!Number.isFinite(originalPrice) || originalPrice <= 0)) {
      return NextResponse.json({ error: 'Preço original inválido' }, { status: 400 });
    }

    const category = ALLOWED_CATEGORIES.has(body.category)
      ? body.category
      : 'perfumes';

    const validImages = Array.isArray(body.images)
      ? body.images.filter(isSafeImageUrl)
      : [];

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
      isFeatured: Boolean(body.isFeatured),
      batchCodeInfo: sanitizeString(
        body.batchCodeInfo,
        'Produto com selo e garantia de originalidade.',
        300
      ),
      variants: sanitizeVariants(body.variants),
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
          console.error('Erro Supabase INSERT:', error);
          return NextResponse.json({ error: 'Falha ao salvar produto no banco.' }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          product: mapRowToProduct(data as ProductRow),
        });
      }
    }

    const products = getLocalProducts();
    products.unshift(newProduct);
    saveLocalProducts(products);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    return NextResponse.json({ error: 'Falha ao salvar produto' }, { status: 500 });
  }
}

// PUT /api/products (restrito ao admin autenticado)
export async function PUT(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Origem inválida' }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = sanitizeString(body.id, '', 80);
    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
    }

    let current: Product | undefined;
    let localProducts: Product[] = [];

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('Erro Supabase SELECT PUT:', error);
          return NextResponse.json({ error: 'Falha ao consultar produto' }, { status: 500 });
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

    const nextPrice = body.price !== undefined ? Number(body.price) : current.price;
    if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
      return NextResponse.json({ error: 'Preço inválido' }, { status: 400 });
    }

    let nextOriginalPrice = current.originalPrice;
    if (body.originalPrice !== undefined) {
      if (body.originalPrice === '' || body.originalPrice === null) {
        nextOriginalPrice = undefined;
      } else {
        const parsedOrig = Number(body.originalPrice);
        if (!Number.isFinite(parsedOrig) || parsedOrig <= 0) {
          return NextResponse.json({ error: 'Preço original inválido' }, { status: 400 });
        }
        nextOriginalPrice = parsedOrig;
      }
    }

    const nextImages = Array.isArray(body.images)
      ? body.images.filter(isSafeImageUrl)
      : current.images;

    const updatedProduct: Product = {
      ...current,
      name: body.name !== undefined ? sanitizeString(body.name, current.name, 160) : current.name,
      brand: body.brand !== undefined ? sanitizeString(body.brand, current.brand, 80) : current.brand,
      category:
        body.category !== undefined && ALLOWED_CATEGORIES.has(body.category)
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
      isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : current.isFeatured,
      variants:
        body.variants !== undefined ? sanitizeVariants(body.variants) : current.variants,
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
          console.error('Erro Supabase UPDATE:', error);
          return NextResponse.json({ error: 'Falha ao atualizar produto' }, { status: 500 });
        }

        const removed = current.images.filter((u) => !updatedProduct.images.includes(u));
        await removeOrphanImages(removed);

        return NextResponse.json({
          success: true,
          product: mapRowToProduct(data as ProductRow),
        });
      }
    }

    const index = localProducts.findIndex((p) => p.id === id);
    localProducts[index] = updatedProduct;
    saveLocalProducts(localProducts);

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({ error: 'Falha ao atualizar produto' }, { status: 500 });
  }
}

// DELETE /api/products?id=... (restrito ao admin autenticado)
export async function DELETE(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: 'Origem inválida' }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
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
      if (supabase) {
        const { data: existing } = await supabase
          .from('products')
          .select('images')
          .eq('id', id)
          .maybeSingle();

        const { data, error } = await supabase
          .from('products')
          .delete()
          .eq('id', id)
          .select('id');

        if (error) {
          console.error('Erro Supabase DELETE:', error);
          return NextResponse.json({ error: 'Falha ao excluir produto' }, { status: 500 });
        }

        if (!data || data.length === 0) {
          return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
        }

        await removeOrphanImages((existing?.images as string[] | null) ?? []);
        return NextResponse.json({ success: true, message: 'Produto removido com sucesso' });
      }
    }

    const products = getLocalProducts();
    const updated = products.filter((p) => p.id !== id);

    if (updated.length === products.length) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    saveLocalProducts(updated);
    return NextResponse.json({ success: true, message: 'Produto removido com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json({ error: 'Falha ao excluir produto' }, { status: 500 });
  }
}
