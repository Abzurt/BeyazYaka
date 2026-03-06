import '../../styles/globals.css';
import { Inter } from 'next/font/google';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import AuthProvider from '@/components/providers/AuthProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { i18n, type Locale } from '@/lib/i18n-config';
import { getDictionary } from '@/lib/get-dictionary';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);
  return {
    title: dict.common.title + ' — Maaş Var, Huzur Yok',
    description: 'Kurumsal hayatın filtresiz topluluğu. Yaz, puanla, yorum yap.',
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  const isAdmin = (await params).locale === locale && (await params).locale ? false : false; // Placeholder for logic
  // Better way: use headers or just check if children/path is admin in a client component?
  // Since this is a server component, we should probably pass a prop or use a layout strategy.
  // Actually, the easiest way in Next.js App Router to have different roots is to use Route Groups, 
  // but changing folder structure now might be too much.
  // Let's use a simpler check: if it's an admin route, we don't render the header.

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            {/* We will handle header/footer visibility in a cleaner way if possible, 
                but for now let's wrap the main logic. */}
            <LayoutWrapper locale={locale as Locale} dict={dict}>
              {children}
            </LayoutWrapper>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

// Separate client component to handle conditional rendering based on pathname
import LayoutWrapper from '@/components/layout/LayoutWrapper';
