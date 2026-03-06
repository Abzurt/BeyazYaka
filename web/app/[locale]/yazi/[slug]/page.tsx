import styles from './post.module.css';
import { Card } from '@/components/ui/Card';
import { StarRating } from '@/components/ui/StarRating';
import { CommentRatingForm } from '@/components/ui/CommentRatingForm';
import { CommentItem } from '@/components/ui/CommentItem';
import { Button } from '@/components/ui/Button';
import { MessageCircle, Share2 } from 'lucide-react';

import { i18n, type Locale } from '@/lib/i18n-config';
import { getDictionary } from '@/lib/get-dictionary';

export default async function PostPage({ params }: { params: Promise<{ slug: string, locale: Locale }> }) {
  const { slug, locale } = await params;
  const dict = await getDictionary(locale);
  return (
    <div className="container" style={{ paddingTop: 'var(--space-xxl)' }}>
      <div className={styles.postHeader}>
        <div className={styles.badge}>Gerçekler & Yalanlar</div>
        <h1 className={styles.title}>Kurumsal Mail Dili Çeviri Sözlüğü</h1>
        <div className={styles.authorBar}>
          <div className={styles.authorInfo}>
            <div className={styles.avatar}>YA</div>
            <div>
              <div className={styles.authorName}>yazar_aytek</div>
              <div className={styles.meta}>Teknoloji • 2 saat önce</div>
            </div>
          </div>
          <div className={styles.actions}>
            <Button variant="outline" size="sm" icon={Share2}>Paylaş</Button>
          </div>
        </div>
      </div>

      <div className={styles.mainLayout}>
        <article className={styles.content}>
          <p>Plaza hayatının en büyük yalanı şüphesiz kurumsal mail dilidir. Her gün onlarca mail alıyoruz ve hiçbirimizin aslında ne demek istediğimizi söylemeye cesareti yok. İşte o gizli kodlar ve gerçek anlamları:</p>
          
          <h3>1. "As discussed..."</h3>
          <p><strong>Gerçek anlamı:</strong> "Sana bunu defalarca anlattım, toplantıda konuştuk, neden hala anlamıyorsun ve beni uğraştırıyorsun? Kanıtı da bu mailde dursun."</p>
          
          <h3>2. "Per my previous email..."</h3>
          <p><strong>Gerçek anlamı:</strong> "Okuma yazman mı yok? Önceki mailde yazdım zaten, aç bir bak lütfen."</p>

          <h3>3. "Moving this to BCC..."</h3>
          <p><strong>Gerçek anlamı:</strong> "Bu konudan o kadar sıkıldım ki seni sessizce konudan çıkarıyorum ama patronun haberi olsun."</p>
        </article>

        <section className={styles.commentSection}>
          <h2 className={styles.sectionTitle}><MessageCircle /> {dict.common.forum} (12)</h2>
          
          <CommentRatingForm postId="1" dict={dict.comments} />

          <div className={styles.commentList}>
            <CommentItem 
              id="c1"
              author="plaza_krali"
              time={`1 ${dict.home.timeAgo.hours}`}
              content="Çok doğru tespitler. Özellikle 'As discussed' kısmı tam bir savunma sanatı."
              initialLikes={4}
              dict={dict.comments}
              replies={[
                {
                  id: 'r1',
                  author: 'yazar_aytek',
                  time: `30 dk ${dict.home.timeAgo.hours.split(' ')[1]}`, // heuristic
                  content: 'Kesinlikle, hayatta kalmanın ilk kuralı mail trafiğini yönetmek!'
                }
              ]}
            />
            <CommentItem 
              id="c2"
              author="excel_canavari"
              time={`45 dk ${dict.home.timeAgo.hours.split(' ')[1]}`}
              content="BCC'ye taşınmak aslında 'seninle işim bitti' demenin en medeni yolu."
              initialLikes={2}
              dict={dict.comments}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
