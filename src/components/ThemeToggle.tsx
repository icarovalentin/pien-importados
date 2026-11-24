'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 sm:px-3 sm:py-2 rounded-xl border transition-all flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700 dark:bg-dark-900 dark:border-dark-700 dark:hover:border-gold-500/50 dark:text-zinc-300 dark:hover:text-white"
      title={theme === 'dark' ? 'Mudar para Versão Clara (Light)' : 'Mudar para Versão Escura (Dark)'}
      aria-label="Alternar tema"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-gold-400" />
          <span className="text-xs font-semibold hidden md:inline">Modo Claro</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-zinc-700" />
          <span className="text-xs font-semibold hidden md:inline">Modo Escuro</span>
        </>
      )}
    </button>
  );
}
