'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
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
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(10, 12, 16, 0.8)',
        borderBottom: '1px solid var(--border-dim)'
      }}>
        <div className="container" style={{
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Link href={`/${locale}`} style={{ 
            textDecoration: 'none', 
            color: 'inherit',
            fontSize: '24px', 
            fontWeight: 'bold', 
            fontFamily: 'Space Grotesk' 
          }}>
            {dict.common.subtitle} <span style={{ color: 'var(--accent)' }}>YAKA</span> DOSYASI
          </Link>
          
          <nav style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'center' }}>
            {menuItems.map(item => (
              <Link key={item.id} href={`/${locale}${item.url}`} className="ghost">{item.title}</Link>
            ))}
            <Button href={`/${locale}/register`} size="sm">{dict.common.register}</Button>
            <LanguageSwitcher currentLocale={locale} />
          </nav>
        </div>
      </header>

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
