import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

// Inter font — per spec_ui.md: "fontes robustas como Inter, pesos Medium/Semi-Bold"
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Obra Fácil — Profissionais de confiança perto de você',
  description:
    'Encontre profissionais qualificados, compare preços de materiais e gerencie suas obras em um só lugar.',
  keywords: ['obras', 'profissionais', 'reforma', 'construção', 'materiais'],
};

export const viewport = {
  themeColor: '#ec5b13',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        {/* Material Symbols Outlined — icon system per Stitch prototypes */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="font-sans antialiased bg-surface text-slate-900">
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
