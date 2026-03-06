import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ExternalLink, MessageCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CommentSection } from '@/components/ui/CommentSection';
import styles from './page.module.css';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Locale } from '@/lib/i18n-config';
import { getDictionary } from '@/lib/get-dictionary';

export default async function AdDetailPage({ params }: { params: Promise<{ id: string, locale: Locale }> }) {
  const { id, locale } = await params;
  const dict = await getDictionary(locale);
  
  const campaign = await prisma.adCampaign.findUnique({
    where: { id },
    include: {
      slot: true
    }
  });

  if (!campaign) {
    return notFound();
  }

  // Fetch the average rating from the DB
  const ratingAgg = await prisma.postRating.aggregate({
    where: { campaignId: id },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const avgRating = ratingAgg._avg.rating
    ? ratingAgg._avg.rating.toFixed(1)
    : null;
  const ratingCount = ratingAgg._count.rating;
  return (
    <div className={styles.detailWrapper}>
      <div className="container">
        <Link href={`/${locale}/survival-kit`} className={styles.backLink}>
          <ChevronLeft size={18} /> {dict.ads.backToHub}
        </Link>
      </div>

      <div className="container">
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>{campaign.slot.name.replace('Survival Kit - ', '')}</div>
            <h1 className={styles.title}>{campaign.title}</h1>
          </div>
          <div className={styles.bannerImageWrapper}>
            {campaign.imageUrl && (
              <Image
                src={campaign.imageUrl}
                alt={campaign.title}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            )}
            <div className={styles.imageOverlay} />
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.mainContent}>
            <div className={styles.description}>
              <p>{campaign.body}</p>
            </div>
            
            <CommentSection targetId={campaign.id} targetType="campaign" dict={dict.comments} />
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h3>Fırsatı Değerlendir</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: 'var(--space-lg)' }}>
                Bu ürün affiliate ortaklığımız kapsamında listelenmiştir. Satın alımınız topluluğumuzu destekler.
              </p>
              <div className={styles.ctaBox}>
                <Button 
                   href={campaign.targetUrl}
                   size="lg" 
                   icon={ExternalLink} 
                   style={{ width: '100%' }}
                >
                  {dict.ads.buyNow}
                </Button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--accent)', fontWeight: '600' }}>
                   <Star size={16} fill="var(--accent)" />
                   {avgRating ? (
                     <span>{avgRating} / 5 <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '12px' }}>({ratingCount} oy)</span></span>
                   ) : (
                     <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Henüz oy yok</span>
                   )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
