'use client';

import React from 'react';
import Image from 'next/image';
import { X, Trash2, MessageCircle, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { useInterestList } from '@/context/InterestListContext';
import { formatCurrency, getInterestListWhatsAppUrl } from '@/utils/whatsapp';

export function InterestListDrawer() {
  const {
    items,
    totalCount,
    removeItem,
    updateQuantity,
    clearList,
    isDrawerOpen,
    setIsDrawerOpen,
  } = useInterestList();

  if (!isDrawerOpen) return null;

  const total = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const whatsappUrl = getInterestListWhatsAppUrl(items);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#fcfbf8] dark:bg-[#111116] border-l border-[#e5e0d5] dark:border-dark-800 shadow-2xl flex flex-col transition-colors">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#e5e0d5] dark:border-dark-800 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg text-[#141414] dark:text-white">Lista de Orçamento</h3>
              <p className="text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {totalCount} {totalCount === 1 ? 'unidade selecionada' : 'unidades selecionadas'}
              </p>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Fechar lista"
              className="p-2 text-zinc-500 hover:text-[#141414] dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Itens */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#ece7dc] dark:divide-dark-800">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <ShoppingBag className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                <h4 className="text-base font-display text-[#141414] dark:text-white">Sua lista está vazia</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed">
                  Selecione &ldquo;+ Lista&rdquo; nos produtos desejados para enviar um único pedido de orçamento pelo WhatsApp.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.key} className="flex items-start gap-4 py-4">
                  <div className="relative w-16 h-20 bg-[#fcfbf8] dark:bg-white shrink-0 overflow-hidden">
                    <Image
                      src={
                        item.product.variants?.find((v) => v.label === item.variantLabel)?.images?.[0] ||
                        item.product.images[0]
                      }
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      className="object-contain mix-blend-multiply dark:mix-blend-normal brightness-[1.05]"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#8b6508] dark:text-gold-400">
                      {item.product.brand}
                    </span>
                    <h5 className="text-sm font-display text-[#141414] dark:text-white truncate">
                      {item.product.name}
                    </h5>
                    {item.variantLabel && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Opção: {item.variantLabel}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-1.5 gap-2">
                      {/* Controle de Quantidade */}
                      <div className="inline-flex items-center border border-[#d6d0c4] dark:border-dark-700">
                        <button
                          onClick={() => updateQuantity(item.key, -1)}
                          aria-label="Diminuir quantidade"
                          className="p-1 text-zinc-600 dark:text-zinc-300 hover:bg-[#f2efe8] dark:hover:bg-dark-800"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-[#141414] dark:text-white tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.key, 1)}
                          aria-label="Aumentar quantidade"
                          className="p-1 text-zinc-600 dark:text-zinc-300 hover:bg-[#f2efe8] dark:hover:bg-dark-800"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-[#141414] dark:text-zinc-200">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.key)}
                    className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Remover da lista"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Rodapé */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#e5e0d5] dark:border-dark-800 bg-[#f6f3ec] dark:bg-dark-900/80 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                  Total estimado
                </span>
                <span className="text-xl font-semibold text-[#141414] dark:text-white">
                  {formatCurrency(total)}
                </span>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#065f46] hover:bg-[#047857] text-white text-xs uppercase tracking-[0.16em] font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Enviar Lista no WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={clearList}
                className="w-full text-center text-[11px] uppercase tracking-[0.14em] text-zinc-500 hover:text-[#141414] dark:hover:text-white py-1 transition-colors"
              >
                Limpar seleção
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
