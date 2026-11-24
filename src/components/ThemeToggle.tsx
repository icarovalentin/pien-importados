'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
      title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
      aria-label="Alternar tema"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-gold-400" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
