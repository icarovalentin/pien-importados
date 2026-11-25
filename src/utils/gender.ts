import type { Product } from '@/types/product';

export type GenderFilter = 'todos' | 'masculino' | 'feminino';

/** Categorias onde o filtro Masculino / Feminino aparece. */
export const GENDER_FILTER_CATEGORIES: string[] = ['perfumes', 'arabes'];

/** Descobre o gênero do perfume pela linha "Gênero: ..." das especificações (ou pelo nome). */
export function getProductGender(product: Pick<Product, 'name' | 'specs'>): 'masculino' | 'feminino' | 'unissex' {
  const line = (product.specs || []).find((s) => /^g[êe]nero\s*:/i.test(s));
  const text = (line ? line.split(':')[1] : product.name).toLowerCase();
  if (/unissex|unisex/.test(text)) return 'unissex';
  if (/feminin/.test(text)) return 'feminino';
  if (/masculin/.test(text)) return 'masculino';
  return 'unissex';
}

/** Unissex aparece nos dois filtros. */
export function matchesGender(product: Pick<Product, 'name' | 'specs'>, filter: GenderFilter): boolean {
  if (filter === 'todos') return true;
  const g = getProductGender(product);
  return g === 'unissex' || g === filter;
}
