'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, X, Lock } from 'lucide-react';
import { CategoryType } from '@/types/product';
import { useInterestList } from '@/context/InterestListContext';
import { getGeneralSupportWhatsAppUrl } from '@/utils/whatsapp';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: CategoryType;
  setSelectedCategory: (cat: CategoryType) => void;
  onScrollToCatalog: () => void;
}

const NAV_DEPARTMENTS: { id: CategoryType; label: string }[] = [
  { id: 'todos', label: 'Novidades' },
  { id: 'perfumes', label: 'Perfumaria' },
  { id: 'eletronicos', label: 'Eletrônicos' },
  { id: 'smartphones', label: 'Smartphones' },
  { id: 'acessorios', label: 'Tech & Acessórios' },
];

export function Navbar({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  onScrollToCatalog,
}: NavbarProps) {
  const { totalCount, setIsDrawerOpen } = useInterestList();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const supportUrl = getGeneralSupportWhatsAppUrl();

  const handleSelectDepartment = (id: CategoryType) => {
    setSelectedCategory(id);
    onScrollToCatalog();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#fcfbf8]/95 dark:bg-[#0c0c0f]/95 backdrop-blur-md border-b border-[#e5e0d5] dark:border-dark-800 transition-colors">
      {/* Faixa superior editorial */}
      <div className="bg-[#141414] text-[#d4af37] text-[11px] py-1.5 px-4 text-center tracking-wide">
        <span>Originais com procedência verificada · Pronta-entrega em 24h · Atendimento direto</span>
      </div>

      {/* Linha principal centralizada (3 colunas) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16 sm:h-[72px] gap-2">
          {/* Esquerda: Busca minimalista */}
          <div className="flex items-center">
            <div className="hidden md:flex items-center relative w-56 lg:w-64 border-b border-[#d6d0c4] dark:border-dark-700 focus-within:border-[#141414] dark:focus-within:border-gold-400 transition-colors">
              <Search className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar marca ou produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent text-xs text-[#141414] dark:text-zinc-100 placeholder-zinc-400 pl-2.5 pr-6 py-1.5 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-zinc-400 hover:text-[#141414] dark:hover:text-white p-0.5"
                  aria-label="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              className="md:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:text-[#141414] dark:hover:text-white"
              aria-label="Buscar"
            >
              {mobileSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>
          </div>

          {/* Centro: Logotipo Tipográfico */}
          <div className="flex justify-center">
            <a href="#" className="text-center leading-none group">
              <span className="block text-xl sm:text-2xl tracking-[0.32em] font-display text-[#141414] dark:text-white pl-[0.32em]">
                PIEN
              </span>
              <span className="block text-[9px] tracking-[0.28em] uppercase text-zinc-500 dark:text-zinc-400 mt-1 pl-[0.28em]">
                Importados
              </span>
            </a>
          </div>

          {/* Direita: Tema discreto, Admin, Lista e WhatsApp */}
          <div className="flex items-center justify-end gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <Link
              href="/admin"
              className="flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400 hover:text-[#141414] dark:hover:text-gold-400 transition-colors p-1"
              title="Painel Administrativo"
            >
              <Lock className="w-3.5 h-3.5 text-[#8b6508] dark:text-gold-400" />
              <span className="hidden lg:inline">Admin</span>
            </Link>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-zinc-600 dark:text-zinc-300 hover:text-[#141414] dark:hover:text-white transition-colors py-1"
              title="Lista de orçamento"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Lista</span>
              <span className="text-[11px] font-semibold">({totalCount})</span>
            </button>

            <a
              href={supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 sm:px-4 py-1.5 bg-[#141414] hover:bg-[#2c2c2c] dark:bg-gold-500 dark:hover:bg-gold-400 text-white dark:text-[#0c0c0f] text-[10px] sm:text-[11px] uppercase tracking-[0.16em] font-semibold transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* Busca expansível mobile */}
        {mobileSearchOpen && (
          <div className="md:hidden pb-3 pt-1 border-t border-[#ece7dc] dark:border-dark-800">
            <div className="flex items-center border-b border-[#d6d0c4] dark:border-dark-700 py-1">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                type="text"
                placeholder="Buscar perfume, Victoria's Secret, JBL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="w-full bg-transparent text-sm text-[#141414] dark:text-white placeholder-zinc-400 px-2.5 py-1 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs text-zinc-400 px-2"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sub-menu horizontal de departamentos */}
      <nav className="border-t border-[#f0ece3] dark:border-dark-800/80 bg-[#fcfbf8] dark:bg-[#0c0c0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-start sm:justify-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none py-2.5">
          {NAV_DEPARTMENTS.map((dept) => {
            const active = selectedCategory === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => handleSelectDepartment(dept.id)}
                className={`text-[11px] uppercase tracking-[0.16em] whitespace-nowrap pb-0.5 border-b transition-colors ${
                  active
                    ? 'text-[#141414] dark:text-gold-400 font-semibold border-[#141414] dark:border-gold-400'
                    : 'text-zinc-500 dark:text-zinc-400 border-transparent hover:text-[#141414] dark:hover:text-white'
                }`}
              >
                {dept.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
