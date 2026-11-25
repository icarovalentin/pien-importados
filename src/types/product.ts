import type { MenuCategoryId, LegacyCategoryId } from '@/config/site';

export type ProductCategory = MenuCategoryId | LegacyCategoryId;
export type CategoryType = 'todos' | MenuCategoryId;

export type StockStatus = 'pronta_entrega' | 'encomenda';

export type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'pronta_first';

export interface ProductVariant {
  id: string;
  label: string;
  price?: number;
  /** Fotos próprias da variação (trocam a galeria quando selecionada) */
  images?: string[];
  /** Descrição própria da variação (substitui a do produto quando selecionada) */
  description?: string;
  /** Especificações próprias da variação */
  specs?: string[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  status: StockStatus;
  deliveryTime: string;
  images: string[];
  description: string;
  specs: string[];
  isFeatured?: boolean;
  batchCodeInfo?: string;
  variants?: ProductVariant[];
  createdAt?: string;
}
