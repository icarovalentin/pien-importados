'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Clock,
  ArrowRight,
  Flame,
  Heart,
  Volume2,
  Zap,
} from 'lucide-react';
import { STORE_PHONE_NUMBER } from '@/data/products';

interface BannerSlide {
  id: string;
  badge: string;
  badgeIcon: React.ReactNode;
  title: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  status: 'pronta_entrega' | 'encomenda';
  statusLabel: string;
  image: string;
  category: string;
  whatsappMessage: string;
  accentColor: string;
}

const SLIDES: BannerSlide[] = [
  {
    id: 'slide-1',
    badge: 'Mais Vendido',
    badgeIcon: <Flame className="w-3.5 h-3.5 text-amber-400" />,
    title: 'Dior Sauvage Eau de Parfum 100ml',
    subtitle: 'O perfume masculino mais desejado do mundo. Notas nobres de bergamota, pimenta e âmbar cinza. Batch code conferível.',
    price: 'R$ 689,90',
    originalPrice: 'R$ 820,00',
    status: 'pronta_entrega',
    statusLabel: 'Envio em 24h',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85',
    category: 'Perfumaria Masculina',
    whatsappMessage: 'Olá, Pien Importados! Vi o destaque do *Dior Sauvage EDP 100ml* no banner e gostaria de garantir o meu à pronta-entrega!',
    accentColor: 'from-amber-950/40',
  },
  {
    id: 'slide-2',
    badge: 'Linha EUA',
    badgeIcon: <Heart className="w-3.5 h-3.5 text-rose-400" />,
    title: "Victoria's Secret — Bare Vanilla & Mists",
    subtitle: 'Hidratação profunda 24h e perfumação aveludada inconfundível. 100% originais das lojas oficiais dos Estados Unidos.',
    price: 'A partir de R$ 139,90',
    originalPrice: 'R$ 179,90',
    status: 'pronta_entrega',
    statusLabel: 'Pronta-Entrega no Brasil',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=85',
    category: "Victoria's Secret Original",
    whatsappMessage: "Olá, Pien Importados! Vi a linha *Victoria's Secret* em destaque e gostaria de saber as fragrâncias disponíveis!",
    accentColor: 'from-rose-950/30',
  },
  {
    id: 'slide-3',
    badge: 'Ícone da Noite',
    badgeIcon: <Sparkles className="w-3.5 h-3.5 text-gold-400" />,
    title: 'Carolina Herrera Good Girl EDP 80ml',
    subtitle: 'A fragrância do icônico frasco em salto agulha. Sensual e marcante, com notas de tuberosa, jasmim e cacau torrado.',
    price: 'R$ 649,90',
    originalPrice: 'R$ 770,00',
    status: 'pronta_entrega',
    statusLabel: 'Envio 24h',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=85',
    category: 'Perfumaria Feminina',
    whatsappMessage: 'Olá, Pien Importados! Gostaria de pedir o *Good Girl Carolina Herrera 80ml* que vi no banner!',
    accentColor: 'from-purple-950/30',
  },
  {
    id: 'slide-4',
    badge: 'Potência JBL',
    badgeIcon: <Volume2 className="w-3.5 h-3.5 text-emerald-400" />,
    title: 'Caixas de Som JBL Flip 6 & Boombox 3',
    subtitle: 'Graves profundos, bateria para o dia todo e proteção IP67. Lacradas na caixa com número de série oficial JBL.',
    price: 'A partir de R$ 549,90',
    originalPrice: 'R$ 699,00',
    status: 'pronta_entrega',
    statusLabel: 'Pronta-Entrega & Encomendas',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=85',
    category: 'Áudio & Som JBL',
    whatsappMessage: 'Olá, Pien Importados! Gostaria de consultar os modelos JBL disponíveis e os valores!',
    accentColor: 'from-emerald-950/30',
  },
  {
    id: 'slide-5',
    badge: 'Tech Premium',
    badgeIcon: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
    title: 'Apple AirPods Pro 2ª Geração (USB-C)',
    subtitle: 'Cancelamento ativo de ruído 2x mais potente, áudio espacial e estojo MagSafe USB-C. Lacrado com garantia mundial Apple.',
    price: 'R$ 1.699,90',
    originalPrice: 'R$ 2.199,00',
    status: 'pronta_entrega',
    statusLabel: 'Pronta-Entrega Imediata',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1000&q=85',
    category: 'Eletrônicos Premium',
    whatsappMessage: 'Olá, Pien Importados! Gostaria de informações para adquirir o *AirPods Pro 2ª Geração USB-C* em destaque!',
    accentColor: 'from-cyan-950/30',
  },
];

