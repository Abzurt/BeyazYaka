'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Locale } from '@/lib/i18n-config';
import styles from './Header.module.css';

interface MenuItem {
    id: string;
    title: string;
    url: string;
    order: number;
}

interface HeaderProps {
    locale: Locale;
    dict: any;
    menuItems: MenuItem[];
}

export default function Header({ locale, dict, menuItems }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // Prevent scroll when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMenuOpen]);

    return (
        <header className={styles.header}>
            <div className={`container ${styles.container}`}>
                <Link href={`/${locale}`} className={styles.logo}>
                    {dict.common.subtitle} <span className={styles.logoAccent}>YAKA</span> DOSYASI
                </Link>

                {/* Desktop Navigation */}
                <nav className={styles.nav}>
                    {menuItems.map(item => (
                        <Link key={item.id} href={`/${locale}${item.url}`} className="ghost">
                            {item.title}
                        </Link>
                    ))}
                    <Button href={`/${locale}/register`} size="sm">
                        {dict.common.register}
                    </Button>
                    <LanguageSwitcher currentLocale={locale} />
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className={styles.mobileMenuBtn}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Mobile Navigation Overlay */}
                <div className={`${styles.mobileNav} ${isMenuOpen ? styles.mobileNavActive : ''}`}>
                    {menuItems.map(item => (
                        <Link
                            key={item.id}
                            href={`/${locale}${item.url}`}
                            className={styles.navItem}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.title}
                        </Link>
                    ))}
                    <div className={styles.mobileActions}>
                        <Button href={`/${locale}/register`} size="lg" fullWidth>
                            {dict.common.register}
                        </Button>
                        <LanguageSwitcher currentLocale={locale} />
                    </div>
                </div>
            </div>
        </header>
    );
}
