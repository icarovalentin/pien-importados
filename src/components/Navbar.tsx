'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Menu, MessageCircle, Search, ShoppingBag, X } from 'lucide-react';
import { CategoryType } from '@/types/product';
import { CATEGORIES, HOME_LABEL, SITE } from '@/config/site';
import { useInterestList } from '@/context/InterestListContext';
import { getGeneralSupportWhatsAppUrl } from '@/utils/whatsapp';
import { ThemeToggle } from '@/components/ThemeToggle';

interface NavbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: CategoryType;
  setSelectedCategory: (cat: CategoryType) => void;
  onSelectCategory?: (cat: CategoryType) => void;
  onScrollToCatalog: () => void;
}

/** Itens do menu: "Novidades" + as categorias de src/config/site.ts (na mesma ordem). */
const MENU: { id: CategoryType; label: string }[] = [
  { id: 'todos', label: HOME_LABEL },
  ...CATEGORIES.map((c) => ({ id: c.id as CategoryType, label: c.label as string })),
];

function SearchBox({
  value,
  onChange,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label
      className={`flex items-center gap-2 h-10 px-3 bg-white dark:bg-dark-900 border border-[#ddd7ca] dark:border-dark-700 focus-within:border-[#141414] dark:focus-within:border-gold-400 transition-colors ${className}`}
    >
      <Search className="w-4 h-4 text-zinc-400 shrink-0" />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        placeholder="Buscar produto, marca ou categoria"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Buscar produtos"
        className="w-full min-w-0 bg-transparent text-sm text-[#141414] dark:text-zinc-100 placeholder-zinc-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-zinc-400 hover:text-[#141414] dark:hover:text-white p-1 -mr-1"
          aria-label="Limpar busca"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </label>
  );
}

