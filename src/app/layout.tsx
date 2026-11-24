import type { Metadata } from 'next';
import './globals.css';
import { InterestListProvider } from '@/context/InterestListContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'Pien Importados | Perfumaria, Victoria\'s Secret & Som JBL 100% Originais',
  description: 'Catálogo oficial da Pien Importados. Perfumes importados, hidratantes Victoria\'s Secret, caixas de som JBL e eletrônicos premium à pronta-entrega e sob encomenda.',
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
    description: 'Perfumaria de luxo, Victoria\'s Secret e caixas de som JBL com procedência comprovada e garantia de originalidade.',
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
    <html lang="pt-BR" className="dark">
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <InterestListProvider>
            {children}
          </InterestListProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
