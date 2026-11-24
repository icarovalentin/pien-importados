'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';
import { formatCurrency, getProductWhatsAppUrl } from '@/utils/whatsapp';
import { makeInterestKey, useInterestList } from '@/context/InterestListContext';
import { useToast } from '@/context/ToastContext';

interface ProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
}

export function ProductCard({ product, onOpenModal }: ProductCardProps) {
  const { addItem, removeItem, isInList } = useInterestList();
  const { showToast } = useToast();

  const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : undefined;
  const inList = isInList(product.id);
  const whatsappUrl = getProductWhatsAppUrl(product, defaultVariant);
  const isProntaEntrega = product.status === 'pronta_entrega';
  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const displayPrice = defaultVariant?.price ?? product.price;

  const toggleInterest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inList) {
      removeItem(makeInterestKey(product.id, defaultVariant?.label));
      showToast('Item removido da lista de orçamento.');
    } else {
      addItem(product, defaultVariant);
      showToast('Adicionado à lista de orçamento.');
    }
  };

  return (
    <article
      onClick={() => onOpenModal(product)}
      className="group flex flex-col cursor-pointer space-y-3"
    >
      {/* Fotografia limpa sem borda de caixa */}
      <div className="relative w-full aspect-[3/4] bg-[#f2efe8] dark:bg-dark-900 overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-700 ease-out"
        />

        {/* Botão discreto de lista no canto inferior direito */}
        <button
          onClick={toggleInterest}
          title={inList ? 'Remover da lista' : 'Adicionar à lista de orçamento'}
          className={`absolute bottom-3 right-3 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.14em] font-semibold transition-all ${
            inList
              ? 'bg-[#141414] text-[#d4af37] dark:bg-gold-500 dark:text-[#0c0c0f]'
              : 'bg-white/95 text-[#141414] hover:bg-[#141414] hover:text-white dark:bg-dark-950/90 dark:text-zinc-100 dark:hover:bg-gold-500 dark:hover:text-[#0c0c0f] shadow-sm'
          }`}
        >
          {inList ? 'Na lista' : '+ Lista'}
        </button>
      </div>

      {/* Informações editoriais soltas abaixo da imagem */}
      <div className="flex flex-col flex-1 space-y-1.5">
        <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.15em]">
          <span className="font-semibold text-[#8b6508] dark:text-gold-400 truncate">
            {product.brand}
          </span>
          <span
            className={`shrink-0 font-medium ${
              isProntaEntrega
                ? 'text-[#065f46] dark:text-emerald-400'
                : 'text-[#92400e] dark:text-amber-400'
            }`}
          >
            {isProntaEntrega ? '24h' : 'Encomenda'}
          </span>
        </div>

        <h3 className="text-sm sm:text-[15px] font-display text-[#141414] dark:text-zinc-100 leading-snug line-clamp-2 group-hover:text-zinc-600 dark:group-hover:text-white transition-colors">
          {product.name}
        </h3>

        {hasVariants && (
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
            {product.variants!.length}{' '}
            {product.variants!.length === 1 ? 'opção disponível' : 'opções disponíveis'}
          </p>
        )}

        <div className="pt-1 mt-auto flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-[#141414] dark:text-white">
              {formatCurrency(displayPrice)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-zinc-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#065f46] dark:text-emerald-400 hover:underline underline-offset-4 shrink-0"
          >
            Pedir &rarr;
          </a>
        </div>
      </div>
    </article>
  );
}
