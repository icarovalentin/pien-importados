'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, ProductVariant } from '@/types/product';

export interface InterestItem {
  key: string;
  product: Product;
  quantity: number;
  variantLabel?: string;
  unitPrice: number;
}

interface InterestListContextType {
  items: InterestItem[];
  totalCount: number;
  addItem: (product: Product, variant?: ProductVariant) => void;
  removeItem: (itemKey: string) => void;
  updateQuantity: (itemKey: string, delta: number) => void;
  isInList: (productId: string, variantLabel?: string) => boolean;
  clearList: () => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
}

const STORAGE_KEY = 'pien_interest_list_v2';
const LEGACY_STORAGE_KEY = 'pien_interest_list';

export function makeInterestKey(productId: string, variantLabel?: string): string {
  return `${productId}::${variantLabel || ''}`;
}

const InterestListContext = createContext<InterestListContextType | undefined>(undefined);

export function InterestListProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InterestItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const savedV2 = localStorage.getItem(STORAGE_KEY);
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed)) {
          setItems(parsed);
          return;
        }
      }

      // Migração automática caso exista lista no formato anterior
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy)) {
          const migrated: InterestItem[] = parsedLegacy
            .filter((p: Product) => p && p.id)
            .map((p: Product) => ({
              key: makeInterestKey(p.id),
              product: p,
              quantity: 1,
              unitPrice: p.price,
            }));
          setItems(migrated);
          localStorage.removeItem(LEGACY_STORAGE_KEY);
        }
      }
    } catch {
      // Ignora erro no SSR
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignora erro
    }
  }, [items]);

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const addItem = (product: Product, variant?: ProductVariant) => {
    const variantLabel = variant?.label;
    const key = makeInterestKey(product.id, variantLabel);
    const unitPrice = variant?.price ?? product.price;

    setItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { key, product, quantity: 1, variantLabel, unitPrice }];
    });
  };

  const removeItem = (itemKey: string) => {
    setItems((prev) => prev.filter((item) => item.key !== itemKey));
  };

  const updateQuantity = (itemKey: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.key === itemKey ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const isInList = (productId: string, variantLabel?: string) => {
    if (variantLabel !== undefined) {
      return items.some((item) => item.key === makeInterestKey(productId, variantLabel));
    }
    return items.some((item) => item.product.id === productId);
  };

  const clearList = () => {
    setItems([]);
  };

  return (
    <InterestListContext.Provider
      value={{
        items,
        totalCount,
        addItem,
        removeItem,
        updateQuantity,
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
