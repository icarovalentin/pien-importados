'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';
import { MessageCircle, Plus, Check, ShieldCheck, Clock, ArrowUpRight } from 'lucide-react';
import { formatCurrency, getProductWhatsAppUrl } from '@/utils/whatsapp';
import { useInterestList } from '@/context/InterestListContext';

interface ProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
}

export function ProductCard({ product, onOpenModal }: ProductCardProps) {
  const { addItem, removeItem, isInList } = useInterestList();
  const inList = isInList(product.id);
  const whatsappUrl = getProductWhatsAppUrl(product);

  const toggleInterest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inList) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  const isProntaEntrega = product.status === 'pronta_entrega';

  return (
    <div
      onClick={() => onOpenModal(product)}
      className="group relative flex flex-col bg-white dark:bg-dark-900 border border-zinc-100 dark:border-dark-800 rounded-2xl overflow-hidden hover:border-gold-500/40 dark:hover:border-gold-500/30 hover:shadow-2xl hover:shadow-black/8 dark:hover:shadow-black/50 transition-all duration-300 cursor-pointer"
    >
      {/* Imagem do Produto */}
      <div className="relative w-full aspect-[4/5] bg-zinc-50 dark:bg-dark-950 overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-[1.04] transition-transform duration-500 ease-out"
        />

        {/* Overlay gradiente — sutil, só na parte de baixo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-70" />

        {/* Badge de Disponibilidade — canto superior esquerdo */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {isProntaEntrega ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 text-emerald-300 border border-emerald-500/40 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Pronta-Entrega
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 text-amber-300 border border-amber-500/40 backdrop-blur-sm">
              <Clock className="w-2.5 h-2.5" />
              Sob Encomenda
            </span>
          )}
        </div>

        {/* Badge Original — canto superior esquerdo, embaixo */}
        <div className="absolute top-9 left-2.5 mt-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold bg-black/60 text-zinc-300 backdrop-blur-sm border border-white/10">
            <ShieldCheck className="w-2.5 h-2.5 text-gold-400" />
            100% Original
          </span>
        </div>

        {/* Botão Adicionar à Lista — canto superior direito */}
        <button
          onClick={toggleInterest}
          title={inList ? 'Remover da lista' : 'Adicionar à lista de orçamento'}
          className={`absolute top-2.5 right-2.5 p-2 rounded-xl backdrop-blur-sm transition-all duration-200 shadow-lg ${
            inList
              ? 'bg-gold-500 text-dark-950 border border-gold-400 scale-105'
              : 'bg-black/60 text-white border border-white/20 hover:bg-black/80 hover:border-gold-400/60'
          }`}
        >
          {inList ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
        </button>

        {/* Ícone de expandir — aparece no hover, canto inferior direito */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="p-1.5 rounded-lg bg-white/90 dark:bg-dark-900/90 backdrop-blur-sm shadow-md">
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
          </div>
        </div>
      </div>

      {/* Conteúdo textual */}
      <div className="flex flex-col flex-1 p-4 space-y-2.5">
        {/* Marca */}
        <span className="text-[10px] font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">
          {product.brand}
        </span>

        {/* Nome do Produto — fonte display/serif para premium feel */}
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-zinc-700 dark:group-hover:text-white transition-colors font-display">
          {product.name}
        </h3>

        {/* Preço + prazo */}
        <div className="mt-auto pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-zinc-900 dark:text-white">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-zinc-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          <p className={`text-[10px] font-medium mt-0.5 ${
            isProntaEntrega ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
          }`}>
            {product.deliveryTime}
          </p>
        </div>

        {/* Botão WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white shadow-sm shadow-emerald-900/20 transition-all"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-white" />
          Pedir no WhatsApp
        </a>
      </div>
    </div>
  );
}
