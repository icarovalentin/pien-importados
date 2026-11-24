'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';
import { X, MessageCircle, ShieldCheck, Check, Plus, Clock } from 'lucide-react';
import { formatCurrency, getProductWhatsAppUrl } from '@/utils/whatsapp';
import { useInterestList } from '@/context/InterestListContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addItem, removeItem, isInList } = useInterestList();

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const inList = isInList(product.id);
  const whatsappUrl = getProductWhatsAppUrl(product);
  const isProntaEntrega = product.status === 'pronta_entrega';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-[#fcfbf8] dark:bg-[#111116] border border-[#e5e0d5] dark:border-dark-700 overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row max-h-[90vh]">
        <button
          onClick={onClose}
          aria-label="Fechar detalhes"
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 text-[#141414] hover:bg-[#141414] hover:text-white dark:bg-dark-900 dark:text-zinc-300 dark:hover:text-white border border-[#e5e0d5] dark:border-dark-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lado Esquerdo: Galeria */}
        <div className="w-full md:w-1/2 bg-[#f2efe8] dark:bg-dark-950 flex flex-col items-center justify-center p-6">
          <div className="relative w-full aspect-[4/5] bg-[#ebe6dc] dark:bg-dark-900 overflow-hidden">
            <Image
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 mt-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-14 h-14 overflow-hidden border transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#141414] dark:border-gold-400 opacity-100'
                      : 'border-[#d6d0c4] dark:border-dark-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lado Direito: Detalhes */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto space-y-5">
          <div className="space-y-1.5 pr-6">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
              <span className="font-semibold text-[#8b6508] dark:text-gold-400">
                {product.brand}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">·</span>
              <span className="text-zinc-500 dark:text-zinc-400">
                {product.categoryLabel}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-display font-normal text-[#141414] dark:text-white leading-snug">
              {product.name}
            </h2>
          </div>

          {/* Preço & Disponibilidade */}
          <div className="py-3 border-y border-[#e5e0d5] dark:border-dark-800 space-y-1.5">
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-semibold text-[#141414] dark:text-white">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-zinc-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-xs flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-[#8b6508] dark:text-gold-400" />
              <span className={isProntaEntrega ? 'text-[#065f46] dark:text-emerald-400 font-medium' : 'text-[#92400e] dark:text-amber-400 font-medium'}>
                {isProntaEntrega ? 'Pronta-entrega' : 'Sob encomenda'}
              </span>
              <span className="text-zinc-400">·</span>
              <span>{product.deliveryTime}</span>
            </p>
          </div>

          {/* Descrição */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400 mb-1.5">
              Sobre o produto
            </h4>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Especificações */}
          {product.specs && product.specs.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400 mb-2">
                Especificações
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                {product.specs.map((spec, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#8b6508] dark:bg-gold-400 shrink-0" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Garantia */}
          {product.batchCodeInfo && (
            <div className="p-3.5 bg-[#f6f3ec] dark:bg-dark-900 border border-[#e5e0d5] dark:border-dark-800 flex items-start gap-2.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#8b6508] dark:text-gold-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#141414] dark:text-white">Procedência Garantida</p>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">{product.batchCodeInfo}</p>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="pt-2 space-y-2.5 mt-auto">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#065f46] hover:bg-[#047857] text-white text-xs uppercase tracking-[0.16em] font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Pedir no WhatsApp</span>
            </a>

            <button
              onClick={() => {
                if (inList) removeItem(product.id);
                else addItem(product);
              }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 text-[11px] uppercase tracking-[0.14em] font-semibold border transition-colors ${
                inList
                  ? 'bg-[#141414] text-[#d4af37] border-[#141414] dark:bg-gold-500 dark:text-[#0c0c0f] dark:border-gold-500'
                  : 'bg-transparent text-[#141414] dark:text-zinc-200 border-[#d6d0c4] dark:border-dark-700 hover:border-[#141414] dark:hover:border-gold-400'
              }`}
            >
              {inList ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Na sua lista de orçamento</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar à lista de orçamento</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
