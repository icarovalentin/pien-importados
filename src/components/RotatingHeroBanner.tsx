'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types/product';
import { formatCurrency, getProductWhatsAppUrl } from '@/utils/whatsapp';

const DEFAULT_BRANDS = ['DIOR', 'CAROLINA HERRERA', "VICTORIA'S SECRET", 'JBL', 'APPLE'];

interface RotatingHeroBannerProps {
  products: Product[];
  onScrollToCatalog: () => void;
  onOpenProduct: (product: Product) => void;
  onSelectBrand?: (brand: string) => void;
  brands?: string[];
  activeBrand?: string;
}

export function RotatingHeroBanner({
  products,
  onScrollToCatalog,
  onOpenProduct,
  onSelectBrand,
  brands,
  activeBrand,
}: RotatingHeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Usa os produtos marcados como destaque no Painel Admin (ou os 5 primeiros se nenhum estiver marcado)
  const slides = useMemo(() => {
    const featured = products.filter((p) => p.isFeatured);
    const pool = featured.length > 0 ? featured : products;
    return pool.slice(0, 6);
  }, [products]);

  const totalSlides = slides.length;

  useEffect(() => {
    if (currentSlide >= totalSlides && totalSlides > 0) {
      setCurrentSlide(0);
    }
  }, [currentSlide, totalSlides]);

  const nextSlide = () => {
    if (totalSlides <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    if (totalSlides <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, totalSlides]);

  const brandList = brands && brands.length > 0 ? brands : DEFAULT_BRANDS;

  if (totalSlides === 0) return null;

  const slide = slides[currentSlide] || slides[0];
  const isPronta = slide.status === 'pronta_entrega';
  const whatsappUrl = getProductWhatsAppUrl(slide);

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full border-b border-[#e5e0d5] dark:border-dark-800 bg-[#fcfbf8] dark:bg-[#0c0c0f]"
    >
      {/* Hero Full-Width Assimétrico */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12">
        {/* Lado Esquerdo: Fotografia Editorial */}
        <div
          onClick={() => onOpenProduct(slide)}
          className="group lg:col-span-6 relative min-h-[320px] sm:min-h-[420px] lg:min-h-[470px] bg-[#ebe6dc] dark:bg-dark-900 overflow-hidden cursor-pointer"
        >
          <Image
            key={slide.id}
            src={slide.images[0]}
            alt={slide.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Contador editorial sobre a foto */}
          <div className="absolute bottom-4 left-5 z-10 text-[11px] uppercase tracking-[0.2em] text-white/95 font-medium">
            {String(currentSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')} ·{' '}
            {isPronta ? 'Pronta-entrega' : 'Sob encomenda'}
          </div>

          {/* Controles apenas sobre a área da imagem */}
          {totalSlides > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-3.5 right-4 z-10 flex items-center gap-1.5"
            >
              <button
                onClick={prevSlide}
                aria-label="Slide anterior"
                className="p-2 bg-white/90 hover:bg-white text-[#141414] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Próximo slide"
                className="p-2 bg-white/90 hover:bg-white text-[#141414] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Lado Direito: Texto Editorial */}
        <div className="lg:col-span-6 px-6 py-9 sm:px-12 lg:px-14 flex flex-col justify-between bg-[#fcfbf8] dark:bg-[#0c0c0f]">
          <div className="space-y-5 my-auto">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#8b6508] dark:text-gold-400 font-semibold">
              Destaque · {slide.brand} · {slide.categoryLabel}
            </p>

            <h1
              onClick={() => onOpenProduct(slide)}
              className="text-3xl sm:text-4xl lg:text-[2.45rem] leading-[1.16] font-normal font-display text-[#141414] dark:text-white cursor-pointer hover:opacity-80 transition-opacity"
            >
              {slide.name}
            </h1>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg line-clamp-3">
              {slide.description}
            </p>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl font-semibold text-[#141414] dark:text-white">
                {formatCurrency(slide.price)}
              </span>
              {slide.originalPrice && (
                <span className="text-sm text-zinc-400 line-through">
                  {formatCurrency(slide.originalPrice)}
                </span>
              )}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#141414] hover:bg-[#2c2c2c] dark:bg-gold-500 dark:hover:bg-gold-400 text-white dark:text-[#0c0c0f] text-[11px] uppercase tracking-[0.18em] font-semibold transition-colors"
              >
                Pedir Agora
              </a>

              <button
                onClick={() => onOpenProduct(slide)}
                className="px-6 py-3 border border-[#141414] dark:border-dark-600 text-[#141414] dark:text-zinc-200 hover:bg-[#f3efe7] dark:hover:bg-dark-800 text-[11px] uppercase tracking-[0.18em] font-semibold transition-colors"
              >
                Ver Detalhes
              </button>
            </div>
          </div>

          {/* Indicadores horizontais minimalistas */}
          {totalSlides > 1 && (
            <div className="pt-8 flex items-center gap-2">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Ir para destaque ${idx + 1}`}
                  className={`h-[2px] transition-all duration-300 ${
                    currentSlide === idx
                      ? 'w-10 bg-[#141414] dark:bg-gold-400'
                      : 'w-5 bg-[#ded9ce] dark:bg-dark-700 hover:bg-zinc-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Faixa dinâmica de marcas */}
      <div className="bg-[#f6f3ec] dark:bg-dark-900/70 border-t border-[#e5e0d5] dark:border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-start sm:justify-center gap-7 sm:gap-10 overflow-x-auto scrollbar-none">
          {brandList.map((brand) => {
            const isActive =
              activeBrand && activeBrand.trim().toLowerCase() === brand.toLowerCase();
            return (
              <button
                key={brand}
                onClick={() => {
                  if (onSelectBrand) {
                    onSelectBrand(isActive ? '' : brand);
                  }
                  onScrollToCatalog();
                }}
                className={`text-[10px] sm:text-[11px] uppercase tracking-[0.22em] whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-[#141414] dark:text-gold-400 font-semibold underline underline-offset-4'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-[#141414] dark:hover:text-gold-400'
                }`}
              >
                {brand}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
