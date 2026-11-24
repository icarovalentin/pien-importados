'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { PRODUCTS as INITIAL_PRODUCTS } from '@/data/products';
import { CategoryType, Product, StockStatus } from '@/types/product';
import { Navbar } from '@/components/Navbar';
import { RotatingHeroBanner } from '@/components/RotatingHeroBanner';
import { CategoryNav } from '@/components/CategoryNav';
import { ProductCard } from '@/components/ProductCard';
import { ProductModal } from '@/components/ProductModal';
import { InterestListDrawer } from '@/components/InterestListDrawer';
import { TrustSection } from '@/components/TrustSection';
import { Footer } from '@/components/Footer';
import { ShoppingBag, MessageCircle } from 'lucide-react';
import { useInterestList } from '@/context/InterestListContext';
import { getGeneralSupportWhatsAppUrl } from '@/utils/whatsapp';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('todos');
  const [selectedStock, setSelectedStock] = useState<'todos' | StockStatus>('todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const catalogRef = useRef<HTMLDivElement>(null);
  const { items, setIsDrawerOpen } = useInterestList();
  const supportUrl = getGeneralSupportWhatsAppUrl();

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch((err) => console.error('Erro ao atualizar produtos da API:', err));
  }, []);

  const scrollToCatalog = () => {
    catalogRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const prontaEntregaCount = useMemo(
    () => products.filter((p) => p.status === 'pronta_entrega').length,
    [products]
  );
  const encomendaCount = useMemo(
    () => products.filter((p) => p.status === 'encomenda').length,
    [products]
  );

  // Extrai automaticamente as marcas únicas dos produtos cadastrados
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
    return result;
  }, [products]);

  const filteredProducts = useMemo(() => {
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

      if (selectedStock !== 'todos' && product.status !== selectedStock) {
        return false;
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
  }, [products, selectedCategory, selectedStock, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfbf8] dark:bg-[#0c0c0f] text-[#141414] dark:text-zinc-100 selection:bg-[#d4af37]/25 transition-colors">
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        onScrollToCatalog={scrollToCatalog}
      />

      <RotatingHeroBanner
        onScrollToCatalog={scrollToCatalog}
        brands={availableBrands}
        activeBrand={searchTerm}
        onSelectBrand={(brand) => {
          setSelectedCategory('todos');
          setSelectedStock('todos');
          setSearchTerm(brand);
        }}
      />

      <main
        ref={catalogRef}
        id="catalogo"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8"
      >
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#8b6508] dark:text-gold-400 font-semibold">
              Curadoria Exclusiva
            </p>
            <h2 className="text-2xl sm:text-3xl font-display font-normal text-[#141414] dark:text-white mt-1">
              {selectedStock === 'pronta_entrega'
                ? 'Pronta-Entrega'
                : selectedStock === 'encomenda'
                ? 'Sob Encomenda'
                : 'Catálogo de Produtos'}
              <span className="text-sm font-sans text-zinc-400 dark:text-zinc-500 ml-3">
                ({filteredProducts.length})
              </span>
            </h2>
          </div>

          {(selectedCategory !== 'todos' || selectedStock !== 'todos' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedCategory('todos');
                setSelectedStock('todos');
                setSearchTerm('');
              }}
              className="text-[11px] uppercase tracking-[0.14em] text-[#8b6508] dark:text-gold-400 hover:underline underline-offset-4 self-start sm:self-auto"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Navegação por Categorias e Estoque */}
        <CategoryNav
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock}
          totalProductsCount={products.length}
          prontaEntregaCount={prontaEntregaCount}
          encomendaCount={encomendaCount}
        />

        {/* Grid Editorial de Produtos */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10 pt-2">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenModal={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4 border border-[#e5e0d5] dark:border-dark-800 bg-[#f6f3ec] dark:bg-dark-900/40 px-6">
            <h3 className="text-xl font-display text-[#141414] dark:text-white">
              Nenhum produto encontrado
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Não encontramos itens com os filtros atuais. Limpe a busca para visualizar todo o catálogo.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('todos');
                setSelectedStock('todos');
                setSearchTerm('');
              }}
              className="px-5 py-2.5 bg-[#141414] dark:bg-gold-500 text-white dark:text-[#0c0c0f] text-[11px] uppercase tracking-[0.16em] font-semibold transition-colors"
            >
              Ver Todo o Catálogo
            </button>
          </div>
        )}
      </main>

      <TrustSection />

      <Footer />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <InterestListDrawer />

      {/* Ações flutuantes discretas */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
        {items.length > 0 && (
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#fcfbf8] dark:bg-dark-900 border border-[#141414] dark:border-gold-500/60 shadow-lg text-[#141414] dark:text-gold-300 text-[11px] uppercase tracking-[0.14em] font-semibold hover:bg-[#141414] hover:text-white transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Lista ({items.length})</span>
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
