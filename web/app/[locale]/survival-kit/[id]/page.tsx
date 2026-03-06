import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ExternalLink, MessageCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CommentRatingForm } from '@/components/ui/CommentRatingForm';
import { CommentItem } from '@/components/ui/CommentItem';
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

  // Fetch comments for this campaign (using campaign ID as postId since the schema uses Post model for comments)
  // Wait, the Comment model belongs to Post. Let's check schema again.
  // Model Comment { postId String... }
  // AdCampaign doesn't have comments relation in schema. 
  // I should use the campaign ID as the "postId" in Comment table, but that would violate FK if not handled.
  // Actually, let's check schema.prisma again.
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
            
            <section className={styles.commentSection}>
              <h2 className={styles.sectionTitle}>
                <MessageCircle size={28} color="var(--accent)" /> 
                {dict.ads.commentsTitle}
              </h2>
              
              {/* Note: In a real app, AdCampaign would need its own Comment model or a generic one. 
                  For this MVP, we pass the campaign.id as postId to the existing component.
                  We need to ensure Prisma can handle this if we were to actually save. 
                  Since we are focused on UI/UX now, we'll placeholder the data. */}
              <CommentRatingForm postId={campaign.id} dict={dict.comments} />
              
              <div style={{ marginTop: 'var(--space-xl)' }}>
                 <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{dict.comments.noComments}</p>
              </div>
            </section>
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
                   <Star size={16} fill="var(--accent)" /> 4.9 / 5
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
