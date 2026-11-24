'use client';

import React from 'react';
import { CategoryType, StockStatus } from '@/types/product';

interface CategoryNavProps {
  selectedCategory: CategoryType;
  setSelectedCategory: (cat: CategoryType) => void;
  selectedStock: 'todos' | StockStatus;
  setSelectedStock: (stock: 'todos' | StockStatus) => void;
  totalProductsCount: number;
  prontaEntregaCount: number;
  encomendaCount: number;
}

const CATEGORIES: { id: CategoryType; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'perfumes', label: 'Perfumaria' },
  { id: 'beleza', label: "Victoria's Secret" },
  { id: 'eletronicos', label: 'Som JBL' },
  { id: 'acessorios', label: 'Tech & Acessórios' },
];

export function CategoryNav({
  selectedCategory,
  setSelectedCategory,
  selectedStock,
  setSelectedStock,
  totalProductsCount,
  prontaEntregaCount,
  encomendaCount,
}: CategoryNavProps) {
  return (
    <div className="border-b border-[#e5e0d5] dark:border-dark-800 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Abas de Categorias */}
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs uppercase tracking-[0.14em] whitespace-nowrap pb-2 -mb-[13px] border-b-2 transition-colors ${
                isActive
                  ? 'border-[#141414] dark:border-gold-400 text-[#141414] dark:text-white font-semibold'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-[#141414] dark:hover:text-zinc-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Filtro de Estoque minimalista (sem emojis) */}
      <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.12em] shrink-0">
        <button
          onClick={() => setSelectedStock('todos')}
          className={`transition-colors ${
            selectedStock === 'todos'
              ? 'text-[#141414] dark:text-white font-semibold underline underline-offset-4'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-[#141414] dark:hover:text-white'
          }`}
        >
          Todos ({totalProductsCount})
        </button>

        <button
          onClick={() => setSelectedStock('pronta_entrega')}
          className={`flex items-center gap-1.5 transition-colors ${
            selectedStock === 'pronta_entrega'
              ? 'text-[#065f46] dark:text-emerald-400 font-semibold underline underline-offset-4'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-[#065f46] dark:hover:text-emerald-400'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          Pronta-entrega ({prontaEntregaCount})
        </button>

        <button
          onClick={() => setSelectedStock('encomenda')}
          className={`flex items-center gap-1.5 transition-colors ${
            selectedStock === 'encomenda'
              ? 'text-[#92400e] dark:text-amber-400 font-semibold underline underline-offset-4'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-[#92400e] dark:hover:text-amber-400'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
          Encomenda ({encomendaCount})
        </button>
      </div>
    </div>
  );
}
