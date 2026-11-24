'use client';

import React from 'react';
import { CategoryType, StockStatus } from '@/types/product';
import { Sparkles, Flame, Heart, Volume2, Zap } from 'lucide-react';

interface CategoryNavProps {
  selectedCategory: CategoryType;
  setSelectedCategory: (cat: CategoryType) => void;
  selectedStock: 'todos' | StockStatus;
  setSelectedStock: (stock: 'todos' | StockStatus) => void;
  totalProductsCount: number;
  prontaEntregaCount: number;
  encomendaCount: number;
}

export function CategoryNav({
  selectedCategory,
  setSelectedCategory,
  selectedStock,
  setSelectedStock,
  totalProductsCount,
  prontaEntregaCount,
  encomendaCount,
}: CategoryNavProps) {
  const categories: { id: CategoryType; label: string; icon: React.ReactNode }[] = [
    { id: 'todos', label: 'Todos os Itens', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'perfumes', label: 'Perfumaria Fina', icon: <Flame className="w-4 h-4" /> },
    { id: 'beleza', label: 'Victoria\'s Secret & Cuidados', icon: <Heart className="w-4 h-4" /> },
    { id: 'eletronicos', label: 'Som JBL & Eletrônicos', icon: <Volume2 className="w-4 h-4" /> },
    { id: 'acessorios', label: 'Acessórios Tech', icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4 py-4">
      {/* Linha 1: Seletor de Disponibilidade (Estoque) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 p-1 bg-zinc-100 dark:bg-dark-900 border border-zinc-200 dark:border-dark-700/80 rounded-xl shadow-sm">
          <button
            onClick={() => setSelectedStock('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStock === 'todos'
                ? 'bg-white dark:bg-dark-800 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            Todos ({totalProductsCount})
          </button>

          <button
            onClick={() => setSelectedStock('pronta_entrega')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStock === 'pronta_entrega'
                ? 'bg-emerald-500 text-white dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-300 dark:bg-emerald-400" />
            Pronta-Entrega ({prontaEntregaCount})
          </button>

          <button
            onClick={() => setSelectedStock('encomenda')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStock === 'encomenda'
                ? 'bg-amber-500 text-white dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/40 shadow-sm'
                : 'text-zinc-500 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-200 dark:bg-amber-400" />
            Sob Encomenda ({encomendaCount})
          </button>
        </div>

        <div className="text-xs text-zinc-500 hidden sm:block">
          Mostrando produtos verificados e com garantia
        </div>
      </div>

      {/* Linha 2: Pílulas de Categorias / Departamentos */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gold-500 text-dark-950 font-bold shadow-md shadow-gold-500/20 scale-[1.02]'
                  : 'bg-white dark:bg-dark-900 border border-zinc-200 dark:border-dark-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-dark-700 hover:text-zinc-900 dark:hover:text-white shadow-sm'
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
