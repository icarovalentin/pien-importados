'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { STORE_PHONE_NUMBER } from '@/data/products';

interface BannerSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  statusLabel: string;
  image: string;
  whatsappMessage: string;
}

const SLIDES: BannerSlide[] = [
  {
    id: 'slide-1',
    eyebrow: 'Seleção da Semana · Perfumaria Masculina',
    title: 'Dior Sauvage Eau de Parfum 100ml',
    subtitle: 'Bergamota da Calábria, pimenta de Sichuan e âmbar cinza. Frasco lacrado com batch code conferível e envio em até 24 horas.',
    price: 'R$ 689,90',
    originalPrice: 'R$ 820,00',
    statusLabel: 'Pronta-entrega',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=85',
    whatsappMessage: 'Olá, Pien Importados! Vi o destaque do *Dior Sauvage EDP 100ml* no site e gostaria de garantir o meu à pronta-entrega.',
  },
  {
    id: 'slide-2',
    eyebrow: "Importados dos EUA · Victoria's Secret",
    title: "Victoria's Secret Bare Vanilla & Mists",
    subtitle: 'Hidratação intensa e perfumação aveludada inconfundível. Peças trazidas diretamente das lojas oficiais nos Estados Unidos.',
    price: 'A partir de R$ 139,90',
    originalPrice: 'R$ 179,90',
    statusLabel: 'Pronta-entrega',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=85',
    whatsappMessage: "Olá, Pien Importados! Gostaria de saber as fragrâncias *Victoria's Secret* disponíveis à pronta-entrega.",
  },
  {
    id: 'slide-3',
    eyebrow: 'Ícone Feminino · Carolina Herrera',
    title: 'Carolina Herrera Good Girl EDP 80ml',
    subtitle: 'O icônico frasco em salto agulha com notas marcantes de tuberosa, jasmim e cacau torrado. Original lacrado.',
    price: 'R$ 649,90',
    originalPrice: 'R$ 770,00',
    statusLabel: 'Pronta-entrega',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=85',
    whatsappMessage: 'Olá, Pien Importados! Gostaria de pedir o *Good Girl Carolina Herrera 80ml* em destaque no catálogo.',
  },
  {
    id: 'slide-4',
    eyebrow: 'Áudio Original · Série JBL',
    title: 'JBL Flip 6 & Boombox 3 Lacradas',
    subtitle: 'Graves potentes, autonomia estendida e proteção IP67 contra água e poeira. Caixas originais com número de série oficial.',
    price: 'A partir de R$ 549,90',
    originalPrice: 'R$ 699,00',
    statusLabel: 'Pronta-entrega & Encomenda',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=85',
    whatsappMessage: 'Olá, Pien Importados! Gostaria de consultar os modelos *JBL* disponíveis e valores.',
  },
  {
    id: 'slide-5',
    eyebrow: 'Apple · Áudio Espacial',
    title: 'AirPods Pro 2ª Geração USB-C',
    subtitle: 'Cancelamento ativo de ruído de alta precisão e estojo MagSafe USB-C. Novo, lacrado de fábrica com garantia mundial Apple.',
    price: 'R$ 1.699,90',
    originalPrice: 'R$ 2.199,00',
    statusLabel: 'Pronta-entrega',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1200&q=85',
    whatsappMessage: 'Olá, Pien Importados! Tenho interesse no *Apple AirPods Pro 2ª Geração USB-C* do catálogo.',
  },
];

const DEFAULT_BRANDS = [
  'DIOR',
  'CAROLINA HERRERA',
  "VICTORIA'S SECRET",
  'JBL',
  'APPLE',
];

interface RotatingHeroBannerProps {
  onScrollToCatalog: () => void;
  onSelectBrand?: (brand: string) => void;
  brands?: string[];
  activeBrand?: string;
}

export function RotatingHeroBanner({
  onScrollToCatalog,
  onSelectBrand,
  brands,
  activeBrand,
}: RotatingHeroBannerProps) {
  const brandList = brands && brands.length > 0 ? brands : DEFAULT_BRANDS;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = SLIDES.length;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, totalSlides]);

  const slide = SLIDES[currentSlide];
  const whatsappUrl = `https://wa.me/${STORE_PHONE_NUMBER}?text=${encodeURIComponent(slide.whatsappMessage)}`;

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full border-b border-[#e5e0d5] dark:border-dark-800 bg-[#fcfbf8] dark:bg-[#0c0c0f]"
    >
      {/* Hero Full-Width Assimétrico */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12">
        {/* Lado Esquerdo: Fotografia Editorial */}
        <div className="group lg:col-span-6 relative min-h-[320px] sm:min-h-[420px] lg:min-h-[470px] bg-[#ebe6dc] dark:bg-dark-900 overflow-hidden">
          <Image
            key={slide.id}
            src={slide.image}
            alt={slide.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

          {/* Contador editorial sobre a foto */}
          <div className="absolute bottom-4 left-5 z-10 text-[11px] uppercase tracking-[0.2em] text-white/90 font-medium">
            {String(currentSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')} · {slide.statusLabel}
          </div>

          {/* Controles apenas sobre a área da imagem */}
          <div className="absolute bottom-3.5 right-4 z-10 flex items-center gap-1.5">
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
        </div>

        {/* Lado Direito: Texto Editorial */}
        <div className="lg:col-span-6 px-6 py-9 sm:px-12 lg:px-14 flex flex-col justify-between bg-[#fcfbf8] dark:bg-[#0c0c0f]">
          <div className="space-y-5 my-auto">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#8b6508] dark:text-gold-400 font-semibold">
              {slide.eyebrow}
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.5rem] leading-[1.16] font-normal font-display text-[#141414] dark:text-white">
              {slide.title}
            </h1>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg">
              {slide.subtitle}
            </p>

            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-2xl font-semibold text-[#141414] dark:text-white">
                {slide.price}
              </span>
              {slide.originalPrice && (
                <span className="text-sm text-zinc-400 line-through">
                  {slide.originalPrice}
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
                onClick={onScrollToCatalog}
                className="px-6 py-3 border border-[#141414] dark:border-dark-600 text-[#141414] dark:text-zinc-200 hover:bg-[#f3efe7] dark:hover:bg-dark-800 text-[11px] uppercase tracking-[0.18em] font-semibold transition-colors"
              >
                Explorar Catálogo
              </button>
            </div>
          </div>

          {/* Indicadores horizontais minimalistas */}
          <div className="pt-8 flex items-center gap-2">
            {SLIDES.map((s, idx) => (
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
        </div>
      </div>

      {/* Faixa de Marcas Trabalhadas */}
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
