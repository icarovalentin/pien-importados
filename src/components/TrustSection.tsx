'use client';

import React from 'react';
import { ShieldCheck, MessageCircle, Award, CheckCircle2 } from 'lucide-react';
import { getGeneralSupportWhatsAppUrl } from '@/utils/whatsapp';

export function TrustSection() {
  const supportUrl = getGeneralSupportWhatsAppUrl();

  return (
    <section className="py-14 border-t border-zinc-200 dark:border-dark-800 bg-slate-50/80 dark:bg-dark-950/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Lado Esquerdo: Texto de Autoridade */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-700 dark:text-gold-400 text-xs font-semibold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" /> Compromisso com a Verdade
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white leading-snug">
              Por que a <span className="gold-gradient-text">Pien Importados</span> é de Confiança?
            </h2>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Sabemos que comprar perfumes importados e eletrônicos pela internet exige cuidado redobrado com réplicas e falsificações. Na Pien Importados, trabalhamos exclusivamente com produtos 100% originais e de procedência comprovada.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">Lotes Conferíveis (Batch Code)</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Todos os perfumes contêm o código de lote gravado no frasco e na caixa para consulta em sites oficiais de checagem.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">Produtos Lacrados de Fábrica</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Victoria&apos;s Secret, cremes e eletrônicos JBL em suas embalagens originais intactas.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">Fotos Reais no WhatsApp</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Antes de fechar o pedido, você pode solicitar fotos e vídeos reais do lote do produto em estoque.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-dark-900 border border-gold-500/40 text-gold-800 dark:text-gold-300 hover:text-black dark:hover:text-white hover:border-gold-500 text-xs sm:text-sm font-semibold transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Pedir fotos reais do estoque no WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Lado Direito: Card Ilustrativo de Garantia */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-dark-900 border border-zinc-200 dark:border-dark-800 relative overflow-hidden space-y-6 shadow-sm">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-600 dark:text-gold-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-white text-base">Garantia Pien de Originalidade</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Transparência em cada etapa</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-dark-850 border border-zinc-200 dark:border-dark-700">
                <span className="text-gold-700 dark:text-gold-400 font-bold block mb-1">Pronta-Entrega</span>
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Postamos em até 24h úteis com código de rastreamento direto no WhatsApp.</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-dark-850 border border-zinc-200 dark:border-dark-700">
                <span className="text-amber-700 dark:text-amber-400 font-bold block mb-1">Sob Encomenda</span>
                <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">Trazemos o modelo que você sonha com prazo claro e aviso de cada etapa.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-100 dark:bg-dark-950 border border-zinc-200 dark:border-dark-800 text-center">
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                Dúvidas sobre formas de pagamento e frete para sua cidade?
              </p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                Atendimento rápido e personalizado pelo WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
