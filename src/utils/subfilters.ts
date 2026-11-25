/**
 * ============================================================================
 *  FILTROS POR CATEGORIA (as "barrinhas" abaixo de Todos / Pronta-entrega / Encomenda)
 * ============================================================================
 *  Para mudar os filtros de uma categoria, edite a lista dela em SUBFILTERS.
 *  Cada filtro tem: id (interno), label (o que aparece) e match (regra que diz
 *  se o produto entra nesse filtro). "Todos" é criado automaticamente.
 *  Categoria sem entrada aqui simplesmente não mostra a barra.
 */
import type { Product } from '@/types/product';
import { getProductGender } from '@/utils/gender';

export interface SubFilter {
  id: string;
  label: string;
  match: (p: Product) => boolean;
}

const lower = (s: string) => s.toLowerCase();
const nameStarts = (p: Product, ...words: string[]) => words.some((w) => lower(p.name).startsWith(w));

const gender = (g: 'masculino' | 'feminino'): SubFilter['match'] => (p) => {
  const pg = getProductGender(p);
  return pg === 'unissex' || pg === g; // unissex aparece nos dois
};

const perfumeFilters: SubFilter[] = [
  { id: 'masculino', label: 'Masculino', match: gender('masculino') },
  { id: 'feminino', label: 'Feminino', match: gender('feminino') },
];

export const SUBFILTERS: Record<string, { allLabel: string; filters: SubFilter[] }> = {
  perfumes: { allLabel: 'Todos os perfumes', filters: perfumeFilters },
  arabes: { allLabel: 'Todos os perfumes', filters: perfumeFilters },

  // Smartphones por marca (Redmi e POCO são da Xiaomi, mas têm botão próprio)
  smartphones: {
    allLabel: 'Todas as marcas',
    filters: [
      { id: 'samsung', label: 'Samsung', match: (p) => lower(p.brand) === 'samsung' },
      { id: 'xiaomi', label: 'Xiaomi', match: (p) => lower(p.brand) === 'xiaomi' && !nameStarts(p, 'poco') },
      { id: 'poco', label: 'POCO', match: (p) => nameStarts(p, 'poco') || lower(p.brand) === 'poco' },
      { id: 'apple', label: 'Apple', match: (p) => lower(p.brand) === 'apple' },
    ],
  },

  // Tech & Acessórios por tipo (usa o "tipo" cadastrado no produto)
  acessorios: {
    allLabel: 'Tudo',
    filters: [
      { id: 'fones', label: 'Fones de ouvido', match: (p) => /fone/i.test(p.categoryLabel) },
      { id: 'smartwatch', label: 'Smartwatch', match: (p) => /smartwatch|rel[óo]gio|wearable/i.test(p.categoryLabel) },
      { id: 'caixas', label: 'Caixas de som', match: (p) => /caixa/i.test(p.categoryLabel) },
    ],
  },

  // Bebidas por tipo (champanhe fica junto com vinho; rum, tequila e gin em "Outras")
  bebidas: {
    allLabel: 'Todas as bebidas',
    filters: [
      { id: 'whisky', label: 'Whisky', match: (p) => nameStarts(p, 'whisky', 'whiskey') },
      { id: 'vodka', label: 'Vodka', match: (p) => nameStarts(p, 'vodka') },
      { id: 'vinho', label: 'Vinho e champanhe', match: (p) => nameStarts(p, 'vinho', 'vino', 'champagne', 'champanhe', 'espumante') },
      { id: 'licor', label: 'Licor', match: (p) => nameStarts(p, 'licor') },
      { id: 'outras', label: 'Outras', match: (p) => nameStarts(p, 'rum', 'ron', 'tequila', 'gin', 'cacha', 'cerveja') },
    ],
  },
};

export function getSubFilters(category: string) {
  return SUBFILTERS[category];
}

export function matchesSubFilter(p: Product, category: string, subId: string): boolean {
  if (subId === 'todos') return true;
  const f = SUBFILTERS[category]?.filters.find((x) => x.id === subId);
  return f ? f.match(p) : true;
}
