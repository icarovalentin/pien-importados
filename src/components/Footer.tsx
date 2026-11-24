'use client';

import React from 'react';
import { getGeneralSupportWhatsAppUrl } from '@/utils/whatsapp';
import { STORE_PHONE_DISPLAY } from '@/data/products';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Footer() {
  const supportUrl = getGeneralSupportWhatsAppUrl();

  return (
    <footer className="bg-[#141414] text-zinc-400 text-xs border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Coluna 1: Marca */}
          <div className="md:col-span-5 space-y-3">
            <div className="leading-none">
              <span className="block text-xl tracking-[0.3em] font-display text-white">
                PIEN
              </span>
              <span className="block text-[9px] tracking-[0.26em] uppercase text-[#d4af37] mt-1">
                Importados
              </span>
            </div>
            <p className="text-zinc-400 max-w-sm leading-relaxed text-xs pt-1">
              Curadoria de perfumes importados, linha Victoria&apos;s Secret, caixas de som JBL e eletrônicos selecionados com procedência garantida.
            </p>
          </div>

          {/* Coluna 2: Departamentos */}
          <div className="md:col-span-3 space-y-2.5">
            <h4 className="font-semibold text-white uppercase text-[10px] tracking-[0.2em]">
              Departamentos
            </h4>
            <ul className="space-y-1.5 text-zinc-400">
              <li>Perfumaria Masculina &amp; Feminina</li>
              <li>Victoria&apos;s Secret (Mists &amp; Cremes)</li>
              <li>Áudio &amp; Caixas JBL Originais</li>
              <li>Eletrônicos &amp; Acessórios Tech</li>
            </ul>
          </div>

          {/* Coluna 3: Atendimento */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-semibold text-white uppercase text-[10px] tracking-[0.2em]">
              Atendimento Direto
            </h4>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Pedidos, dúvidas e verificação de estoque diretamente pelo WhatsApp.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-[#d4af37] hover:bg-[#e6ca65] text-[#141414] font-semibold text-[11px] uppercase tracking-[0.15em] transition-colors"
              >
                WhatsApp · {STORE_PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>

        {/* Linha Inferior */}
        <div className="mt-10 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>&copy; {new Date().getFullYear()} Pien Importados. Todos os direitos reservados.</p>

          <div className="flex items-center gap-4">
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