interface RotatingHeroBannerProps {
  onScrollToCatalog: () => void;
}

export function RotatingHeroBanner({ onScrollToCatalog }: RotatingHeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = SLIDES.length;

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 400);
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % totalSlides);
  const prevSlide = () => goToSlide((currentSlide - 1 + totalSlides) % totalSlides);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(nextSlide, 5500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentSlide, isPaused]);

  const slide = SLIDES[currentSlide];
  const whatsappUrl = `https://wa.me/${STORE_PHONE_NUMBER}?text=${encodeURIComponent(slide.whatsappMessage)}`;

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden bg-white dark:bg-dark-950 border-b border-zinc-100 dark:border-dark-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="relative rounded-2xl overflow-hidden bg-zinc-50 dark:bg-dark-900 border border-zinc-100 dark:border-dark-800 shadow-lg min-h-[420px] sm:min-h-[400px] flex flex-col md:flex-row">

          {/* Lado Esquerdo — Conteúdo Textual */}
          <div className="flex-1 p-7 sm:p-10 flex flex-col justify-between z-10 relative">
            {/* Fio dourado decorativo no topo */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/30 to-transparent" />

            <div className="space-y-4">
              {/* Chips de status */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Contador */}
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-400 dark:text-zinc-500">
                  {String(currentSlide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
                </span>

                <span className="text-zinc-200 dark:text-dark-700">·</span>

                {/* Badge do slide */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-gold-500/10 dark:bg-gold-500/15 border border-gold-500/25 text-gold-700 dark:text-gold-300">
                  {slide.badgeIcon}
                  {slide.badge}
                </span>

                {/* Status pronta/encomenda */}
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {slide.statusLabel}
                </span>
              </div>

              {/* Título — fonte display serif */}
              <h2
                key={slide.id}
                className="text-2xl sm:text-[2rem] font-bold text-zinc-900 dark:text-white tracking-tight leading-tight font-display animate-fadeIn"
              >
                {slide.title}
              </h2>

              {/* Descrição */}
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg">
                {slide.subtitle}
              </p>

              {/* Bloco de Preço */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                  {slide.price}
                </span>
                {slide.originalPrice && (
                  <span className="text-sm text-zinc-400 line-through">
                    {slide.originalPrice}
                  </span>
                )}
              </div>

              {/* Selo de autenticidade */}
              <div className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-500" />
                100% Original &amp; Lacrado · Procedência Verificada
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-5 mt-4 border-t border-zinc-100 dark:border-dark-800">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-900/20 active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                Pedir no WhatsApp
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={onScrollToCatalog}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Ver Todo o Catálogo →
              </button>
            </div>
          </div>

          {/* Lado Direito — Imagem */}
          <div className="relative w-full md:w-5/12 h-56 md:h-auto bg-zinc-100 dark:bg-dark-950 overflow-hidden shrink-0">
            <Image
              key={slide.id}
              src={slide.image}
              alt={slide.title}
              fill
              priority
              className="object-cover object-center transition-all duration-700 group-hover:scale-105"
            />
            {/* Gradiente de fusão com o lado esquerdo */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-50 dark:from-dark-900 via-transparent to-transparent opacity-80 md:opacity-85" />

            {/* Tag Categoria */}
            <div className="absolute bottom-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold tracking-wider uppercase border border-white/10">
              {slide.category}
            </div>
          </div>

          {/* Seta Esquerda */}
          <button
            onClick={prevSlide}
            aria-label="Slide anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border border-zinc-200 dark:border-dark-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:scale-110 shadow-md transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Seta Direita */}
          <button
            onClick={nextSlide}
            aria-label="Próximo slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border border-zinc-200 dark:border-dark-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:scale-110 shadow-md transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Paginação — traços minimalistas */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === idx
                    ? 'w-6 h-1.5 bg-gold-500'
                    : 'w-1.5 h-1.5 bg-zinc-300 dark:bg-dark-600 hover:bg-zinc-400 dark:hover:bg-dark-500'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
