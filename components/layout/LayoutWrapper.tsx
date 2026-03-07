'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import { Locale } from '@/lib/i18n-config';

interface MenuItem {
  id: string;
  title: string;
  url: string;
  order: number;
}

interface LayoutWrapperProps {
  children: React.ReactNode;
  locale: Locale;
  dict: any;
  menuItems: MenuItem[];
}

export default function LayoutWrapper({ children, locale, dict, menuItems }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith(`/${locale}/admin`) || pathname?.startsWith('/admin');

  if (isAdmin) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Header locale={locale} dict={dict} menuItems={menuItems} />

      <main>{children}</main>

      <footer style={{
        padding: 'var(--space-xxl) 0',
        borderTop: '1px solid var(--border-dim)',
        marginTop: 'var(--space-xxl)',
        color: 'var(--text-muted)',
        textAlign: 'center'
      }}>
        <div className="container">
          <p>{dict.common.copyright}</p>
        </div>
      </footer>
    </>
  );
}
