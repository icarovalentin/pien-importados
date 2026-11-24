import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Product } from '@/types/product';

const filePath = path.join(process.cwd(), 'src', 'data', 'products.json');

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

// GET /api/products
export async function GET() {
  const products = getProducts();
  return NextResponse.json(products);
}

// POST /api/products (Criar novo produto)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const products = getProducts();

    const newProduct: Product = {
      id: body.id || `prod-${Date.now()}`,
      name: body.name || 'Produto sem nome',
      brand: body.brand || 'Importado',
      category: body.category || 'outros',
      categoryLabel: body.categoryLabel || 'Diversos',
      price: Number(body.price) || 0,
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      status: body.status === 'encomenda' ? 'encomenda' : 'pronta_entrega',
      deliveryTime: body.deliveryTime || (body.status === 'encomenda' ? 'Sob Encomenda (10 a 15 dias)' : 'Envio Imediato (em até 24h)'),
      images: Array.isArray(body.images) && body.images.length > 0 ? body.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
      description: body.description || '',
      specs: Array.isArray(body.specs) ? body.specs : [],
      isFeatured: Boolean(body.isFeatured),
      batchCodeInfo: body.batchCodeInfo || 'Produto com selo e garantia de originalidade.'
    };

    products.unshift(newProduct);
    saveProducts(products);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    return NextResponse.json({ error: 'Falha ao salvar produto' }, { status: 500 });
  }
}

// PUT /api/products (Atualizar produto existente)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const products = getProducts();
    const index = products.findIndex((p) => p.id === body.id);

    if (index === -1) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    products[index] = {
      ...products[index],
      ...body,
      price: Number(body.price ?? products[index].price),
      originalPrice: body.originalPrice !== undefined ? (body.originalPrice ? Number(body.originalPrice) : undefined) : products[index].originalPrice,
    };

    saveProducts(products);
    return NextResponse.json({ success: true, product: products[index] });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({ error: 'Falha ao atualizar produto' }, { status: 500 });
  }
}

// DELETE /api/products?id=... (Excluir produto)
export async function DELETE(req: Request) {
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
