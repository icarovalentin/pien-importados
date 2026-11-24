'use client';

import React from 'react';
import { ShieldCheck, Truck, Clock, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  onSelectProntaEntrega: () => void;
  onSelectEncomenda: () => void;
}

export function HeroBanner({ onSelectProntaEntrega, onSelectEncomenda }: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden pt-8 pb-10 border-b border-zinc-200 dark:border-dark-800 bg-slate-50/70 dark:bg-transparent transition-colors">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          {/* Badge superior */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-dark-900 border border-gold-500/40 text-gold-700 dark:text-gold-400 text-xs font-semibold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            Catálogo Oficial de Importados
          </div>

          {/* Título principal */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
            O Melhor dos Importados,{' '}
            <span className="gold-gradient-text block sm:inline">
              Direto no Seu WhatsApp.
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Victoria&apos;s Secret, Perfumaria Fina, Caixas de Som JBL e Eletrônicos Premium. 
            Sem intermediários: consulte disponibilidade, tire dúvidas e feche direto com a gente.
          </p>

          {/* Botões de Acesso Rápido por Estoque */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onSelectProntaEntrega}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/40 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              Ver Produtos à Pronta-Entrega (Envio 24h)
            </button>

            <button
              onClick={onSelectEncomenda}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-500/40 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs sm:text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
            >
              <Clock className="w-4 h-4 text-amber-500" />
              Ver Itens Sob Encomenda Exclusiva
            </button>
          </div>
        </div>

        {/* 3 Pilares Rápidos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-8 mt-6 border-t border-zinc-200 dark:border-dark-800/80">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-dark-900/60 border border-zinc-200 dark:border-dark-800 shadow-sm">
            <div className="p-2 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">100% Originais & Lacrados</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Procedência dos EUA e Europa</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-dark-900/60 border border-zinc-200 dark:border-dark-800 shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">Estoque Pronta-Entrega</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Postagem em até 24h úteis</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-dark-900/60 border border-zinc-200 dark:border-dark-800 shadow-sm">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">Encomendas Especiais</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Trazemos o modelo que você procura</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
