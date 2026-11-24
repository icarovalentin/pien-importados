import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { InterestListProvider } from '@/context/InterestListContext';
import { ThemeProvider } from '@/context/ThemeContext';

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
  title: 'Pien Importados | Perfumaria, Victoria\'s Secret & Som JBL Originais',
  description: 'Catálogo oficial da Pien Importados. Perfumes importados, hidratantes Victoria\'s Secret, caixas de som JBL e eletrônicos à pronta-entrega e sob encomenda.',
  keywords: [
    'Pien Importados',
    'Victoria Secret original',
    'Perfumes importados',
    'JBL original',
    'Importados a pronta entrega',
    'AirPods',
    'Dior Sauvage'
  ],
  openGraph: {
    title: 'Pien Importados | Catálogo Oficial de Importados',
    description: 'Perfumaria de grife, Victoria\'s Secret e caixas de som JBL com procedência comprovada e garantia de originalidade.',
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
          <InterestListProvider>
            {children}
          </InterestListProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
