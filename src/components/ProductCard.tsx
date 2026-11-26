'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';
import { DEFAULT_PRODUCT_IMAGE, isAdultCategory, SITE } from '@/config/site';
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

  const defaultVariant =
    product.variants && product.variants.length > 0 ? product.variants[0] : undefined;
  const hasVariants = Boolean(product.variants && product.variants.length > 0);
  const hasMultipleVariants = Boolean(product.variants && product.variants.length > 1);
  const inList = isInList(product.id);
  const whatsappUrl = getProductWhatsAppUrl(product, defaultVariant);
  const isProntaEntrega = product.status === 'pronta_entrega';
  const coverImage = product.images?.[0] || DEFAULT_PRODUCT_IMAGE;
  const isAdult = isAdultCategory(product.category);
  const isPharmacy = product.category === 'farmacia';
  const variantPrices = (product.variants || []).map((v) => v.price ?? product.price);
  const hasPriceRange = variantPrices.length > 1 && new Set(variantPrices).size > 1;
  const displayPrice = hasPriceRange
    ? Math.min(...variantPrices)
    : defaultVariant?.price ?? product.price;

  const handleListAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasMultipleVariants) {
      onOpenModal(product);
      return;
    }
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
      {/* Fotografia limpa sem corte */}
      <div className="relative w-full aspect-[3/4] bg-[#fcfbf8] dark:bg-white border border-[#ece7dc] dark:border-dark-800 overflow-hidden">
        <Image
          src={coverImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          quality={90}
          className="object-contain object-center p-2 mix-blend-multiply dark:mix-blend-normal brightness-[1.05] group-hover:scale-[1.04] transition-transform duration-700 ease-out"
        />

        {(isAdult || isPharmacy) && (
          <span
            title={isAdult ? SITE.adultNotice : SITE.pharmacyNotice}
            className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] font-semibold bg-[#fbf3e4]/95 text-[#92400e] border border-[#ecd9b0]"
          >
            {isAdult ? '+18' : 'PY · Prescrição'}
          </span>
        )}

        {/* Botão discreto de lista/opções no canto inferior direito */}
        <button
          onClick={handleListAction}
          title={
            hasMultipleVariants
              ? 'Escolher opção'
              : inList
                ? 'Remover da lista'
                : 'Adicionar à lista de orçamento'
          }
          className={`absolute bottom-2 right-2 sm:bottom-3 sm:right-3 px-2 py-1 sm:px-2.5 sm:py-1.5 text-[9px] sm:text-[10px] uppercase tracking-[0.12em] font-semibold transition-all ${
            inList
              ? 'bg-[#141414] text-[#d4af37] dark:bg-gold-500 dark:text-[#0c0c0f]'
              : 'bg-white/95 text-[#141414] hover:bg-[#141414] hover:text-white dark:bg-dark-950/90 dark:text-zinc-100 dark:hover:bg-gold-500 dark:hover:text-[#0c0c0f] shadow-sm border border-[#ece7dc] dark:border-dark-700'
          }`}
        >
          {inList ? 'Na lista' : hasMultipleVariants ? 'Ver opções' : '+ Lista'}
        </button>
      </div>

      {/* Informações editoriais soltas abaixo da imagem */}
      <div className="flex flex-col flex-1 space-y-1.5">
        <div className="flex items-center justify-between gap-2 text-[9px] sm:text-[10px] uppercase tracking-[0.12em] sm:tracking-[0.15em]">
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

        <h3 className="text-[13px] sm:text-[15px] font-display text-[#141414] dark:text-zinc-100 leading-snug line-clamp-2 group-hover:text-zinc-600 dark:group-hover:text-white transition-colors">
          {product.name}
        </h3>

        {hasVariants && (
          <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
            {product.variants!.length}{' '}
            {product.variants!.length === 1 ? 'opção' : 'opções'}
          </p>
        )}

        <div className="pt-1 mt-auto space-y-2">
          <div className="flex flex-wrap items-baseline gap-x-2">
            {hasPriceRange && (
              <span className="w-full text-[10px] uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-400">
                a partir de
              </span>
            )}
            <span className="text-[15px] sm:text-base font-semibold text-[#141414] dark:text-white">
              {formatCurrency(displayPrice)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-zinc-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          {hasMultipleVariants ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenModal(product);
              }}
              className="w-full py-2 text-[11px] uppercase tracking-[0.12em] font-semibold text-[#065f46] dark:text-emerald-400 border border-[#065f46]/50 dark:border-emerald-400/50 hover:bg-[#065f46] hover:text-white dark:hover:bg-emerald-500 dark:hover:text-[#0c0c0f] transition-colors"
            >
              Pedir
            </button>
          ) : (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="block w-full text-center py-2 text-[11px] uppercase tracking-[0.12em] font-semibold text-[#065f46] dark:text-emerald-400 border border-[#065f46]/50 dark:border-emerald-400/50 hover:bg-[#065f46] hover:text-white dark:hover:bg-emerald-500 dark:hover:text-[#0c0c0f] transition-colors"
            >
              Pedir
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
