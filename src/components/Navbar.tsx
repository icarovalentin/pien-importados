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
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-dark-700/60 bg-white/90 dark:bg-dark-950/85 backdrop-blur-md transition-colors">
      {/* Barra superior de anúncio */}
      <div className="bg-zinc-100 dark:bg-gradient-to-r dark:from-dark-900 dark:via-dark-850 dark:to-dark-900 border-b border-zinc-200 dark:border-dark-800 text-xs py-1.5 px-4 text-center text-zinc-600 dark:text-zinc-300 flex items-center justify-center gap-3">
        <span className="flex items-center gap-1.5 font-medium text-gold-600 dark:text-gold-400">
          <ShieldCheck className="w-3.5 h-3.5" /> 100% Originais & Lacrados
        </span>
        <span className="text-zinc-400 dark:text-zinc-600 hidden sm:inline">•</span>
        <span className="hidden sm:inline text-zinc-600 dark:text-zinc-400">
          Pronta-entrega em 24h & Encomendas exclusivas dos EUA e Europa
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="#" className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-wider text-zinc-900 dark:text-white">
                  PIEN
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-widest bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/30">
                  Importados
                </span>
              </div>
              <span className="text-[10px] tracking-widest uppercase text-zinc-500 dark:text-zinc-400 font-medium">
                Perfumaria • Beleza • Eletrônicos
              </span>
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
                className="w-full bg-zinc-100 dark:bg-dark-900 border border-zinc-300 dark:border-dark-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:border-gold-500/70 focus:ring-1 focus:ring-gold-500/50 transition-all"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-3 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Ações da direita */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Alternador de Tema Claro / Escuro */}
            <ThemeToggle />

            {/* Botão de Acesso ao Painel Admin */}
            <Link
              href="/admin"
              className="p-2 sm:px-3 sm:py-2 rounded-xl border transition-all flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700 dark:bg-dark-900 dark:border-dark-700 dark:hover:border-gold-500/50 dark:text-zinc-300 dark:hover:text-white"
              title="Acesso ao Painel Lojista"
            >
              <Lock className="w-4 h-4 text-gold-500" />
              <span className="text-xs font-semibold hidden md:inline">Painel</span>
            </Link>

            {/* Botão de Lista de Interesse */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 border-zinc-300 dark:bg-dark-900 dark:border-dark-700 dark:hover:border-gold-500/50 text-zinc-800 dark:text-zinc-200 border transition-all"
              title="Ver sua lista de interesse"
            >
              <ShoppingBag className="w-4 h-4 text-gold-600 dark:text-gold-400" />
              <span className="text-xs font-semibold hidden lg:inline">Lista de Orçamento</span>
              {items.length > 0 && (
                <span className="bg-gold-500 text-dark-950 font-bold text-[11px] rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center animate-pulse">
                  {items.length}
                </span>
              )}
            </button>

            {/* Botão WhatsApp Fale Conosco */}
            <a
              href={supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Barra de busca mobile */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Buscar perfume, hidratante, JBL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-dark-900 border border-zinc-300 dark:border-dark-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-gold-500/70"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-2.5" />
          </div>
        </div>
      </div>
    </header>
  );
}
