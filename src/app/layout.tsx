import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { InterestListProvider } from '@/context/InterestListContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Pien Importados | Perfumaria, Eletrônicos & Smartphones Originais",
  description:
    "Catálogo oficial da Pien Importados. Perfumes importados, linha Victoria's Secret, smartphones, caixas de som JBL e acessórios tech à pronta-entrega e sob encomenda.",
  keywords: [
    'Pien Importados',
    'Perfumes importados',
    'Smartphones importados',
    'Victoria Secret original',
    'JBL original',
    'AirPods',
    'Dior Sauvage',
  ],
  openGraph: {
    title: 'Pien Importados | Catálogo Oficial de Importados',
    description:
      'Perfumaria de grife, smartphones e eletrônicos com procedência comprovada e atendimento direto no WhatsApp.',
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased min-h-screen font-sans">
        <ThemeProvider>
          <ToastProvider>
            <InterestListProvider>{children}</InterestListProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
