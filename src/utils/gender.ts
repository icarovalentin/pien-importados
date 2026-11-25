import type { Product } from '@/types/product';

/** Descobre o gênero do perfume pela linha "Gênero: ..." das especificações (ou pelo nome). */
export function getProductGender(product: Pick<Product, 'name' | 'specs'>): 'masculino' | 'feminino' | 'unissex' {
  const line = (product.specs || []).find((s) => /^g[êe]nero\s*:/i.test(s));
  const text = (line ? line.split(':')[1] : product.name).toLowerCase();
  if (/unissex|unisex/.test(text)) return 'unissex';
  if (/feminin/.test(text)) return 'feminino';
  if (/masculin/.test(text)) return 'masculino';
  return 'unissex';
}
