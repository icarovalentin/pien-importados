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
}

const SLIDES: BannerSlide[] = [
  // SLIDE 1: Dior Sauvage (Perfumaria Masculina)
  {
    id: 'slide-1',
    badge: 'Mais Vendido da Perfumaria',
    badgeIcon: <Flame className="w-3.5 h-3.5 text-amber-500" />,
    title: 'Dior Sauvage Eau de Parfum 100ml',
    subtitle: 'O perfume masculino mais desejado do mundo. Notas nobres de bergamota da Calábria, pimenta e âmbar cinza. Selo de autenticidade e batch code conferível.',
    price: 'R$ 689,90',
    originalPrice: 'R$ 820,00',
    status: 'pronta_entrega',
    statusLabel: '🟢 Pronta-Entrega (Envio em 24h)',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1000&q=85',
    category: 'Perfumaria Masculina',
    whatsappMessage: 'Olá, Pien Importados! Vi o destaque do *Dior Sauvage EDP 100ml* no banner e gostaria de garantir o meu à pronta-entrega!',
  },

  // SLIDE 2: Victoria's Secret (Beleza & Skincare)
  {
    id: 'slide-2',
    badge: 'Linha Mais Desejada dos EUA',
    badgeIcon: <Heart className="w-3.5 h-3.5 text-rose-500" />,
    title: "Victoria's Secret — Bare Vanilla & Mists",
    subtitle: 'Hidratação profunda 24h e perfumação aveludada inconfundível. 100% originais trazidos diretamente das lojas oficiais nos Estados Unidos.',
    price: 'A partir de R$ 139,90',
    originalPrice: 'R$ 179,90',
    status: 'pronta_entrega',
    statusLabel: '🟢 Pronta-Entrega no Brasil',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=85',
    category: "Victoria's Secret Original",
    whatsappMessage: "Olá, Pien Importados! Vi a linha *Victoria's Secret* em destaque e gostaria de saber as fragrâncias disponíveis à pronta-entrega!",
  },

  // SLIDE 3: Carolina Herrera Good Girl (Perfumaria Feminina)
  {
    id: 'slide-3',
    badge: 'Ícone Absoluto da Noite',
    badgeIcon: <Sparkles className="w-3.5 h-3.5 text-gold-500" />,
    title: 'Carolina Herrera Good Girl EDP 80ml',
    subtitle: 'A fragrância do icônico frasco em salto agulha. Sensual, marcante e luxuosa, com notas de tuberosa, jasmim e cacau torrado.',
    price: 'R$ 649,90',
    originalPrice: 'R$ 770,00',
    status: 'pronta_entrega',
    statusLabel: '🟢 Pronta-Entrega (Envio 24h)',
    image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1000&q=85',
    category: 'Perfumaria Feminina',
    whatsappMessage: 'Olá, Pien Importados! Gostaria de pedir o *Good Girl Carolina Herrera 80ml* que vi no banner rotativo!',
  },

  // SLIDE 4: JBL Som & Áudio (Eletrônicos)
  {
    id: 'slide-4',
    badge: 'Potência Sonora Original',
    badgeIcon: <Volume2 className="w-3.5 h-3.5 text-emerald-500" />,
    title: 'Caixas de Som JBL Flip 6 & Boombox 3',
    subtitle: 'Graves profundos, bateria para o dia todo e proteção total IP67 contra água e poeira. Lacradas na caixa com número de série oficial JBL.',
    price: 'A partir de R$ 549,90',
    originalPrice: 'R$ 699,00',
    status: 'pronta_entrega',
    statusLabel: '🟢 Pronta-Entrega & Encomendas',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=85',
    category: 'Áudio & Som JBL',
    whatsappMessage: 'Olá, Pien Importados! Gostaria de consultar os modelos de caixas JBL disponíveis à pronta-entrega e os valores!',
  },

  // SLIDE 5: Apple AirPods Pro (Tech & Acessórios)
  {
    id: 'slide-5',
    badge: 'Tecnologia de Ponta',
    badgeIcon: <Zap className="w-3.5 h-3.5 text-cyan-500" />,
    title: 'Apple AirPods Pro 2ª Geração (USB-C)',
    subtitle: 'Cancelamento ativo de ruído até 2x mais potente, áudio espacial e estojo MagSafe com USB-C. Produto novo, lacrado e com garantia mundial Apple.',
    price: 'R$ 1.699,90',
    originalPrice: 'R$ 2.199,00',
    status: 'pronta_entrega',
    statusLabel: '🟢 Pronta-Entrega Imediata',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=1000&q=85',
    category: 'Eletrônicos Premium',
    whatsappMessage: 'Olá, Pien Importados! Gostaria de informações para adquirir o *AirPods Pro 2ª Geração USB-C* em destaque!',
  },
];

