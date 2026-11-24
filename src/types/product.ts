export type CategoryType = 'todos' | 'perfumes' | 'eletronicos' | 'smartphones' | 'acessorios';

export type StockStatus = 'pronta_entrega' | 'encomenda';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'perfumes' | 'beleza' | 'eletronicos' | 'smartphones' | 'acessorios';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  status: StockStatus;
  deliveryTime: string; // Ex: 'Envio Imediato (em até 24h)' ou '10 a 15 dias úteis'
  images: string[];
  description: string;
  specs: string[];
  isFeatured?: boolean;
  batchCodeInfo?: string; // Ex: "Lote verificado nos EUA"
}
