'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FolderTree, 
  FileText, 
  Flag, 
  MessageSquare, 
  LayoutGrid, 
  BrainCircuit, 
  Settings,
  ChevronRight,
  GalleryHorizontal,
  LayoutTemplate,
  Activity
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: GalleryHorizontal, label: 'Manşetler', href: '/admin/carousel' },
  { icon: LayoutTemplate, label: 'Hub Sayfaları', href: '/admin/hubs' },
  { icon: Users, label: 'Üyeler', href: '/admin/users' },
  { icon: FolderTree, label: 'Kategoriler', href: '/admin/categories' },
  { icon: FileText, label: 'İçerikler', href: '/admin/posts' },
  { icon: MessageSquare, label: 'Yorumlar', href: '/admin/comments' },
  { icon: Flag, label: 'Raporlar', href: '/admin/reports' },
  { icon: LayoutGrid, label: 'Reklamlar', href: '/admin/ads' },
  { icon: BrainCircuit, label: 'Testler', href: '/admin/quizzes' },
  { icon: Activity, label: 'Kullanıcı Logları', href: '/admin/logs' },
  { icon: Settings, label: 'Sistem', href: '/admin/settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || 'tr';

  const getContentHref = (itemHref: string, locale: string) => {
    return `/${locale}${itemHref}`;
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoWrapper}>
        <div className={styles.logoRow}>
          <Link href={`/${currentLocale}`} className={styles.logo}>
            BEYAZ <span>YAKA</span>
          </Link>
          <span className={styles.badge}>ADMIN</span>
        </div>
        
        <div className={styles.contentLanguageSwitcher}>
          <span className={styles.switcherLabel}>İçerik Dili:</span>
          <div className={styles.switchButtons}>
            {['tr', 'en'].map((lang) => (
              <Link
                key={lang}
                href={pathname.replace(`/${currentLocale}/`, `/${lang}/`)}
                className={`${styles.langBtn} ${currentLocale === lang ? styles.activeLang : ''}`}
              >
                {lang.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const localizedHref = getContentHref(item.href, currentLocale);
          const isActive = pathname === localizedHref;
          
          return (
            <Link 
              key={item.href} 
              href={localizedHref}
              className={`${styles.navLink} ${isActive ? styles.active : ''}`}
            >
              <item.icon size={20} />
              <span className={styles.label}>{item.label}</span>
              {isActive && <ChevronRight size={16} className={styles.chevron} />}
            </Link>
          );
        })}
      </nav>
      
      <div className={styles.footer}>
        <p>© 2026 Panel v1.0</p>
      </div>
    </aside>
  );
}
