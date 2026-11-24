'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'Como posso confirmar que os produtos são originais?',
    a: 'Todos os perfumes acompanham código de lote (batch code) gravado no frasco e na embalagem para conferência. Eletrônicos e smartphones vão lacrados de fábrica com número de série oficial da marca. Antes do envio, também enviamos fotos e vídeo real do item no WhatsApp.',
  },
  {
    q: 'Qual a diferença entre Pronta-Entrega e Sob Encomenda?',
    a: 'Itens à Pronta-Entrega já estão em estoque e são enviados em até 24 horas úteis após a confirmação. Itens Sob Encomenda são importados diretamente sob pedido — informamos o prazo exato e acompanhamos cada etapa pelo WhatsApp.',
  },
  {
    q: 'Quais são as formas de pagamento e envio?',
    a: 'Trabalhamos com PIX, transferência e opções parceladas combinadas diretamente no atendimento pelo WhatsApp, além de cálculo transparente de frete para sua região.',
  },
  {
    q: 'Posso encomendar um modelo ou fragrância que não está no catálogo?',
    a: 'Sim. Se você procura um smartphone específico, perfume importado ou eletrônico fora da vitrine atual, basta chamar no WhatsApp que verificamos disponibilidade e cotação na hora.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 border-t border-[#e5e0d5] dark:border-dark-800 bg-[#fcfbf8] dark:bg-[#0c0c0f] transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#8b6508] dark:text-gold-400 font-semibold">
            Atendimento Transparente
          </p>
          <h2 className="text-2xl sm:text-3xl font-display font-normal text-[#141414] dark:text-white">
            Dúvidas Frequentes
          </h2>
        </div>

        <div className="divide-y divide-[#e5e0d5] dark:divide-dark-800 border-y border-[#e5e0d5] dark:border-dark-800">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={item.q}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full py-4 sm:py-5 flex items-center justify-between gap-4 text-left group"
                >
                  <span className="text-sm sm:text-base font-display text-[#141414] dark:text-white group-hover:text-[#8b6508] dark:group-hover:text-gold-400 transition-colors">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#141414] dark:text-gold-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <p className="pb-5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
