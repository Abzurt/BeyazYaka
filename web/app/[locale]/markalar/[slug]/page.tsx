import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Info, Star, MessageSquare, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CommentSection } from '@/components/ui/CommentSection';
import styles from './page.module.css';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

import { i18n, type Locale } from '@/lib/i18n-config';
import { getDictionary } from '@/lib/get-dictionary';
import { auth } from '@/lib/auth';
import { StatusWarning } from '@/components/ui/StatusWarning';

export default async function BrandDetailPage({ params }: { params: Promise<{ slug: string, locale: Locale }> }) {
  const { slug, locale } = await params;
  const dict = await getDictionary(locale);
  const session = await auth();
  const isAdmin = session?.user?.role === 'admin';
  
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: {
        include: {
          tag: true
        }
      }
    }
  });

  if (!post) {
    return notFound();
  }

  // Security: Only admins can see non-published posts
  if (post.status !== 'published' && !isAdmin) {
    return notFound();
  }

  // Fetch real stats from DB
  const [ratingAgg, commentCount] = await Promise.all([
    prisma.postRating.aggregate({
      where: { postId: post.id },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.comment.count({
      where: { postId: post.id, isDeleted: false },
    }),
  ]);

  const avgRating = ratingAgg._avg.rating
    ? ratingAgg._avg.rating.toFixed(1)
    : '0.0';
  const voteCount = ratingAgg._count.rating;

  const brand = {
    title: post.title,
    category: post.category?.name || 'Markalar',
    description: post.excerpt || '',
    fullContent: post.content,
    image: post.coverImageUrl || '/images/hero/brands.png',
    rating: avgRating,
    voteCount,
    commentCount,
    tags: post.tags.map((pt: any) => pt.tag.name)
  };

  return (
    <div className={styles.detailWrapper}>
      <div className="container" style={{ paddingTop: 'var(--space-md)' }}>
        <StatusWarning status={post.status} locale={locale} />
      </div>
      <div className="container">
        <Link href={`/${locale}/markalar`} className={styles.backLink}>
          <ChevronLeft size={18} /> {dict.comments.back || 'Geri Dön'}
        </Link>
      </div>

      <div className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.badge}>{brand.category}</div>
            <h1 className={styles.title}>{brand.title}</h1>
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <Star size={16} fill="var(--accent)" color="var(--accent)" />
                <span>{brand.rating} <span style={{ fontSize: '12px', opacity: 0.7 }}>({brand.voteCount} oy)</span></span>
              </div>
              <div className={styles.statItem}>
                <MessageSquare size={16} />
                <span>{brand.commentCount} {dict.home.starVotes}</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.bannerImageWrapper}>
          <Image
            src={brand.image}
            alt={brand.title}
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
          <div className={styles.imageOverlay} />
        </div>
      </div>

      <div className="container">
        <div className={styles.contentGrid}>
          <div className={styles.mainContent}>
            <div className={styles.description}>
              <p>{brand.description}</p>
            </div>
            <div className={styles.longContent}>
              {brand.fullContent.split('\n').map((line: string, i: number) => {
                if (line.trim().startsWith('###')) {
                  return <h3 key={i}>{line.replace('###', '').trim()}</h3>;
                }
                if (line.trim().startsWith('-')) {
                  return <li key={i}>{line.replace('-', '').trim()}</li>;
                }
                return <p key={i}>{line}</p>;
              })}
            </div>
            
            <CommentSection targetId={post.id} targetType="post" dict={dict.comments} />
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h3>Hızlı Bilgi</h3>
              <ul className={styles.infoList}>
                <li>
                  <Info size={16} />
                  <span>Ülkemizde 500+ şubesi bulunuyor.</span>
                </li>
                <li>
                  <Star size={16} />
                  <span>En çok Sipariş: Flat White</span>
                </li>
              </ul>
              <div className={styles.sidebarTags}>
                {brand.tags.map((tag: string) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