export function Navbar({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  onSelectCategory,
  onScrollToCatalog,
}: NavbarProps) {
  const { totalCount, setIsDrawerOpen } = useInterestList();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const supportUrl = getGeneralSupportWhatsAppUrl();

  const handleSelect = (id: CategoryType) => {
    if (onSelectCategory) onSelectCategory(id);
    else setSelectedCategory(id);
    setMenuOpen(false);
    if (id === 'todos') window.scrollTo({ top: 0, behavior: 'smooth' });
    else onScrollToCatalog();
  };

  // Mantém o item ativo visível na barra deslizante (celular)
  useEffect(() => {
    const el = scrollerRef.current?.querySelector<HTMLElement>(`[data-cat="${selectedCategory}"]`);
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [selectedCategory]);

  // Menu do celular: trava a rolagem da página e fecha com ESC
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const Logo = (
    <a href="#" className="text-center leading-none shrink-0" aria-label={`${SITE.name} ${SITE.tagline}`}>
      <span className="block text-xl sm:text-2xl tracking-[0.32em] font-display text-[#141414] dark:text-white pl-[0.32em]">
        {SITE.name}
      </span>
      <span className="block text-[8px] sm:text-[9px] tracking-[0.28em] uppercase text-zinc-500 dark:text-zinc-400 mt-1 pl-[0.28em]">
        {SITE.tagline}
      </span>
    </a>
  );

  return (
    <>
      {/* ===== Topo (rola junto com a página) ===== */}
      <header className="bg-[#fcfbf8] dark:bg-[#0c0c0f]">
        <div className="bg-[#141414] text-[#d4af37] text-[11px] py-1.5 px-4 text-center tracking-wide truncate">
          <span className="hidden sm:inline">{SITE.announcement}</span>
          <span className="sm:hidden">{SITE.announcementShort}</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-3 md:py-4">
          <div className="flex items-center gap-3 md:gap-6">
            {Logo}

            {/* Busca grande no computador */}
            <div className="hidden md:block flex-1 max-w-2xl mx-auto">
              <SearchBox value={searchTerm} onChange={setSearchTerm} />
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>

              <button
                onClick={() => setIsDrawerOpen(true)}
                className="hidden md:flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-zinc-600 dark:text-zinc-300 hover:text-[#141414] dark:hover:text-white transition-colors py-1"
                title="Lista de orçamento"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Lista</span>
                <span className="font-semibold">({totalCount})</span>
              </button>

              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-10 px-3 sm:px-4 bg-[#065f46] hover:bg-[#047857] text-white text-[11px] uppercase tracking-[0.14em] font-semibold transition-colors"
                aria-label="Falar no WhatsApp"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Busca no celular: linha própria, sempre visível */}
          <div className="md:hidden mt-3">
            <SearchBox value={searchTerm} onChange={setSearchTerm} />
          </div>
        </div>
      </header>

      {/* ===== Barra de categorias (fica fixa ao rolar) ===== */}
      <nav
        aria-label="Categorias"
        className="sticky top-0 z-40 bg-[#fcfbf8]/95 dark:bg-[#0c0c0f]/95 backdrop-blur-md border-y border-[#e5e0d5] dark:border-dark-800"
      >
        <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8 flex items-center">
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden shrink-0 p-3 text-[#141414] dark:text-zinc-100"
            aria-label="Abrir menu de categorias"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            ref={scrollerRef}
            className="flex-1 min-w-0 flex items-center gap-1.5 lg:gap-8 overflow-x-auto scrollbar-none py-2 pr-6 lg:pr-0 lg:justify-center snap-x [mask-image:linear-gradient(to_right,black_88%,transparent)] lg:[mask-image:none]"
          >
            {MENU.map((item) => {
              const active = selectedCategory === item.id;
              return (
                <button
                  key={item.id}
                  data-cat={item.id}
                  onClick={() => handleSelect(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`snap-start shrink-0 whitespace-nowrap transition-colors text-[13px] px-3.5 py-1.5 rounded-full border lg:rounded-none lg:border-0 lg:border-b lg:px-0 lg:py-1 lg:text-[11px] lg:uppercase lg:tracking-[0.16em] ${
                    active
                      ? 'bg-[#141414] text-white border-[#141414] font-semibold dark:bg-gold-500 dark:text-[#0c0c0f] dark:border-gold-500 lg:bg-transparent lg:text-[#141414] lg:dark:bg-transparent lg:dark:text-gold-400 lg:border-[#141414] lg:dark:border-gold-400'
                      : 'text-zinc-600 dark:text-zinc-300 border-[#ddd7ca] dark:border-dark-700 hover:text-[#141414] dark:hover:text-white lg:border-transparent lg:text-zinc-500 lg:dark:text-zinc-400'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="md:hidden relative shrink-0 p-3 text-[#141414] dark:text-zinc-100"
            aria-label={`Lista de orçamento, ${totalCount} itens`}
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute top-1.5 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#065f46] text-white text-[10px] font-semibold flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* ===== Menu lateral do celular ===== */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/55" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[84%] max-w-xs bg-[#fcfbf8] dark:bg-[#0c0c0f] shadow-2xl flex flex-col animate-slideInRight">
            <div className="flex items-center justify-between px-5 h-16 border-b border-[#e5e0d5] dark:border-dark-800">
              {Logo}
              <button
                onClick={() => setMenuOpen(false)}
                className="p-2 -mr-2 text-zinc-600 dark:text-zinc-300"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ul className="flex-1 overflow-y-auto py-2">
              {MENU.map((item) => {
                const active = selectedCategory === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-5 h-12 text-[15px] border-l-2 ${
                        active
                          ? 'border-[#141414] dark:border-gold-400 bg-[#f3efe7] dark:bg-dark-900 font-semibold text-[#141414] dark:text-white'
                          : 'border-transparent text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-zinc-400" />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-[#e5e0d5] dark:border-dark-800 p-4 space-y-3">
              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-11 bg-[#065f46] text-white text-xs uppercase tracking-[0.14em] font-semibold"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                Falar no WhatsApp
              </a>
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>Tema do site</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
