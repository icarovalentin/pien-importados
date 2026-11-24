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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-dark-900 border border-zinc-200 dark:border-dark-700 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row max-h-[90vh]">
        {/* Fechar botão */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-100 text-zinc-600 hover:text-black dark:bg-dark-950/80 dark:text-zinc-400 dark:hover:text-white border border-zinc-200 dark:border-dark-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lado Esquerdo: Imagens */}
        <div className="w-full md:w-1/2 bg-zinc-50 dark:bg-dark-950 flex flex-col items-center justify-center p-6 relative">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-zinc-200 dark:border-dark-800">
            <Image
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md ${
                  isProntaEntrega
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                    : 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                }`}
              >
                {isProntaEntrega ? '🟢 Pronta-Entrega' : '🟡 Sob Encomenda'}
              </span>
            </div>
          </div>

          {/* Miniaturas se houver mais de uma */}
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === idx ? 'border-gold-500' : 'border-zinc-300 dark:border-dark-700 opacity-60'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lado Direito: Informações & Ações */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-700 dark:text-gold-400">
              {product.brand} • {product.categoryLabel}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mt-1">
              {product.name}
            </h2>
          </div>

          {/* Preço e Entrega */}
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-dark-850 border border-zinc-200 dark:border-dark-700/80">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-zinc-400 dark:text-zinc-500 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400" />
              <span>Prazo: <strong>{product.deliveryTime}</strong></span>
            </p>
          </div>

          {/* Descrição */}
          <div>
            <h4 className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 tracking-wider mb-1">
              Sobre o Produto
            </h4>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Especificações Técnicas */}
          {product.specs && product.specs.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400 tracking-wider mb-2">
                Especificações
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                {product.specs.map((spec, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400 shrink-0" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Box de Autenticidade / Batch Code */}
          {product.batchCodeInfo && (
            <div className="p-3 rounded-xl bg-gold-50 dark:bg-gold-500/10 border border-gold-200 dark:border-gold-500/30 flex items-start gap-2.5 text-xs text-gold-900 dark:text-gold-300">
              <ShieldCheck className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-gold-800 dark:text-gold-400">Garantia de Autenticidade</p>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-0.5">{product.batchCodeInfo}</p>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="pt-2 space-y-2 mt-auto">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white shadow-xl shadow-emerald-950/20 dark:shadow-emerald-950/60 transition-all"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Pedir Agora no WhatsApp</span>
            </a>

            <button
              onClick={() => {
                if (inList) removeItem(product.id);
                else addItem(product);
              }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all ${
                inList
                  ? 'bg-gold-50 dark:bg-gold-500/20 text-gold-800 dark:text-gold-300 border-gold-300 dark:border-gold-500/40'
                  : 'bg-zinc-100 dark:bg-dark-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-dark-700 hover:border-gold-500/50 hover:text-black dark:hover:text-white'
              }`}
            >
              {inList ? (
                <>
                  <Check className="w-4 h-4 text-gold-600 dark:text-gold-400" />
                  <span>Item na sua lista de orçamento</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
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
