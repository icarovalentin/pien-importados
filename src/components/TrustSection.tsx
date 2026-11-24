'use client';

import React from 'react';
import { getGeneralSupportWhatsAppUrl } from '@/utils/whatsapp';

export function TrustSection() {
  const supportUrl = getGeneralSupportWhatsAppUrl();

  return (
    <section className="py-16 border-t border-[#e5e0d5] dark:border-dark-800 bg-[#f6f3ec] dark:bg-dark-900/40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Lado Esquerdo: Compromisso Editorial */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#8b6508] dark:text-gold-400 font-semibold">
                Autenticidade &amp; Procedência
              </p>
              <h2 className="text-2xl sm:text-3xl font-display font-normal text-[#141414] dark:text-white leading-snug">
                Originalidade conferível antes mesmo do envio.
              </h2>
            </div>

            <div className="divide-y divide-[#e3dfd5] dark:divide-dark-800 border-y border-[#e3dfd5] dark:border-dark-800">
              <div className="py-4 flex items-start gap-4">
                <span className="text-xs font-display text-[#8b6508] dark:text-gold-400 pt-0.5">01</span>
                <div>
                  <h3 className="text-sm font-semibold text-[#141414] dark:text-white">
                    Lotes Conferíveis (Batch Code)
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    Perfumes com código de lote gravado no frasco e na embalagem para consulta direta.
                  </p>
                </div>
              </div>

              <div className="py-4 flex items-start gap-4">
                <span className="text-xs font-display text-[#8b6508] dark:text-gold-400 pt-0.5">02</span>
                <div>
                  <h3 className="text-sm font-semibold text-[#141414] dark:text-white">
                    Embalagens Lacradas de Fábrica
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    Linha Victoria&apos;s Secret, caixas JBL e dispositivos Apple em embalagens originais intactas.
                  </p>
                </div>
              </div>

              <div className="py-4 flex items-start gap-4">
                <span className="text-xs font-display text-[#8b6508] dark:text-gold-400 pt-0.5">03</span>
                <div>
                  <h3 className="text-sm font-semibold text-[#141414] dark:text-white">
                    Fotos e Vídeos Reais do Estoque
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                    Solicite fotos do item real em mãos pelo WhatsApp antes de finalizar sua compra.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-[#141414] hover:bg-[#2c2c2c] dark:bg-gold-500 dark:hover:bg-gold-400 text-white dark:text-[#0c0c0f] text-[11px] uppercase tracking-[0.18em] font-semibold transition-colors"
              >
                Solicitar Fotos no WhatsApp
              </a>
            </div>
          </div>

          {/* Lado Direito: Formatos de Entrega */}
          <div className="lg:col-span-5 bg-[#fcfbf8] dark:bg-[#111116] border border-[#e5e0d5] dark:border-dark-800 p-6 sm:p-8 space-y-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Modalidades de Atendimento
              </p>
              <h3 className="text-xl font-display text-[#141414] dark:text-white mt-1">
                Como funcionam os pedidos
              </h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[#f6f3ec] dark:bg-dark-900 border-l-2 border-[#065f46] dark:border-emerald-400">
                <span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#065f46] dark:text-emerald-400 block">
                  Pronta-Entrega
                </span>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                  Produtos disponíveis em estoque com envio em até 24 horas úteis e código de rastreio enviado no WhatsApp.
                </p>
              </div>

              <div className="p-4 bg-[#f6f3ec] dark:bg-dark-900 border-l-2 border-[#92400e] dark:border-amber-400">
                <span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-[#92400e] dark:text-amber-400 block">
                  Sob Encomenda
                </span>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">
                  Trazemos fragrâncias e eletrônicos específicos sob pedido com prazo informado previamente.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-[#e5e0d5] dark:border-dark-800">
              Cotações, frete e formas de pagamento combinados diretamente no atendimento pelo WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
