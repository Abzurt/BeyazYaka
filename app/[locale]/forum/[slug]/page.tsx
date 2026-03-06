"use client";

import styles from './category.module.css';
import { Card } from '@/components/ui/Card';
import { Star, MessageSquare, User, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/lib/i18n-config';
import { use } from 'react';

export default function CategoryPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = use(params);
  const [dict, setDict] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const d = await getDictionary(locale);
      setDict(d);

      try {
        const res = await fetch(`/api/posts?locale=${locale}&category=${slug}`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
          if (data.length > 0) {
            setCategory(data[0].category);
          }
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [locale, slug]);

  const categoryName =
    category?.name ||
    slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const categoryDesc = category?.description || '';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - date.getTime()) / 3600000);
    if (diffH < 24) return locale === 'tr' ? `${diffH} saat önce` : `${diffH} hours ago`;
    if (diffH < 48) return locale === 'tr' ? 'Dün' : 'Yesterday';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
      <header className={styles.header}>
        <div className={styles.breadcrumb}>
          <a href={`/${locale}/forum`} className={styles.backLink}>
            <ArrowLeft size={12} />
            {locale === 'tr' ? 'Forum' : 'Forum'}
          </a>
          {' · '}
          {categoryName}
        </div>
        <h1 className={styles.title}>{categoryName}</h1>
        {categoryDesc && <p className={styles.subtitle}>{categoryDesc}</p>}
      </header>

      <div className={styles.layout}>
        <div className={styles.content}>
          {loading ? (
            <p style={{ color: 'var(--text-secondary)' }}>
              {locale === 'tr' ? 'Yükleniyor...' : 'Loading...'}
            </p>
          ) : posts.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>
              {locale === 'tr' ? 'Bu kategoride henüz gönderi yok.' : 'No posts in this category yet.'}
            </p>
          ) : (
            posts.map((post: any) => (
              <Card key={post.id} interactive className={styles.postCard}>
                <a href={`/${locale}/yazi/${post.slug}`} className={styles.postLink}>
                  <div className={styles.postInfo}>
                    <h3 className={styles.postTitle}>{post.title}</h3>
                    {post.excerpt && (
                      <p className={styles.postExcerpt}>{post.excerpt}</p>
                    )}
                    <div className={styles.meta}>
                      <span className={styles.author}>
                        <User size={14} />
                        {post.isAnonymous
                          ? (locale === 'tr' ? 'Anonim' : 'Anonymous')
                          : (post.author?.username || '?')}
                      </span>
                      <span className={styles.dot}>•</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  <div className={styles.stats}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)', fontWeight: 600, fontSize: '14px' }}>
                      <Star size={14} fill="var(--accent)" stroke="var(--accent)" />
                      <span>{post.avgRating != null ? `${post.avgRating}` : '—'}</span>
                      {post.ratingCount > 0 && (
                        <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '12px' }}>({post.ratingCount})</span>
                      )}
                    </div>
                    <div className={styles.comments}>
                      <MessageSquare size={16} />
                      <span>{post.realCommentCount}</span>
                    </div>
                  </div>
                </a>
              </Card>
            ))
          )}
        </div>

        <aside className={styles.sidebar}>
          <Card title={locale === 'tr' ? 'Kategori Hakkında' : 'About this Category'} className={styles.sideCard}>
            <p>{categoryDesc || (locale === 'tr' ? 'Bu kategoride paylaşımlarını yap.' : 'Share your thoughts in this category.')}</p>
          </Card>

          <Card title={locale === 'tr' ? 'İstatistikler' : 'Statistics'} className={styles.sideCard}>
            <p>
              <strong>{posts.length}</strong>{' '}
              {locale === 'tr' ? 'gönderi' : 'posts'}
            </p>
          </Card>

          <div className={styles.adPlaceholder}>{locale === 'tr' ? 'REKLAM ALANI' : 'AD SPACE'}</div>
        </aside>
      </div>
    </div>
  );
}
