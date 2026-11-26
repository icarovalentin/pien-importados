import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, ProductVariant, StockStatus } from '@/types/product';

export const PRODUCT_IMAGES_BUCKET = 'product-images';

let warnedMissingAnonKey = false;

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Boolean(url && url.trim().length > 0 && serviceKey && serviceKey.trim().length > 0);
}

/**
 * Cliente público de leitura (usa NEXT_PUBLIC_SUPABASE_ANON_KEY e respeita o RLS).
 * Se a chave anon ainda não estiver configurada, recua para o cliente admin com aviso único
 * para não tirar a vitrine do ar durante a transição de variáveis.
 */
export function getSupabasePublic(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim();

  if (url && anonKey) {
    return createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  if (url && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    if (!warnedMissingAnonKey) {
      warnedMissingAnonKey = true;
      console.warn(
        '[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY não definida; leitura pública usando fallback temporário.'
      );
    }
    return getSupabaseAdmin();
  }

  return null;
}

/**
 * Cliente administrativo de servidor (usa SUPABASE_SERVICE_ROLE_KEY, nunca exposto ao navegador).
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export interface ProductRow {
  id: string;
  name: string;
  brand: string;
  category: Product['category'];
  category_label: string;
  price: number | string;
  original_price: number | string | null;
  status: StockStatus;
  delivery_time: string;
  images: string[] | null;
  description: string | null;
  specs: string[] | null;
  is_featured: boolean | null;
  batch_code_info: string | null;
  variants: ProductVariant[] | null;
  created_at?: string;
}

export function mapRowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    categoryLabel: row.category_label,
    price: Number(row.price),
    originalPrice:
      row.original_price !== null && row.original_price !== undefined
        ? Number(row.original_price)
        : undefined,
    status: row.status === 'encomenda' ? 'encomenda' : 'pronta_entrega',
    deliveryTime: row.delivery_time,
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : [],
    description: row.description || '',
    specs: Array.isArray(row.specs) ? row.specs : [],
    isFeatured: Boolean(row.is_featured),
    batchCodeInfo: row.batch_code_info || undefined,
    variants: Array.isArray(row.variants) ? row.variants : [],
    createdAt: row.created_at,
  };
}

export function mapProductToRow(product: Product): Omit<ProductRow, 'created_at'> {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    category_label: product.categoryLabel,
    price: product.price,
    original_price: product.originalPrice ?? null,
    status: product.status,
    delivery_time: product.deliveryTime,
    images: product.images,
    description: product.description,
    specs: product.specs,
    is_featured: Boolean(product.isFeatured),
    batch_code_info: product.batchCodeInfo ?? null,
    variants: product.variants && product.variants.length > 0 ? product.variants : [],
  };
}

export function collectProductImageUrls(
  images?: string[] | null,
  variants?: { images?: string[] | null }[] | null
): string[] {
  const urls = new Set<string>();
  if (Array.isArray(images)) {
    for (const u of images) {
      if (typeof u === 'string' && u) urls.add(u);
    }
  }
  if (Array.isArray(variants)) {
    for (const v of variants) {
      if (Array.isArray(v?.images)) {
        for (const u of v.images) {
          if (typeof u === 'string' && u) urls.add(u);
        }
      }
    }
  }
  return Array.from(urls);
}

/**
 * Extrai com segurança o caminho gerenciado no bucket público a partir de uma URL do Supabase Storage.
 * Rejeita hosts externos e qualquer tentativa de path traversal.
 */
export function extractManagedStoragePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx < 0) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (supabaseUrl) {
    try {
      if (new URL(url).host !== new URL(supabaseUrl).host) return null;
    } catch {
      return null;
    }
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(url.slice(idx + marker.length).split('?')[0]);
  } catch {
    return null;
  }

  if (!/^products\/[A-Za-z0-9._-]+$/.test(decoded) || decoded.includes('..')) {
    return null;
  }
  return decoded;
}
