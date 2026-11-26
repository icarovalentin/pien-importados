'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Product } from '@/types/product';
import { DEFAULT_PRODUCT_IMAGE, getCategoryNotice } from '@/config/site';
import {
  X,
  MessageCircle,
  ShieldCheck,
  Check,
  Plus,
  Clock,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, getProductWhatsAppUrl } from '@/utils/whatsapp';
import { makeInterestKey, useInterestList } from '@/context/InterestListContext';
import { useToast } from '@/context/ToastContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductModal({ product, onClose }: ProductModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const { addItem, removeItem, isInList } = useInterestList();
  const { showToast } = useToast();

  useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedVariantIndex(0);
  }, [product?.id]);

  // Trocar de variação volta para a primeira foto dela
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [selectedVariantIndex]);

  useEffect(() => {
    if (!product) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const variants = product.variants || [];
  const activeVariant = variants.length > 0 ? variants[selectedVariantIndex] || variants[0] : undefined;
  const displayPrice = activeVariant?.price ?? product.price;
  const inList = isInList(product.id, activeVariant?.label);
  const whatsappUrl = getProductWhatsAppUrl(product, activeVariant);
  const isProntaEntrega = product.status === 'pronta_entrega';
  const baseImages =
    product.images && product.images.length > 0 ? product.images : [DEFAULT_PRODUCT_IMAGE];
  const galleryImages =
    activeVariant?.images && activeVariant.images.length > 0 ? activeVariant.images : baseImages;
  const totalImages = galleryImages.length;
  const displayDescription = activeVariant?.description || product.description;
  const displaySpecs =
    activeVariant?.specs && activeVariant.specs.length > 0 ? activeVariant.specs : product.specs;
  const variantsWithPhotos = variants.some((v) => v.images && v.images.length > 0);
  const isFragranceCategory =
    product.category === 'perfumes' ||
    product.category === 'arabes' ||
    product.category === 'beleza';
  const categoryNotice = getCategoryNotice(product.category);

  const nextImage = () => {
    if (totalImages <= 1) return;
    setSelectedImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    if (totalImages <= 1) return;
    setSelectedImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || totalImages <= 1) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextImage();
      else prevImage();
    }
    touchStartX.current = null;
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/?produto=${encodeURIComponent(product.id)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Link do produto copiado.');
    } catch {
      showToast('Copie o endereço da barra do navegador.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm animate-fadeIn"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-[#fcfbf8] dark:bg-[#111116] border border-[#e5e0d5] dark:border-dark-700 overflow-hidden shadow-2xl z-10 flex flex-col md:flex-row max-h-[90vh]">
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5">
          <button
            onClick={handleCopyLink}
            aria-label="Copiar link do produto"
            title="Copiar link direto deste produto"
            className="p-2 bg-white/90 text-[#141414] hover:bg-[#141414] hover:text-white dark:bg-dark-900 dark:text-zinc-300 dark:hover:text-white border border-[#e5e0d5] dark:border-dark-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            aria-label="Fechar detalhes"
            className="p-2 bg-white/90 text-[#141414] hover:bg-[#141414] hover:text-white dark:bg-dark-900 dark:text-zinc-300 dark:hover:text-white border border-[#e5e0d5] dark:border-dark-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lado Esquerdo: Galeria com swipe no celular */}
        <div className="w-full md:w-1/2 bg-[#fcfbf8] dark:bg-dark-950 flex flex-col items-center justify-center p-6">
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative w-full aspect-[4/5] bg-[#fcfbf8] dark:bg-white overflow-hidden touch-pan-y"
          >
            <Image
              src={galleryImages[selectedImageIndex] || galleryImages[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 90vw, 420px"
              quality={90}
              priority
              className="object-contain mix-blend-multiply dark:mix-blend-normal brightness-[1.05]"
            />

            {totalImages > 1 && (
              <>
                <button
                  onClick={prevImage}
                  aria-label="Foto anterior"
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/85 hover:bg-white text-[#141414] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  aria-label="Próxima foto"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/85 hover:bg-white text-[#141414] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {totalImages > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto max-w-full">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-14 h-14 shrink-0 overflow-hidden border transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#141414] dark:border-gold-400 opacity-100'
                      : 'border-[#d6d0c4] dark:border-dark-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-contain mix-blend-multiply dark:mix-blend-normal brightness-[1.05] p-0.5"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lado Direito: Detalhes */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col overflow-y-auto space-y-5">
          <div className="space-y-1.5 pr-14">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
              <span className="font-semibold text-[#8b6508] dark:text-gold-400">
                {product.brand}
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">·</span>
              <span className="text-zinc-500 dark:text-zinc-400">
                {product.categoryLabel}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-display font-normal text-[#141414] dark:text-white leading-snug">
              {product.name}
            </h2>
            {activeVariant && variantsWithPhotos && (
              <p className="text-sm text-[#8b6508] dark:text-gold-400 font-medium">
                {activeVariant.label}
              </p>
            )}
          </div>

          {/* Preço & Disponibilidade */}
          <div className="py-3 border-y border-[#e5e0d5] dark:border-dark-800 space-y-1.5">
            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl font-semibold text-[#141414] dark:text-white">
                {formatCurrency(displayPrice)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-zinc-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-xs flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-[#8b6508] dark:text-gold-400" />
              <span
                className={
                  isProntaEntrega
                    ? 'text-[#065f46] dark:text-emerald-400 font-medium'
                    : 'text-[#92400e] dark:text-amber-400 font-medium'
                }
              >
                {isProntaEntrega ? 'Pronta-entrega' : 'Sob encomenda'}
              </span>
              <span className="text-zinc-400">·</span>
              <span>{product.deliveryTime}</span>
            </p>
          </div>

          {categoryNotice && (
            <p className="text-[11px] leading-relaxed text-[#92400e] dark:text-amber-400 bg-[#fbf3e4] dark:bg-amber-950/30 border border-[#ecd9b0] dark:border-amber-900/50 px-3 py-2.5">
              {categoryNotice}
            </p>
          )}

          {/* Seletor de Variações: com fotos vira grade de miniaturas; sem fotos, botões de texto */}
          {variants.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
                {variantsWithPhotos
                  ? isFragranceCategory
                    ? `Escolha a fragrância (${variants.length})`
                    : `Escolha a opção (${variants.length})`
                  : 'Selecione uma opção'}
              </h4>
              {variantsWithPhotos ? (
                <div
                  role="radiogroup"
                  aria-label={isFragranceCategory ? 'Fragrâncias disponíveis' : 'Opções disponíveis'}
                  className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1"
                >
                  {variants.map((variant, idx) => {
                    const selected = idx === selectedVariantIndex;
                    const thumb = variant.images?.[0];
                    return (
                      <button
                        key={variant.id || variant.label}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={variant.label}
                        title={variant.label}
                        onClick={() => setSelectedVariantIndex(idx)}
                        className={`relative aspect-square overflow-hidden border bg-[#fcfbf8] dark:bg-white transition-all ${
                          selected
                            ? 'border-[#141414] dark:border-gold-400 ring-1 ring-[#141414] dark:ring-gold-400'
                            : 'border-[#d6d0c4] dark:border-dark-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-contain mix-blend-multiply dark:mix-blend-normal brightness-[1.05] p-0.5"
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-[9px] px-1 text-center leading-tight">
                            {variant.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant, idx) => {
                    const selected = idx === selectedVariantIndex;
                    return (
                      <button
                        key={variant.id || variant.label}
                        type="button"
                        onClick={() => setSelectedVariantIndex(idx)}
                        className={`px-3 py-1.5 text-xs border transition-colors ${
                          selected
                            ? 'bg-[#141414] text-white border-[#141414] dark:bg-gold-500 dark:text-[#0c0c0f] dark:border-gold-500 font-semibold'
                            : 'bg-transparent text-[#141414] dark:text-zinc-300 border-[#d6d0c4] dark:border-dark-700 hover:border-[#141414] dark:hover:border-gold-400'
                        }`}
                      >
                        {variant.label}
                        {variant.price ? ` · ${formatCurrency(variant.price)}` : ''}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Descrição */}
          {displayDescription && (
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400 mb-1.5">
                Sobre o produto
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                {displayDescription}
              </p>
            </div>
          )}

          {/* Especificações */}
          {displaySpecs && displaySpecs.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400 mb-2">
                Especificações
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                {displaySpecs.map((spec, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#8b6508] dark:bg-gold-400 shrink-0" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Garantia */}
          {product.batchCodeInfo && (
            <div className="p-3.5 bg-[#f6f3ec] dark:bg-dark-900 border border-[#e5e0d5] dark:border-dark-800 flex items-start gap-2.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-[#8b6508] dark:text-gold-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#141414] dark:text-white">Procedência Garantida</p>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                  {product.batchCodeInfo}
                </p>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="pt-2 space-y-2.5 mt-auto">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#065f46] hover:bg-[#047857] text-white text-xs uppercase tracking-[0.16em] font-semibold transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Pedir no WhatsApp</span>
            </a>

            <button
              onClick={() => {
                if (inList) {
                  removeItem(makeInterestKey(product.id, activeVariant?.label));
                  showToast('Item removido da lista de orçamento.');
                } else {
                  addItem(product, activeVariant);
                  showToast('Adicionado à lista de orçamento.');
                }
              }}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 text-[11px] uppercase tracking-[0.14em] font-semibold border transition-colors ${
                inList
                  ? 'bg-[#141414] text-[#d4af37] border-[#141414] dark:bg-gold-500 dark:text-[#0c0c0f] dark:border-gold-500'
                  : 'bg-transparent text-[#141414] dark:text-zinc-200 border-[#d6d0c4] dark:border-dark-700 hover:border-[#141414] dark:hover:border-gold-400'
              }`}
            >
              {inList ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Na sua lista de orçamento</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar à lista de orçamento</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
