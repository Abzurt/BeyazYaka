"use client";

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Carousel } from '@/components/ui/Carousel';
import { useState, useEffect } from 'react';
import { Star, TrendingUp, ShieldCheck, ExternalLink } from 'lucide-react';
import styles from './page.module.css';
import { use } from 'react';
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/lib/i18n-config';

export default function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params);
  const [dict, setDict] = useState<any>(null);
  const [carouselItems, setCarouselItems] = useState<any[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const d = await getDictionary(locale);
      setDict(d);

      try {
        const [carouselRes, trendingRes] = await Promise.all([
          fetch(`/api/carousel?locale=${locale}`),
          fetch(`/api/posts/trending?locale=${locale}`)
        ]);

        if (carouselRes.ok) {
          const data = await carouselRes.json();
          setCarouselItems(data);
        }

        if (trendingRes.ok) {
          const data = await trendingRes.json();
          setTrendingPosts(data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [locale]);

  if (!dict) return null;

  // Use dynamic trending posts if available, otherwise fall back to static dict
  const trends = trendingPosts.length > 0
    ? trendingPosts.map((p: any) => ({
        id: p.id,
        title: p.title,
        subtitle: p.category?.name || '',
        content: p.excerpt || p.content?.slice(0, 120) + '...',
        avgRating: p.avgRating,
        ratingCount: p.ratingCount,
        slug: p.slug,
        categorySlug: p.category?.slug,
      }))
    : (dict.home.trends || []).map((t: any) => ({
        ...t,
        id: null,
        slug: null,
        categorySlug: null,
      }));

  return (
    <div className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container" style={{ width: '100%' }}>
          {!loading && carouselItems.length > 0 ? (
            <Carousel items={carouselItems} />
          ) : !loading && (
            <div className={styles.emptyCarousel}>{dict.home.emptyCarousel}</div>
          )}
        </div>
        <div className={styles.heroGlow}></div>
      </section>

      {/* Trend Section */}
      <section className={styles.section}>
        <div className="container">
          <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-xl)' }}>
            <h2 className={styles.sectionTitle}>
              <TrendingUp className={styles.sectionIcon} />
              {dict.home.trendTitle}
            </h2>
            <a href={`/${locale}/forum`} className={styles.viewAll}>{dict.home.viewAll}</a>
          </div>
          
          <div className="grid gap-md" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
            {trends.map((item: any, index: number) => (
              <Card 
                key={item.id || index}
                interactive 
                title={item.title}
                subtitle={item.subtitle}
                footer={
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-xs" style={{ color: 'var(--accent)' }}>
                      <Star size={16} fill={item.avgRating ? 'var(--accent)' : 'transparent'} stroke={item.avgRating ? 'var(--accent)' : 'var(--text-muted)'} />
                      <span style={{ fontWeight: 600 }}>{item.avgRating ?? '—'}</span>
                      {item.ratingCount > 0 && (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          ({item.ratingCount} {dict.home.starVotes})
                        </span>
                      )}
                    </div>
                    {item.slug && (
                      <a
                        href={`/${locale}/forum/${item.categorySlug}`}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--accent)', textDecoration: 'none' }}
                      >
                        <ExternalLink size={12} />
                        {dict.home.viewAll.replace(' →', '')}
                      </a>
                    )}
                  </div>
                }
              >
                <p style={{ color: 'var(--text-secondary)' }}>
                  {item.content}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Survival Kit Hero */}
      <section className={`${styles.section} ${styles.survivalSection}`}>
        <div className="container">
          <div className={styles.survivalContent}>
            <div className={styles.badge} style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <ShieldCheck size={14} />
              <span>{dict.home.survivalBadge}</span>
            </div>
            <h2 className={styles.hugeTitle}>{dict.home.survivalTitle}</h2>
            <p className={styles.survivalSubtitle}>
              {dict.home.survivalSubtitle}
            </p>
            <Button href={`/${locale}/survival-kit`} variant="outline" size="lg">{dict.home.survivalButton}</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
