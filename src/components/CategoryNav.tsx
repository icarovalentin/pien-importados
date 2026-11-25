'use client';

import React from 'react';
import { SortOption, StockStatus } from '@/types/product';
import type { SubFilter } from '@/utils/subfilters';

interface CategoryNavProps {
  selectedStock: 'todos' | StockStatus;
  setSelectedStock: (stock: 'todos' | StockStatus) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  /** filtros da categoria atual (marca, tipo, gênero...). Definidos em src/utils/subfilters.ts */
  subFilters?: { allLabel: string; filters: SubFilter[] };
  selectedSub?: string;
  setSelectedSub?: (id: string) => void;
  totalProductsCount: number;
  prontaEntregaCount: number;
  encomendaCount: number;
}

/** Barra de filtros da vitrine: disponibilidade + ordenação (as categorias ficam no menu do topo). */
export function CategoryNav({
  subFilters,
  selectedSub = 'todos',
  setSelectedSub,
  selectedStock,
  setSelectedStock,
  sortBy,
  setSortBy,
  totalProductsCount,
  prontaEntregaCount,
  encomendaCount,
}: CategoryNavProps) {
  const chips: { id: 'todos' | StockStatus; label: string; count: number; dot?: string }[] = [
    { id: 'todos', label: 'Todos', count: totalProductsCount },
    { id: 'pronta_entrega', label: 'Pronta-entrega', count: prontaEntregaCount, dot: 'bg-emerald-600 dark:bg-emerald-400' },
    { id: 'encomenda', label: 'Encomenda', count: encomendaCount, dot: 'bg-amber-600 dark:bg-amber-400' },
  ];

  const subs = subFilters ? [{ id: 'todos', label: subFilters.allLabel }, ...subFilters.filters.map((f) => ({ id: f.id, label: f.label }))] : [];

  const chipCls = (active: boolean) =>
    `shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full border text-xs transition-colors ${
      active
        ? 'bg-[#141414] text-white border-[#141414] font-semibold dark:bg-gold-500 dark:text-[#0c0c0f] dark:border-gold-500'
        : 'text-zinc-600 dark:text-zinc-300 border-[#ddd7ca] dark:border-dark-700 hover:border-[#141414] dark:hover:border-gold-400'
    }`;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 border-b border-[#e5e0d5] dark:border-dark-800 pb-3">
      <div className="w-full sm:flex-1 min-w-0 flex flex-col gap-2">
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {chips.map((chip) => {
          const active = selectedStock === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setSelectedStock(chip.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full border text-xs transition-colors ${
                active
                  ? 'bg-[#141414] text-white border-[#141414] font-semibold dark:bg-gold-500 dark:text-[#0c0c0f] dark:border-gold-500'
                  : 'text-zinc-600 dark:text-zinc-300 border-[#ddd7ca] dark:border-dark-700 hover:border-[#141414] dark:hover:border-gold-400'
              }`}
            >
              {chip.dot && <span className={`w-1.5 h-1.5 rounded-full ${chip.dot}`} />}
              {chip.label}
              <span className={active ? 'opacity-80' : 'text-zinc-400'}>({chip.count})</span>
            </button>
          );
        })}
      </div>
      {subFilters && setSelectedSub && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none" role="group" aria-label="Filtrar por tipo">
          {subs.map((g) => (
            <button key={g.id} onClick={() => setSelectedSub(g.id)} aria-pressed={selectedSub === g.id} className={chipCls(selectedSub === g.id)}>
              {g.label}
            </button>
          ))}
        </div>
      )}
      </div>

      <label className="shrink-0 self-end sm:self-auto flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="hidden sm:inline">Ordenar:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          aria-label="Ordenar produtos"
          className="bg-transparent border border-[#ddd7ca] dark:border-dark-700 rounded-full text-[#141414] dark:text-zinc-200 text-xs font-semibold py-1.5 pl-3 pr-2 focus:outline-none focus:border-[#141414] dark:focus:border-gold-400 cursor-pointer"
        >
          <option value="featured" className="bg-[#fcfbf8] dark:bg-dark-900">Destaques</option>
          <option value="pronta_first" className="bg-[#fcfbf8] dark:bg-dark-900">Pronta-entrega primeiro</option>
          <option value="price_asc" className="bg-[#fcfbf8] dark:bg-dark-900">Menor preço</option>
          <option value="price_desc" className="bg-[#fcfbf8] dark:bg-dark-900">Maior preço</option>
        </select>
      </label>
    </div>
  );
}