interface RotatingHeroBannerProps {
  onScrollToCatalog: () => void;
}

export function RotatingHeroBanner({ onScrollToCatalog }: RotatingHeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = SLIDES.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Rotação automática a cada 5.5 segundos
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentSlide, isPaused]);

  const slide = SLIDES[currentSlide];
  const whatsappUrl = `https://wa.me/${STORE_PHONE_NUMBER}?text=${encodeURIComponent(slide.whatsappMessage)}`;

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative overflow-hidden border-b border-zinc-200 dark:border-dark-800 bg-slate-100 dark:bg-dark-950 transition-colors"
    >
      {/* Container Principal do Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-dark-900 border border-zinc-200 dark:border-dark-800 shadow-xl min-h-[460px] sm:min-h-[440px] flex flex-col md:flex-row items-stretch">
          
          {/* Lado Esquerdo: Conteúdo Textual do Slide */}
          <div className="flex-1 p-6 sm:p-10 flex flex-col justify-between z-10 relative">
            <div className="space-y-3.5">
              {/* Linha Superior: Contador de Páginas + Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-zinc-900 text-white dark:bg-white dark:text-dark-950 shadow-sm">
                  Destaque {currentSlide + 1} de {totalSlides}
                </span>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-700 dark:text-gold-400 text-xs font-bold">
                  {slide.badgeIcon}
                  <span>{slide.badge}</span>
                </div>

                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40">
                  {slide.statusLabel}
                </span>
              </div>

              {/* Título do Produto */}
              <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-snug">
                {slide.title}
              </h2>

              {/* Descrição resumida */}
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-xl">
                {slide.subtitle}
              </p>

              {/* Bloco de Preço */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                  {slide.price}
                </span>
                {slide.originalPrice && (
                  <span className="text-sm text-zinc-400 dark:text-zinc-500 line-through">
                    {slide.originalPrice}
                  </span>
                )}
                <span className="text-xs text-gold-700 dark:text-gold-400 font-bold hidden sm:inline">
                  • 100% Original & Lacrado
                </span>
              </div>
            </div>

            {/* Botões de Ação do Slide */}
            <div className="flex flex-wrap items-center gap-3 pt-6 mt-4 border-t border-zinc-100 dark:border-dark-800">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/20 dark:shadow-emerald-950/60 active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Pedir no WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                onClick={onScrollToCatalog}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold transition-all border border-zinc-200 dark:border-dark-700"
              >
                <span>Ver Todo o Catálogo</span>
              </button>
            </div>
          </div>

          {/* Lado Direito: Imagem com Efeito de Destaque */}
          <div className="relative w-full md:w-5/12 h-64 md:h-auto bg-zinc-100 dark:bg-dark-950 overflow-hidden shrink-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority
              className="object-cover object-center transition-all duration-700 hover:scale-105"
            />
            {/* Gradiente suave */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-white dark:from-dark-900 via-transparent to-transparent opacity-80 md:opacity-90" />
            
            {/* Tag Categoria Flutuante */}
            <div className="absolute bottom-4 right-4 z-10 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
              {slide.category}
            </div>
          </div>

          {/* Setas de Navegação (Esquerda / Direita) */}
          <button
            onClick={prevSlide}
            aria-label="Slide anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border border-zinc-200 dark:border-dark-700 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:scale-110 shadow-lg transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Próximo slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border border-zinc-200 dark:border-dark-700 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:scale-110 shadow-lg transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Barra de Paginação com 5 Bolinhas Interativas */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 p-1.5 rounded-full bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border border-zinc-200 dark:border-dark-700 shadow-md">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Ir para slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === idx
                    ? 'w-7 h-2 bg-gold-500 shadow-sm'
                    : 'w-2 h-2 bg-zinc-300 dark:bg-dark-700 hover:bg-zinc-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
