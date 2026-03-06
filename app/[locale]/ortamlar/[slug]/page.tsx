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

export default async function OrtamDetailPage({ params }: { params: Promise<{ slug: string, locale: Locale }> }) {
  const { slug, locale } = await params;
  const dict = await getDictionary(locale);
  
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      tags: {
        include: {
          tag: true
        }
      },
      category: true
    }
  });

  if (!post) {
    return notFound();
  }

  const item = {
    title: post.title,
    category: post.category.name,
    description: post.excerpt || '',
    fullContent: post.content,
    image: post.coverImageUrl || '/images/hero/brands.png',
    rating: 4.5,
    reviewCount: post.commentCount || 0,
    tags: post.tags.map((pt: any) => pt.tag.name)
  };

  return (
    <div className={styles.detailWrapper}>
      <div className="container">
        <Link href={`/${locale}/ortamlar`} className={styles.backLink}>
          <ChevronLeft size={18} /> {dict.comments.back || 'Geri Dön'}
        </Link>
      </div>

      <div className={styles.heroSection}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.badge}>{item.category}</div>
            <h1 className={styles.title}>{item.title}</h1>
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <Star size={16} fill="var(--accent)" color="var(--accent)" />
                <span>{item.rating}</span>
              </div>
              <div className={styles.statItem}>
                <MessageSquare size={16} />
                <span>{item.reviewCount} {dict.home.starVotes}</span>
              </div>
            </div>
            <CommentSection targetId={post.id} targetType="post" dict={dict.comments} />
          </div>
        </div>
        <div className={styles.bannerImageWrapper}>
          <Image
            src={item.image}
            alt={item.title}
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
              <p>{item.description}</p>
            </div>
            <div className={styles.longContent}>
              {item.fullContent.split('\n').map((line: string, i: number) => {
                if (line.trim().startsWith('###')) {
                  return <h3 key={i}>{line.replace('###', '').trim()}</h3>;
                }
                if (line.trim().startsWith('-')) {
                  return <li key={i}>{line.replace('-', '').trim()}</li>;
                }
                return <p key={i}>{line}</p>;
              })}
            </div>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h3>Hızlı Bilgi</h3>
              <ul className={styles.infoList}>
                <li>
                  <Info size={16} />
                  <span>Örnek bilgi alanıdır.</span>
                </li>
              </ul>
              <div className={styles.sidebarTags}>
                {item.tags.map((tag: string) => (
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
