/**
 * ============================================================================
 *  CONFIGURAÇÃO DA LOJA: é aqui que você mexe no menu, nas categorias e nos textos.
 * ============================================================================
 *
 *  COMO ADICIONAR UMA CATEGORIA NOVA (3 passos):
 *   1. Acrescente uma linha na lista CATEGORIES abaixo (id sem acento e minúsculo).
 *   2. Rode no Supabase o arquivo supabase/add-categorias.sql depois de incluir o novo id
 *      na lista que está dentro dele (é uma linha só).
 *   3. Pronto: o menu do site, o menu do celular, o painel /admin e a API passam a aceitar.
 *
 *  A ORDEM da lista é a ordem em que as categorias aparecem no menu.
 *  Para esconder uma categoria do menu sem apagar, basta remover a linha (produtos antigos
 *  continuam existindo no banco).
 */

export interface CategoryDef {
  /** identificador interno (sem acento, minúsculo). Vai para o banco de dados. */
  id: string;
  /** nome que aparece no menu */
  label: string;
  /** true = mostra aviso "venda proibida para menores de 18 anos" na categoria */
  adultOnly?: boolean;
}

export const CATEGORIES = [
  { id: 'farmacia', label: 'Farmácia' },
  { id: 'perfumes', label: 'Perfumaria' },
  { id: 'arabes', label: 'Perfumaria Árabe' },
  { id: 'bebidas', label: 'Bebidas', adultOnly: true },
  { id: 'smartphones', label: 'Smartphones' },
  { id: 'eletronicos', label: 'Eletrônicos' },
  { id: 'acessorios', label: 'Tech & Acessórios' },
] as const satisfies readonly CategoryDef[];

/** Nome do primeiro item do menu (mostra todos os produtos). */
export const HOME_LABEL = 'Novidades';

/** Categorias antigas que continuam válidas no banco, mas não aparecem no menu. */
export const LEGACY_CATEGORY_IDS = ['beleza'] as const;

export const DEFAULT_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';

export const SITE = {
  name: 'PIEN',
  tagline: 'Importados',
  /** faixa preta no topo (versão completa no computador, curta no celular) */
  announcement: 'Originais com procedência verificada · Pronta-entrega em 24h · Atendimento direto',
  announcementShort: 'Originais · Pronta-entrega 24h · Atendimento direto',
  /** aviso exibido nas categorias marcadas como adultOnly */
  adultNotice: 'Venda e entrega proibidas para menores de 18 anos. Beba com moderação.',
  /** aviso exibido na categoria farmácia */
  pharmacyNotice:
    'Medicamento sujeito a prescrição médica. Venda e retirada exclusivas no Paraguai — consulte as exigências sanitárias antes de encomendar.',
};

export type MenuCategoryId = (typeof CATEGORIES)[number]['id'];
export type LegacyCategoryId = (typeof LEGACY_CATEGORY_IDS)[number];

/** Todos os ids aceitos pelo banco/API. */
export const ALL_PRODUCT_CATEGORY_IDS: string[] = [
  ...CATEGORIES.map((c) => c.id),
  ...LEGACY_CATEGORY_IDS,
];

export function getCategoryLabel(id: string): string {
  if (id === 'todos') return HOME_LABEL;
  return (CATEGORIES as readonly CategoryDef[]).find((c) => c.id === id)?.label ?? id;
}

export function isAdultCategory(id: string): boolean {
  return Boolean((CATEGORIES as readonly CategoryDef[]).find((c) => c.id === id)?.adultOnly);
}

export function getCategoryNotice(id: string): string | null {
  if (isAdultCategory(id)) return SITE.adultNotice;
  if (id === 'farmacia') return SITE.pharmacyNotice;
  return null;
}
