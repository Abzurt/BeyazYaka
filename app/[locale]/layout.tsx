import '../../styles/globals.css';
import { Inter } from 'next/font/google';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import AuthProvider from '@/components/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { i18n, type Locale } from '@/lib/i18n-config';
import { getDictionary } from '@/lib/get-dictionary';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import LayoutWrapper from '@/components/layout/LayoutWrapper';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.common.title + ' — Maaş Var, Huzur Yok',
    description: 'Kurumsal hayatın filtresiz topluluğu. Yaz, puanla, yorum yap.',
    viewport: 'width=device-width, initial-scale=1',
  };
}

import prisma from '@/lib/prisma';

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  const menuItems = await prisma.menuItem.findMany({
    where: { locale, isActive: true },
    orderBy: { order: 'asc' },
  });

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <LayoutWrapper locale={locale as Locale} dict={dict} menuItems={menuItems}>
              {children}
            </LayoutWrapper>
            <Analytics />
            <SpeedInsights />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
