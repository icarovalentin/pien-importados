'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import { getGeneralSupportWhatsAppUrl } from '@/utils/whatsapp';

export function Footer() {
  const supportUrl = getGeneralSupportWhatsAppUrl();

  return (
    <footer className="border-t border-zinc-200 dark:border-dark-800 bg-zinc-100 dark:bg-dark-950 text-zinc-600 dark:text-zinc-400 text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Coluna 1: Marca */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-wider text-zinc-900 dark:text-white">
                PIEN
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest bg-gold-500/20 text-gold-700 dark:text-gold-400 border border-gold-500/30">
                Importados
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-sm leading-relaxed text-xs">
              Sua vitrine exclusiva de produtos importados: perfumaria de grife, hidratantes e mists Victoria&apos;s Secret, eletrônicos JBL e acessórios tech com garantia de procedência.
            </p>
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-500 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-gold-600 dark:text-gold-400" />
              <span>Produtos 100% Originais e Lacrados</span>
            </div>
          </div>

          {/* Coluna 2: Departamentos */}
          <div className="space-y-2">
            <h4 className="font-bold text-zinc-900 dark:text-white uppercase text-[11px] tracking-wider">
              Departamentos
            </h4>
            <ul className="space-y-1.5 text-zinc-600 dark:text-zinc-400">
              <li>Perfumaria Fina (Masculina & Feminina)</li>
              <li>Victoria&apos;s Secret (Hidratantes & Mists)</li>
              <li>Áudio & Caixas JBL Originais</li>
              <li>Fones de Ouvido & Smart Tech</li>
              <li>Itens Especiais sob Encomenda</li>
            </ul>
          </div>

          {/* Coluna 3: Atendimento WhatsApp & Gestão */}
          <div className="space-y-2">
            <h4 className="font-bold text-zinc-900 dark:text-white uppercase text-[11px] tracking-wider">
              Atendimento Direto
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs">
              Todas as cotações, pedidos e dúvidas são atendidas diretamente no WhatsApp.
            </p>
            <div className="pt-1 flex flex-col gap-1.5 items-start">
              <a
                href={supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>+595 973 860900</span>
              </a>
            </div>

            {/* Link para o Painel Administrativo */}
            <div className="pt-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
              >
                <Lock className="w-3 h-3 text-gold-500" />
                <span>Acesso Painel do Lojista</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Linha Inferior */}
        <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-dark-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} Pien Importados. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
            <span>Qualidade, originalidade e transparência</span>
            <Sparkles className="w-3 h-3 text-gold-600 dark:text-gold-400" />
          </p>
        </div>
      </div>
    </footer>
  );
}
