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
import { Sparkles, MessageCircle, ShoppingBag } from 'lucide-react';
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

  // Carrega produtos dinamicamente da API para refletir mudanças do Admin
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

  // Contadores para os filtros
  const prontaEntregaCount = useMemo(
    () => products.filter((p) => p.status === 'pronta_entrega').length,
    [products]
  );
  const encomendaCount = useMemo(
    () => products.filter((p) => p.status === 'encomenda').length,
    [products]
  );

  // Filtragem dinâmica de produtos
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filtro de Categoria
      if (selectedCategory !== 'todos' && product.category !== selectedCategory) {
        return false;
      }

      // Filtro de Estoque
      if (selectedStock !== 'todos' && product.status !== selectedStock) {
        return false;
      }

      // Filtro de Busca por texto
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-dark-950 text-zinc-900 dark:text-zinc-100 selection:bg-gold-500/30 selection:text-gold-900 dark:selection:text-gold-200 transition-colors">
      {/* Barra de Navegação */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStockFilter={selectedStock}
        setSelectedStockFilter={setSelectedStock}
      />

      {/* NOVO: Banner Rotativo com 5 Slides de Produtos em Evidência */}
      <RotatingHeroBanner onScrollToCatalog={scrollToCatalog} />

      {/* Conteúdo Principal do Catálogo */}
      <main
        ref={catalogRef}
        id="catalogo"
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6"
      >
        {/* Navegação por Categorias e Filtros de Estoque */}
        <CategoryNav
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock}
          totalProductsCount={products.length}
          prontaEntregaCount={prontaEntregaCount}
          encomendaCount={encomendaCount}
        />

        {/* Cabeçalho da Seção de Produtos com contador */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white">
              {selectedStock === 'pronta_entrega'
                ? '🟢 Produtos à Pronta-Entrega'
                : selectedStock === 'encomenda'
                ? '🟡 Itens Sob Encomenda'
                : 'Catálogo de Produtos'}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-200 dark:bg-dark-800 text-zinc-700 dark:text-zinc-400 font-semibold border border-zinc-300 dark:border-dark-700">
              {filteredProducts.length}
            </span>
          </div>

          {(selectedCategory !== 'todos' || selectedStock !== 'todos' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedCategory('todos');
                setSelectedStock('todos');
                setSearchTerm('');
              }}
              className="text-xs text-gold-700 dark:text-gold-400 hover:text-gold-600 dark:hover:text-gold-300 font-medium underline"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Grid de Produtos */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenModal={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3 bg-white dark:bg-dark-900/40 rounded-2xl border border-zinc-200 dark:border-dark-800 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-dark-800 mx-auto flex items-center justify-center text-zinc-400 dark:text-zinc-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Nenhum produto encontrado</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Não encontramos produtos com esses filtros. Tente buscar por outro termo ou limpe os filtros.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('todos');
                setSelectedStock('todos');
                setSearchTerm('');
              }}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gold-500 text-dark-950 hover:bg-gold-400 transition-all shadow-md"
            >
              Ver todo o catálogo
            </button>
          </div>
        )}
      </main>

      {/* Seção de Confiança / Anti-Pirataria */}
      <TrustSection />

      {/* Rodapé */}
      <Footer />

      {/* Modal de Detalhes do Produto */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Drawer da Lista de Interesse (Sacola de Orçamento) */}
      <InterestListDrawer />

      {/* Botão Flutuante de WhatsApp / Orçamento no Canto Inferior Direito */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
        {/* Notificação Flutuante da Lista se houver itens */}
        {items.length > 0 && (
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white dark:bg-dark-900 border border-gold-500/50 shadow-2xl text-gold-700 dark:text-gold-300 hover:scale-105 transition-all text-xs font-bold backdrop-blur-md"
          >
            <ShoppingBag className="w-4 h-4 text-gold-500" />
            <span>Lista ({items.length})</span>
          </button>
        )}

        {/* Botão Flutuante WhatsApp Principal */}
        <a
          href={supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-2xl shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all"
          title="Tirar dúvidas ou pedir pelo WhatsApp"
        >
          <MessageCircle className="w-5 h-5 fill-white" />
          <span className="hidden sm:inline">Pedir no WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
