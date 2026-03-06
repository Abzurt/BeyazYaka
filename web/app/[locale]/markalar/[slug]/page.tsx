import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Info, Star, MessageSquare, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CommentRatingForm } from '@/components/ui/CommentRatingForm';
import { CommentItem } from '@/components/ui/CommentItem';
import styles from './page.module.css';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

import { i18n, type Locale } from '@/lib/i18n-config';
import { getDictionary } from '@/lib/get-dictionary';

export default async function BrandDetailPage({ params }: { params: Promise<{ slug: string, locale: Locale }> }) {
  const { slug, locale } = await params;
  const dict = await getDictionary(locale);
  
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
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

  const brand = {
    title: post.title,
    category: 'İçecek & Lifestyle', // This could be dynamic from category
    description: post.excerpt || '',
    fullContent: post.content,
    image: post.coverImageUrl || '/images/hero/brands.png',
    rating: 4.8, // Mocked for now, can be avg of ratings
    reviewCount: post.commentCount || 0,
    tags: post.tags.map((pt: any) => pt.tag.name)
  };

  return (
    <div className={styles.detailWrapper}>
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
                <span>{brand.rating}</span>
              </div>
              <div className={styles.statItem}>
                <MessageSquare size={16} />
                <span>{brand.reviewCount} {dict.home.starVotes}</span>
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
            
            <section className={styles.commentSection}>
              <h2 className={styles.sectionTitle}><MessageCircle /> {dict.common.forum} ({brand.reviewCount})</h2>
              <CommentRatingForm postId={post.id} dict={dict.comments} />
              
              <div className={styles.commentList}>
                <p className={styles.noComments}>{dict.comments.noComments || 'Henüz yorum yapılmamış. İlk yorumu sen yap!'}</p>
              </div>
            </section>
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
