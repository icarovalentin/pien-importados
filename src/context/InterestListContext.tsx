'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types/product';

interface InterestListContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInList: (productId: string) => boolean;
  clearList: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
}

const InterestListContext = createContext<InterestListContextType | undefined>(undefined);

export function InterestListProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Carrega do localStorage no cliente
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pien_interest_list');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignora erro no SSR
    }
  }, []);

  // Salva no localStorage quando muda
  useEffect(() => {
    try {
      localStorage.setItem('pien_interest_list', JSON.stringify(items));
    } catch {
      // Ignora erro
    }
  }, [items]);

  const addItem = (product: Product) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const isInList = (productId: string) => {
    return items.some((p) => p.id === productId);
  };

  const clearList = () => {
    setItems([]);
  };

  return (
    <InterestListContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInList,
        clearList,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </InterestListContext.Provider>
  );
}

export function useInterestList() {
  const context = useContext(InterestListContext);
  if (!context) {
    throw new Error('useInterestList deve ser usado dentro de um InterestListProvider');
  }
  return context;
}
