"use client";

import styles from './forum.module.css';
import { Card } from '@/components/ui/Card';
import { ShieldAlert, DollarSign, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/lib/i18n-config';
import { use } from 'react';

const CATEGORY_ICONS: Record<string, any> = {
  'gercekler-ve-yalanlar': ShieldAlert,
  'realities-and-lies': ShieldAlert,
  'maas-ve-yan-haklar': DollarSign,
  'salary-and-benefits': DollarSign,
  'ofis-dedikodulari': MessageSquare,
  'office-gossip': MessageSquare,
};

export default function ForumPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params);
  const [dict, setDict] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const d = await getDictionary(locale);
      setDict(d);
      setLoading(false);
    }
    init();
  }, [locale]);

  if (loading || !dict) {
    return (
      <div className="container" style={{ paddingTop: 'var(--space-xxl)' }}>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          {dict?.forum?.loading || '...'}
        </p>
      </div>
    );
  }

  const categories = dict.forum.categories as Array<{ name: string; slug: string; description: string }>;

  return (
    <div className="container" style={{ paddingTop: 'var(--space-xxl)' }}>
      <header className={styles.header}>
        <h1 className={styles.title}>{dict.forum.title}</h1>
        <p className={styles.subtitle}>{dict.forum.subtitle}</p>
      </header>

      {categories.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{dict.forum.empty}</p>
      ) : (
        <div className={styles.categoryGrid}>
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.slug] || ShieldAlert;
            return (
              <Card
                key={cat.slug}
                interactive
                className={styles.catCard}
              >
                <a href={`/${locale}/forum/${cat.slug}`} className={styles.catLink}>
                  <div className={styles.iconWrapper}>
                    <Icon size={32} className={styles.icon} />
                  </div>
                  <h3 className={styles.catName}>{cat.name}</h3>
                  <p className={styles.catDesc}>{cat.description}</p>
                </a>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
