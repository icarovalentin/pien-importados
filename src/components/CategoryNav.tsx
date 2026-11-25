'use client';

import React from 'react';
import { SortOption, StockStatus } from '@/types/product';

interface CategoryNavProps {
  selectedStock: 'todos' | StockStatus;
  setSelectedStock: (stock: 'todos' | StockStatus) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  totalProductsCount: number;
  prontaEntregaCount: number;
  encomendaCount: number;
}

export function CategoryNav({
  selectedStock,
  setSelectedStock,
  sortBy,
  setSortBy,
  totalProductsCount,
  prontaEntregaCount,
  encomendaCount,
}: CategoryNavProps) {
  return (
    <div className="border-b border-[#e5e0d5] dark:border-dark-800 pb-3 flex flex-wrap items-center justify-between gap-4">
      {/* Filtro de Estoque */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.12em]">
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

      {/* Ordenação */}
      <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400 ml-auto">
        <span className="hidden sm:inline">Ordenar:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          aria-label="Ordenar produtos"
          className="bg-transparent border-b border-[#d6d0c4] dark:border-dark-700 text-[#141414] dark:text-zinc-200 font-semibold py-0.5 pr-2 focus:outline-none focus:border-[#141414] dark:focus:border-gold-400 cursor-pointer"
        >
          <option value="featured" className="bg-[#fcfbf8] dark:bg-dark-900">
            Destaques
          </option>
          <option value="pronta_first" className="bg-[#fcfbf8] dark:bg-dark-900">
            Pronta-entrega primeiro
          </option>
          <option value="price_asc" className="bg-[#fcfbf8] dark:bg-dark-900">
            Menor preço
          </option>
          <option value="price_desc" className="bg-[#fcfbf8] dark:bg-dark-900">
            Maior preço
          </option>
        </select>
      </label>
    </div>
  );
}
