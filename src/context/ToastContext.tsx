'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Check, X } from 'lucide-react';

interface ToastState {
  id: number;
  message: string;
}

interface ToastContextType {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ id: Date.now(), message });
    timerRef.current = setTimeout(() => {
      setToast(null);
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 sm:left-6 sm:translate-x-0 sm:bottom-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#141414] dark:bg-gold-500 text-white dark:text-[#0c0c0f] text-xs tracking-wide shadow-2xl border border-[#2c2c2c] dark:border-gold-400 animate-fadeInUp"
        >
          <Check className="w-3.5 h-3.5 text-[#d4af37] dark:text-[#0c0c0f] shrink-0" />
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            aria-label="Fechar aviso"
            className="text-zinc-400 hover:text-white dark:text-[#0c0c0f]/70 dark:hover:text-[#0c0c0f] ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
}
