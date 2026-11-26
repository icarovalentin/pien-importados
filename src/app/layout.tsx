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

function resolveMetadataBase(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'https://pien-importados.vercel.app');
  try {
    return new URL(raw);
  } catch {
    return new URL('https://pien-importados.vercel.app');
  }
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: 'Pien Importados | Perfumaria, Eletrônicos & Smartphones Originais',
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

const themeInitScript =
  "(function(){try{if(localStorage.getItem('pien_theme_v2')==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
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
