'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';
import { MessageCircle, Plus, Check, ShieldCheck, Clock } from 'lucide-react';
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
      className="group relative flex flex-col bg-white dark:bg-dark-900/90 border border-zinc-200 dark:border-dark-800 rounded-2xl overflow-hidden hover:border-gold-500/50 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/60 transition-all duration-300 cursor-pointer shadow-sm"
    >
      {/* Imagem do Produto com Badges sobrepostos */}
      <div className="relative w-full aspect-square bg-zinc-100 dark:bg-dark-950 overflow-hidden">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Gradiente escuro sutil sobre a imagem */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 dark:from-dark-950/80 via-transparent to-transparent opacity-60" />

        {/* Badge Superior Esquerdo: Disponibilidade */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {isProntaEntrega ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 backdrop-blur-md shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Pronta-Entrega
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-950/90 text-amber-300 border border-amber-500/50 backdrop-blur-md shadow-md">
              <Clock className="w-3 h-3 text-amber-400" />
              Sob Encomenda
            </span>
          )}

          {/* Badge Original */}
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-dark-950/90 text-zinc-300 border border-dark-700/80 backdrop-blur-md">
            <ShieldCheck className="w-3 h-3 text-gold-400" />
            100% Original
          </span>
        </div>

        {/* Botão de Adicionar à Lista (canto superior direito) */}
        <button
          onClick={toggleInterest}
          title={inList ? 'Remover da lista de orçamento' : 'Adicionar à lista de orçamento'}
          className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all shadow-md ${
            inList
              ? 'bg-gold-500 text-dark-950 font-bold border border-gold-400 scale-105'
              : 'bg-white/90 text-zinc-700 dark:bg-dark-900/80 dark:text-zinc-300 border border-zinc-200 dark:border-dark-700 hover:border-gold-500/60 hover:text-black dark:hover:text-white'
          }`}
        >
          {inList ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Conteúdo textual */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 space-y-3">
        {/* Marca & Categoria */}
        <div className="flex items-center justify-between text-[11px] font-medium">
          <span className="text-gold-700 dark:text-gold-400 font-semibold uppercase tracking-wider">
            {product.brand}
          </span>
          <span className="truncate max-w-[140px] text-zinc-500 dark:text-zinc-400">
            {product.categoryLabel}
          </span>
        </div>

        {/* Nome do Produto */}
        <h3 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-white line-clamp-2 group-hover:text-gold-700 dark:group-hover:text-gold-300 transition-colors">
          {product.name}
        </h3>

        {/* Preço e Prazo */}
        <div className="pt-1 mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-zinc-400 dark:text-zinc-500 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
            <span className={isProntaEntrega ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600 dark:text-amber-400 font-medium'}>
              • {product.deliveryTime}
            </span>
          </p>
        </div>

        {/* Botão Principal: Pedir no WhatsApp */}
        <div className="pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white shadow-md shadow-emerald-950/20 dark:shadow-emerald-950/50 transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Pedir no WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
