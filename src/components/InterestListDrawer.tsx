'use client';

import React from 'react';
import Image from 'next/image';
import { X, Trash2, MessageCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useInterestList } from '@/context/InterestListContext';
import { formatCurrency, getInterestListWhatsAppUrl } from '@/utils/whatsapp';

export function InterestListDrawer() {
  const { items, removeItem, clearList, isDrawerOpen, setIsDrawerOpen } = useInterestList();

  if (!isDrawerOpen) return null;

  const total = items.reduce((acc, item) => acc + item.price, 0);
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
                {items.length} {items.length === 1 ? 'peça selecionada' : 'peças selecionadas'}
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
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <div className="relative w-16 h-20 bg-[#f2efe8] dark:bg-dark-900 shrink-0 overflow-hidden">
                    <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#8b6508] dark:text-gold-400">
                      {item.brand}
                    </span>
                    <h5 className="text-sm font-display text-[#141414] dark:text-white truncate">{item.name}</h5>
                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <span className="font-semibold text-[#141414] dark:text-zinc-200">
                        {formatCurrency(item.price)}
                      </span>
                      <span className={`text-[10px] uppercase tracking-wider ${item.status === 'pronta_entrega' ? 'text-[#065f46] dark:text-emerald-400' : 'text-[#92400e] dark:text-amber-400'}`}>
                        {item.status === 'pronta_entrega' ? 'Pronta-entrega' : 'Encomenda'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
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
