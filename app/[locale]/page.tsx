import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Carousel } from '@/components/ui/Carousel';
import { Star, TrendingUp, ShieldCheck, ExternalLink } from 'lucide-react';
import styles from './page.module.css';
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/lib/i18n-config';
import prisma from '@/lib/prisma';
import { ContentArea } from '@prisma/client';

export default async function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  // Fetch data directly in Server Component
  const [carouselItems, trendingPostsRaw] = await Promise.all([
    prisma.carouselItem.findMany({
      where: {
        status: "active",
        locale: locale
      },
      orderBy: { order: "asc" },
    }),
    prisma.post.findMany({
      where: {
        status: "published",
        area: ContentArea.forum,
        locale: locale,
        isFeatured: true
      },
      include: {
        author: {
          select: { username: true, image: true },
        },
        category: true,
      },
      orderBy: [
        { viewCount: "desc" },
        { createdAt: "desc" }
      ],
      take: 3,
    })
  ]);

  // Enrich trending posts with ratings
  const postIds = trendingPostsRaw.map(p => p.id);
  const ratingAggs = await prisma.postRating.groupBy({
    by: ['postId'],
    where: { postId: { in: postIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const ratingMap = Object.fromEntries(
    ratingAggs.map(r => [r.postId, { avg: r._avg.rating, count: r._count.rating }])
  );

  const trendingPosts = trendingPostsRaw.map(p => ({
    ...p,
    avgRating: ratingMap[p.id]?.avg ? Number(ratingMap[p.id].avg.toFixed(1)) : null,
    ratingCount: ratingMap[p.id]?.count ?? 0,
  }));

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
          {carouselItems.length > 0 ? (
            <Carousel items={carouselItems} />
          ) : (
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
