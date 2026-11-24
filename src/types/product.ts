export type CategoryType = 'todos' | 'perfumes' | 'eletronicos' | 'smartphones' | 'acessorios';

export type StockStatus = 'pronta_entrega' | 'encomenda';

export type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'pronta_first';

export interface ProductVariant {
  id: string;
  label: string;
  price?: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'perfumes' | 'beleza' | 'eletronicos' | 'smartphones' | 'acessorios';
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
