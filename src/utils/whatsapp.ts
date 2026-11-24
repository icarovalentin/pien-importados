import { Product } from '@/types/product';
import { STORE_PHONE_NUMBER } from '@/data/products';

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Gera link do WhatsApp para consulta de um único produto
 */
export function getProductWhatsAppUrl(product: Product, customPhone?: string): string {
  const phone = customPhone || STORE_PHONE_NUMBER;
  const statusLabel = product.status === 'pronta_entrega' 
    ? '🟢 PRONTA-ENTREGA' 
    : '🟡 SOB ENCOMENDA';

  const text = [
    `Olá, *Pien Importados*! 👋`,
    ``,
    `Gostaria de informações sobre este produto do site:`,
    `📦 *${product.name}*`,
    `🏷️ *Marca:* ${product.brand}`,
    `💰 *Valor:* ${formatCurrency(product.price)}`,
    `⚡ *Disponibilidade:* ${statusLabel} (${product.deliveryTime})`,
    ``,
    `Gostaria de saber como fechar o pedido ou verificar a disponibilidade! 🛍️`
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Gera link do WhatsApp para enviar uma lista com múltiplos itens
 */
export function getInterestListWhatsAppUrl(products: Product[], customPhone?: string): string {
  const phone = customPhone || STORE_PHONE_NUMBER;
  const total = products.reduce((acc, p) => acc + p.price, 0);

  const lines = [
    `Olá, *Pien Importados*! 👋`,
    ``,
    `Montei uma *Lista de Interesse* pelo catálogo do site e gostaria de cotar/fechar esses itens:`,
    ``,
    ...products.map((p, index) => {
      const statusEmoji = p.status === 'pronta_entrega' ? '🟢 Pronta-Entrega' : '🟡 Sob Encomenda';
      return `${index + 1}. *${p.name}* (${statusEmoji})\n   ↳ ${formatCurrency(p.price)}`;
    }),
    ``,
    `💰 *Total Estimado:* ${formatCurrency(total)}`,
    ``,
    `Poderiam me passar o valor do frete e opções de pagamento? Obrigado!`
  ];

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Link genérico de suporte do WhatsApp
 */
export function getGeneralSupportWhatsAppUrl(customPhone?: string): string {
  const phone = customPhone || STORE_PHONE_NUMBER;
  const text = `Olá, *Pien Importados*! Gostaria de tirar algumas dúvidas sobre os produtos importados.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
