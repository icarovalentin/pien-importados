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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-dark-900 border-l border-zinc-200 dark:border-dark-700 shadow-2xl flex flex-col transition-colors">
          {/* Header */}
          <div className="p-5 border-b border-zinc-200 dark:border-dark-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gold-500/10 text-gold-600 dark:text-gold-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white text-base">Lista de Interesse</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {items.length} {items.length === 1 ? 'item selecionado' : 'itens selecionados'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-xl text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-dark-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Itens */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-dark-800 flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Sua lista está vazia</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
                  Navegue pelo catálogo e clique no botão &quot;+&quot; para adicionar itens e cotar tudo de uma vez pelo WhatsApp.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-dark-850 border border-zinc-200 dark:border-dark-700"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-zinc-200 dark:bg-dark-950 shrink-0">
                    <Image src={item.images[0]} alt={item.name} fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-gold-700 dark:text-gold-400">
                      {item.brand}
                    </span>
                    <h5 className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{item.name}</h5>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {formatCurrency(item.price)}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {item.status === 'pronta_entrega' ? '🟢 Pronta' : '🟡 Encomenda'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
                    title="Remover da lista"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Rodapé e Botão de Envio WhatsApp */}
          {items.length > 0 && (
            <div className="p-5 border-t border-zinc-200 dark:border-dark-800 bg-zinc-50 dark:bg-dark-950/80 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">Total Estimado:</span>
                <span className="text-xl font-extrabold text-gold-700 dark:text-gold-400">{formatCurrency(total)}</span>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-950/20 dark:shadow-emerald-950/60 active:scale-[0.98] transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Enviar Lista Completa no WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={clearList}
                className="w-full text-center text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 py-1 transition-colors"
              >
                Limpar lista
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
