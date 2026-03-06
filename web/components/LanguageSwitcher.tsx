"use client";

import { usePathname, useRouter } from 'next/navigation';
import { i18n, type Locale } from '@/lib/i18n-config';
import styles from './LanguageSwitcher.module.css';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const redirectedPathname = (locale: Locale) => {
    if (!pathname) return '/';
    const segments = pathname.split('/');
    segments[1] = locale;
    return segments.join('/');
  };

  const handleLocaleChange = (locale: Locale) => {
    router.push(redirectedPathname(locale));
  };

  return (
    <div className={styles.container}>
      {i18n.locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleLocaleChange(locale)}
          className={`${styles.button} ${currentLocale === locale ? styles.active : ''}`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
