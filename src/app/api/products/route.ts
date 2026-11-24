import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Product } from '@/types/product';
import { isAdminAuthenticated } from '@/lib/auth';

const filePath = path.join(process.cwd(), 'src', 'data', 'products.json');
const ALLOWED_CATEGORIES = new Set(['perfumes', 'beleza', 'eletronicos', 'smartphones', 'acessorios']);
const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

function getProducts(): Product[] {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler products.json:', err);
    return [];
  }
}

function saveProducts(products: Product[]) {
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
}

function isSafeImageUrl(url: unknown): url is string {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('/uploads/') && !trimmed.includes('..')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function sanitizeString(value: unknown, fallback = '', maxLen = 500): string {
  if (typeof value !== 'string') return fallback;
  return value.trim().slice(0, maxLen);
}

// GET /api/products (público — leitura da vitrine)
export async function GET() {
  const products = getProducts();
  return NextResponse.json(products);
}

// POST /api/products (restrito ao admin autenticado)
export async function POST(req: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const products = getProducts();

    const price = Number(body.price);
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'Preço inválido' }, { status: 400 });
    }

    const originalPrice =
      body.originalPrice !== undefined && body.originalPrice !== ''
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
    };

    products.unshift(newProduct);
    saveProducts(products);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    return NextResponse.json({ error: 'Falha ao salvar produto' }, { status: 500 });
  }
}

// PUT /api/products (restrito ao admin autenticado)
export async function PUT(req: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const products = getProducts();
    const index = products.findIndex((p) => p.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    const current = products[index];

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

    products[index] = {
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
    };

    saveProducts(products);
    return NextResponse.json({ success: true, product: products[index] });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({ error: 'Falha ao atualizar produto' }, { status: 500 });
  }
}

// DELETE /api/products?id=... (restrito ao admin autenticado)
export async function DELETE(req: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
    }

    const products = getProducts();
    const updated = products.filter((p) => p.id !== id);

    if (updated.length === products.length) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    saveProducts(updated);
    return NextResponse.json({ success: true, message: 'Produto removido com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json({ error: 'Falha ao excluir produto' }, { status: 500 });
  }
}
