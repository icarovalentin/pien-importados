import { Product, ProductVariant } from '@/types/product';
import { STORE_PHONE_NUMBER } from '@/data/products';
import { InterestItem } from '@/context/InterestListContext';

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Gera link do WhatsApp para consulta de um único produto (com variação opcional)
 */
export function getProductWhatsAppUrl(
  product: Product,
  variant?: ProductVariant,
  customPhone?: string
): string {
  const phone = customPhone || STORE_PHONE_NUMBER;
  const statusLabel =
    product.status === 'pronta_entrega' ? 'Pronta-entrega' : 'Sob encomenda';
  const unitPrice = variant?.price ?? product.price;

  const lines = [
    'Olá, *Pien Importados*!',
    '',
    'Gostaria de informações sobre este produto do catálogo:',
    `*Produto:* ${product.name}`,
    ...(variant ? [`*Opção escolhida:* ${variant.label}`] : []),
    `*Marca:* ${product.brand}`,
    `*Valor:* ${formatCurrency(unitPrice)}`,
    `*Disponibilidade:* ${statusLabel} (${product.deliveryTime})`,
    '',
    'Gostaria de saber sobre pagamento e entrega.',
  ];

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Gera link do WhatsApp para enviar uma lista com múltiplos itens e quantidades
 */
export function getInterestListWhatsAppUrl(
  items: InterestItem[],
  customPhone?: string
): string {
  const phone = customPhone || STORE_PHONE_NUMBER;
  const total = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  const lines = [
    'Olá, *Pien Importados*!',
    '',
    'Montei uma *Lista de Orçamento* pelo catálogo do site:',
    '',
    ...items.map((item, index) => {
      const statusText =
        item.product.status === 'pronta_entrega' ? 'Pronta-entrega' : 'Sob encomenda';
      const variantPart = item.variantLabel ? ` — ${item.variantLabel}` : '';
      const subtotal = formatCurrency(item.unitPrice * item.quantity);
      return `${index + 1}. *${item.quantity}x ${item.product.name}${variantPart}* (${statusText})\n   Subtotal: ${subtotal}`;
    }),
    '',
    `*Total estimado:* ${formatCurrency(total)}`,
    '',
    'Poderiam informar o frete e as opções de pagamento? Obrigado!',
  ];

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Link genérico de suporte do WhatsApp
 */
export function getGeneralSupportWhatsAppUrl(customPhone?: string): string {
  const phone = customPhone || STORE_PHONE_NUMBER;
  const text = 'Olá, *Pien Importados*! Gostaria de tirar dúvidas sobre os produtos do catálogo.';
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
