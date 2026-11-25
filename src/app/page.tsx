'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PRODUCTS as INITIAL_PRODUCTS } from '@/data/products';
import { CategoryType, Product, SortOption, StockStatus } from '@/types/product';
import { Navbar } from '@/components/Navbar';
import { RotatingHeroBanner } from '@/components/RotatingHeroBanner';
import { CategoryNav } from '@/components/CategoryNav';
import { ProductCard } from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/ProductSkeleton';
import { ProductModal } from '@/components/ProductModal';
import { InterestListDrawer } from '@/components/InterestListDrawer';
import { TrustSection } from '@/components/TrustSection';
import { FaqSection } from '@/components/FaqSection';
import { Footer } from '@/components/Footer';
import { ShoppingBag, MessageCircle } from 'lucide-react';
import { useInterestList } from '@/context/InterestListContext';
import { getGeneralSupportWhatsAppUrl } from '@/utils/whatsapp';

const CATEGORY_LABELS: Record<CategoryType, string> = {
  todos: 'Catálogo Completo',
  perfumes: 'Perfumaria',
  arabes: 'Perfumaria Árabe',
  eletronicos: 'Eletrônicos',
  smartphones: 'Smartphones',
  acessorios: 'Tech & Acessórios',
  farmacia: 'Farmácia',
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('todos');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedStock, setSelectedStock] = useState<'todos' | StockStatus>('todos');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const catalogRef = useRef<HTMLDivElement>(null);
  const { totalCount, setIsDrawerOpen } = useInterestList();
  const supportUrl = getGeneralSupportWhatsAppUrl();

  useEffect(() => {
    let active = true;
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (active && Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch((err) => {
        console.error('Erro ao atualizar produtos da API:', err);
        if (active) setProducts(INITIAL_PRODUCTS);
      })
      .finally(() => {
        if (active) setLoadingProducts(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Abre produto automaticamente se vier de um link compartilhado (?produto=id)
  useEffect(() => {
    if (products.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get('produto');
    if (sharedId) {
      const found = products.find((p) => p.id === sharedId);
      if (found) setSelectedProduct(found);
    }
  }, [products]);

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    const url = new URL(window.location.href);
    url.searchParams.set('produto', product.id);
    window.history.replaceState({}, '', url.toString());
  };

  const handleCloseProduct = () => {
    setSelectedProduct(null);
    const url = new URL(window.location.href);
    if (url.searchParams.has('produto')) {
      url.searchParams.delete('produto');
      window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
    }
  };

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: CategoryType) => {
    setSelectedCategory(cat);
    setSelectedBrand('');
  };

  const clearAllFilters = () => {
    setSelectedCategory('todos');
    setSelectedBrand('');
    setSelectedStock('todos');
    setSearchTerm('');
  };

  // Marcas dinâmicas ordenadas alfabeticamente para a faixa abaixo do banner
  const availableBrands = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const p of products) {
      const brand = p.brand?.trim();
      if (!brand) continue;
      const key = brand.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(brand);
      }
    }
    return result.sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  }, [products]);

  // Seção editorial rápida: 4 destaques à pronta-entrega (visível na visão padrão)
  const readyHighlights = useMemo(() => {
    return products.filter((p) => p.status === 'pronta_entrega').slice(0, 4);
  }, [products]);

  const showEditorialHighlights =
    !loadingProducts &&
    selectedCategory === 'todos' &&
    selectedBrand === '' &&
    selectedStock === 'todos' &&
    searchTerm.trim() === '' &&
    readyHighlights.length > 0;

  // Produtos filtrados por categoria, marca e busca (contadores coerentes com a seleção atual)
  const baseFilteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory !== 'todos') {
        if (selectedCategory === 'perfumes') {
          if (product.category !== 'perfumes' && product.category !== 'beleza') {
            return false;
          }
        } else if (product.category !== selectedCategory) {
          return false;
        }
      }

      if (selectedBrand.trim() !== '') {
        if (product.brand.trim().toLowerCase() !== selectedBrand.trim().toLowerCase()) {
          return false;
        }
      }

      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchName = product.name.toLowerCase().includes(query);
        const matchBrand = product.brand.toLowerCase().includes(query);
        const matchDesc = product.description.toLowerCase().includes(query);
        const matchCat = product.categoryLabel.toLowerCase().includes(query);
        if (!matchName && !matchBrand && !matchDesc && !matchCat) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, selectedBrand, searchTerm]);

  const prontaEntregaCount = useMemo(
    () => baseFilteredProducts.filter((p) => p.status === 'pronta_entrega').length,
    [baseFilteredProducts]
  );
  const encomendaCount = useMemo(
    () => baseFilteredProducts.filter((p) => p.status === 'encomenda').length,
    [baseFilteredProducts]
  );

  const filteredProducts = useMemo(() => {
    const filtered =
      selectedStock === 'todos'
        ? baseFilteredProducts
        : baseFilteredProducts.filter((p) => p.status === selectedStock);

    const sorted = [...filtered];
    if (sortBy === 'price_asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'pronta_first') {
      sorted.sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === 'pronta_entrega' ? -1 : 1;
      });
    } else {
      sorted.sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)));
    }

    return sorted;
  }, [baseFilteredProducts, selectedStock, sortBy]);

  const sectionTitle = selectedBrand
    ? selectedBrand
    : selectedCategory !== 'todos'
      ? CATEGORY_LABELS[selectedCategory]
      : selectedStock === 'pronta_entrega'
        ? 'Pronta-Entrega'
        : selectedStock === 'encomenda'
          ? 'Sob Encomenda'
          : 'Catálogo Completo';

  const hasActiveFilters =
    selectedCategory !== 'todos' ||
    selectedBrand !== '' ||
    selectedStock !== 'todos' ||
    searchTerm !== '';

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf8] dark:bg-[#0c0c0f] text-[#141414] dark:text-zinc-100 selection:bg-[#d4af37]/25 transition-colors">
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onSelectCategory={handleSelectCategory}
        onScrollToCatalog={scrollToCatalog}
      />

      {loadingProducts ? (
        <div className="w-full border-b border-[#e5e0d5] dark:border-dark-800 bg-[#fcfbf8] dark:bg-[#0c0c0f]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 animate-pulse">
            <div className="lg:col-span-6 min-h-[320px] sm:min-h-[420px] lg:min-h-[470px] bg-[#ebe6dc] dark:bg-dark-900" />
            <div className="lg:col-span-6 px-6 py-12 sm:px-12 lg:px-14 flex flex-col justify-center space-y-5">
              <div className="h-3 w-36 bg-[#ebe6dc] dark:bg-dark-800" />
              <div className="h-9 w-4/5 bg-[#ebe6dc] dark:bg-dark-800" />
              <div className="h-4 w-full bg-[#ebe6dc] dark:bg-dark-800" />
              <div className="h-4 w-2/3 bg-[#ebe6dc] dark:bg-dark-800" />
              <div className="h-10 w-44 bg-[#ebe6dc] dark:bg-dark-800 pt-2" />
            </div>
          </div>
          <div className="h-11 bg-[#f6f3ec] dark:bg-dark-900/70 border-t border-[#e5e0d5] dark:border-dark-800" />
        </div>
      ) : (
        <RotatingHeroBanner
          products={products}
          onScrollToCatalog={scrollToCatalog}
          onOpenProduct={handleOpenProduct}
          brands={availableBrands}
          activeBrand={selectedBrand}
          onSelectBrand={(brand) => {
            setSelectedCategory('todos');
            setSelectedStock('todos');
            setSelectedBrand(brand);
          }}
        />
      )}

      {/* Faixa Editorial: Destaques à Pronta-Entrega */}
      {showEditorialHighlights && (
        <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4 space-y-6">
          <div className="flex items-end justify-between border-b border-[#e5e0d5] dark:border-dark-800 pb-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#065f46] dark:text-emerald-400 font-semibold">
                Envio em até 24h
              </p>
              <h2 className="text-xl sm:text-2xl font-display font-normal text-[#141414] dark:text-white mt-0.5">
                Destaques à Pronta-Entrega
              </h2>
            </div>

            <button
              onClick={() => {
                setSelectedStock('pronta_entrega');
                scrollToCatalog();
              }}
              className="text-[11px] uppercase tracking-[0.14em] text-[#8b6508] dark:text-gold-400 hover:underline underline-offset-4"
            >
              Ver todos ({prontaEntregaCount})
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8">
            {readyHighlights.map((product) => (
              <ProductCard
                key={`highlight-${product.id}`}
                product={product}
                onOpenModal={handleOpenProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* Catálogo Completo */}
      <main
        ref={catalogRef}
        id="catalogo"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#8b6508] dark:text-gold-400 font-semibold">
              Curadoria Exclusiva
            </p>
            <h2 className="text-2xl sm:text-3xl font-display font-normal text-[#141414] dark:text-white mt-1">
              {sectionTitle}
              <span className="text-sm font-sans text-zinc-400 dark:text-zinc-500 ml-3">
                ({filteredProducts.length})
              </span>
            </h2>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-[11px] uppercase tracking-[0.14em] text-[#8b6508] dark:text-gold-400 hover:underline underline-offset-4 self-start sm:self-auto"
            >
              Limpar filtros
            </button>
          )}
        </div>

        <CategoryNav
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock}
          sortBy={sortBy}
          setSortBy={setSortBy}
          totalProductsCount={baseFilteredProducts.length}
          prontaEntregaCount={prontaEntregaCount}
          encomendaCount={encomendaCount}
        />

        {loadingProducts ? (
          <ProductGridSkeleton count={8} />
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 pt-2">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenModal={handleOpenProduct}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 border border-[#e5e0d5] dark:border-dark-800 bg-[#f6f3ec] dark:bg-dark-900/40 px-6">
            <h3 className="text-xl font-display text-[#141414] dark:text-white">
              Nenhum produto encontrado
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Não encontramos itens com os filtros atuais. Limpe a busca ou chame no WhatsApp para consultar encomendas.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 bg-[#141414] dark:bg-gold-500 text-white dark:text-[#0c0c0f] text-[11px] uppercase tracking-[0.16em] font-semibold transition-colors"
              >
                Ver Todo o Catálogo
              </button>
              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 border border-[#141414] dark:border-dark-600 text-[#141414] dark:text-zinc-200 text-[11px] uppercase tracking-[0.16em] font-semibold"
              >
                Encomendar via WhatsApp
              </a>
            </div>
          </div>
        )}
      </main>

      <TrustSection />

      <FaqSection />

      <Footer />

      <ProductModal product={selectedProduct} onClose={handleCloseProduct} />

      <InterestListDrawer />

      {/* Ações flutuantes discretas */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
        {totalCount > 0 && (
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#fcfbf8] dark:bg-dark-900 border border-[#141414] dark:border-gold-500/60 shadow-lg text-[#141414] dark:text-gold-300 text-[11px] uppercase tracking-[0.14em] font-semibold hover:bg-[#141414] hover:text-white transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Lista ({totalCount})</span>
          </button>
        )}

        <a
          href={supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-3 bg-[#065f46] hover:bg-[#047857] text-white text-[11px] uppercase tracking-[0.14em] font-semibold shadow-lg transition-colors"
          title="Atendimento pelo WhatsApp"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
