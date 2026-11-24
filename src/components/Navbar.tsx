'use client';

import React from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, MessageCircle, ShieldCheck, Lock } from 'lucide-react';
import { useInterestList } from '@/context/InterestListContext';
import { getGeneralSupportWhatsAppUrl } from '@/utils/whatsapp';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStockFilter: 'todos' | 'pronta_entrega' | 'encomenda';
  setSelectedStockFilter: (filter: 'todos' | 'pronta_entrega' | 'encomenda') => void;
}

export function Navbar({
  searchTerm,
  setSearchTerm,
  selectedStockFilter,
  setSelectedStockFilter,
}: NavbarProps) {
  const { items, setIsDrawerOpen } = useInterestList();
  const supportUrl = getGeneralSupportWhatsAppUrl();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-dark-700/60 bg-white/95 dark:bg-dark-950/95 backdrop-blur-lg transition-colors">
      {/* Barra superior de anúncio — fundo escuro sempre */}
      <div className="bg-dark-900 border-b border-dark-800 text-xs py-2 px-4 text-center flex items-center justify-center gap-3">
        <span className="flex items-center gap-1.5 font-semibold text-gold-400 tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Originais &amp; Lacrados
        </span>
        <span className="text-dark-600 hidden sm:inline">|</span>
        <span className="hidden sm:inline text-zinc-400 font-light">
          Pronta-entrega em 24h · Encomendas dos EUA e Europa
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[68px] gap-3 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="#" className="flex items-center gap-3 group">
              {/* Monograma SVG em ouro */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-md shadow-gold-500/25 group-hover:scale-105 transition-transform duration-200">
                <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 2H10C13.3137 2 16 4.68629 16 8C16 11.3137 13.3137 14 10 14H5V18" stroke="#09090B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-xl font-extrabold tracking-widest text-zinc-900 dark:text-white font-display">
                  PIEN
                </span>
                <span className="text-[9px] tracking-[0.18em] uppercase text-zinc-500 dark:text-zinc-500 font-medium mt-0.5">
                  Importados
                </span>
              </div>
            </a>
          </div>

          {/* Barra de Busca central */}
          <div className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar perfume, Victoria's Secret, JBL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-dark-900 border border-zinc-200 dark:border-dark-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/30 transition-all"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-3 text-xs text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Ações da direita */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ThemeToggle />

            {/* Botão Admin — discreto */}
            <Link
              href="/admin"
              className="p-2 sm:px-3 sm:py-2 rounded-xl border transition-all flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-500 dark:bg-dark-800 dark:border-dark-700 dark:hover:border-gold-500/40 dark:text-zinc-400 dark:hover:text-zinc-200"
              title="Acesso ao Painel Lojista"
            >
              <Lock className="w-3.5 h-3.5 text-gold-500" />
              <span className="text-xs font-medium hidden md:inline">Painel</span>
            </Link>

            {/* Lista de Interesse com badge */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 dark:bg-dark-800 dark:border-dark-700 dark:hover:border-gold-500/40 text-zinc-700 dark:text-zinc-300 transition-all"
              title="Lista de orçamento"
            >
              <ShoppingBag className="w-4 h-4 text-gold-500 dark:text-gold-400" />
              <span className="text-xs font-semibold hidden lg:inline">Lista</span>
              {items.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold-500 text-dark-950 font-bold text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </button>

            {/* WhatsApp CTA */}
            <a
              href={supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Busca mobile */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar perfume, hidratante, JBL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-dark-900 border border-zinc-200 dark:border-dark-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-gold-500/60"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
          </div>
        </div>
      </div>
    </header>
  );
}
