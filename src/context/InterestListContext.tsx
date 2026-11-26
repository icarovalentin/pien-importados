'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Product, ProductVariant } from '@/types/product';

export interface InterestItem {
  key: string;
  product: Product;
  quantity: number;
  variantLabel?: string;
  unitPrice: number;
}

export interface CatalogSyncResult {
  updated: number;
  removed: number;
}

interface InterestListContextType {
  items: InterestItem[];
  totalCount: number;
  addItem: (product: Product, variant?: ProductVariant) => void;
  removeItem: (itemKey: string) => void;
  updateQuantity: (itemKey: string, delta: number) => void;
  isInList: (productId: string, variantLabel?: string) => boolean;
  clearList: () => void;
  syncWithCatalog: (catalogProducts: Product[]) => CatalogSyncResult;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
}

const STORAGE_KEY = 'pien_interest_list_v2';
const LEGACY_STORAGE_KEY = 'pien_interest_list';
const MAX_QUANTITY_PER_ITEM = 99;

export function makeInterestKey(productId: string, variantLabel?: string): string {
  return `${productId}::${variantLabel || ''}`;
}

function clampQuantity(qty: unknown): number {
  const num = typeof qty === 'number' ? Math.floor(qty) : 1;
  if (!Number.isFinite(num) || num < 1) return 1;
  return Math.min(MAX_QUANTITY_PER_ITEM, num);
}

function sanitizeStoredItems(raw: unknown): InterestItem[] {
  if (!Array.isArray(raw)) return [];
  const valid: InterestItem[] = [];
  const seenKeys = new Set<string>();

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const item = entry as Partial<InterestItem>;
    const product = item.product;
    if (!product || typeof product !== 'object' || typeof product.id !== 'string' || !product.id) {
      continue;
    }

    const variantLabel = typeof item.variantLabel === 'string' && item.variantLabel.trim()
      ? item.variantLabel.trim()
      : undefined;
    const key = makeInterestKey(product.id, variantLabel);
    if (seenKeys.has(key)) continue;

    const unitPrice = Number(item.unitPrice);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) continue;

    seenKeys.add(key);
    valid.push({
      key,
      product: {
        ...product,
        images: Array.isArray(product.images) ? product.images : [],
        specs: Array.isArray(product.specs) ? product.specs : [],
        price: Number.isFinite(Number(product.price)) && Number(product.price) > 0
          ? Number(product.price)
          : unitPrice,
      },
      quantity: clampQuantity(item.quantity),
      variantLabel,
      unitPrice: Math.round((unitPrice + Number.EPSILON) * 100) / 100,
    });
  }

  return valid;
}

const InterestListContext = createContext<InterestListContextType | undefined>(undefined);

export function InterestListProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<InterestItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const itemsRef = useRef<InterestItem[]>([]);
  itemsRef.current = items;

  useEffect(() => {
    try {
      const savedV2 = localStorage.getItem(STORAGE_KEY);
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        setItems(sanitizeStoredItems(parsed));
        return;
      }

      // Migração automática caso exista lista no formato anterior
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy)) {
          const migrated: InterestItem[] = parsedLegacy
            .filter((p: Product) => p && typeof p.id === 'string' && Number.isFinite(Number(p.price)) && Number(p.price) > 0)
            .map((p: Product) => ({
              key: makeInterestKey(p.id),
              product: p,
              quantity: 1,
              unitPrice: Number(p.price),
            }));
          setItems(migrated);
          localStorage.removeItem(LEGACY_STORAGE_KEY);
        }
      }
    } catch {
      // Ignora erro no SSR / JSON inválido
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignora erro de quota
    }
  }, [items, hydrated]);

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const addItem = useCallback((product: Product, variant?: ProductVariant) => {
    const variantLabel = variant?.label;
    const key = makeInterestKey(product.id, variantLabel);
    const unitPrice = variant?.price ?? product.price;

    setItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key
            ? { ...item, product, unitPrice, quantity: Math.min(MAX_QUANTITY_PER_ITEM, item.quantity + 1) }
            : item
        );
      }
      return [...prev, { key, product, quantity: 1, variantLabel, unitPrice }];
    });
  }, []);

  const removeItem = useCallback((itemKey: string) => {
    setItems((prev) => prev.filter((item) => item.key !== itemKey));
  }, []);

  const updateQuantity = useCallback((itemKey: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.key === itemKey
            ? { ...item, quantity: Math.min(MAX_QUANTITY_PER_ITEM, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const isInList = useCallback(
    (productId: string, variantLabel?: string) => {
      if (variantLabel !== undefined) {
        return items.some((item) => item.key === makeInterestKey(productId, variantLabel));
      }
      return items.some((item) => item.product.id === productId);
    },
    [items]
  );

  const clearList = useCallback(() => {
    setItems([]);
  }, []);

  const syncWithCatalog = useCallback((catalogProducts: Product[]): CatalogSyncResult => {
    const current = itemsRef.current;
    if (current.length === 0 || catalogProducts.length === 0) {
      return { updated: 0, removed: 0 };
    }

    const byId = new Map<string, Product>(catalogProducts.map((p) => [p.id, p]));
    let updated = 0;
    let removed = 0;
    const next: InterestItem[] = [];

    for (const item of current) {
      const live = byId.get(item.product.id);
      if (!live) {
        removed += 1;
        continue;
      }

      let liveVariant: ProductVariant | undefined;
      if (item.variantLabel) {
        if (Array.isArray(live.variants) && live.variants.length > 0) {
          liveVariant = live.variants.find((v) => v.label === item.variantLabel);
          if (!liveVariant) {
            removed += 1;
            continue;
          }
        } else {
          removed += 1;
          continue;
        }
      }

      const freshPrice = liveVariant?.price ?? live.price;
      const freshQty = clampQuantity(item.quantity);
      const changed =
        freshPrice !== item.unitPrice ||
        freshQty !== item.quantity ||
        live.name !== item.product.name ||
        live.status !== item.product.status ||
        live.deliveryTime !== item.product.deliveryTime ||
        live.images?.[0] !== item.product.images?.[0];

      if (changed) updated += 1;

      next.push({
        key: item.key,
        product: live,
        quantity: freshQty,
        variantLabel: item.variantLabel,
        unitPrice: freshPrice,
      });
    }

    if (updated > 0 || removed > 0) {
      setItems(next);
    }

    return { updated, removed };
  }, []);

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
        syncWithCatalog,
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
