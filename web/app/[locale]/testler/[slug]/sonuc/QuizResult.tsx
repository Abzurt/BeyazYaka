'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Trophy, 
  Share2, 
  RefreshCw, 
  Users, 
  ArrowLeft,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import styles from './results.module.css';

export default function QuizResult({ dict }: { dict: any }) {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const locale = params.locale as string;
  const rDict = dict.quizzes.result;

  const [resultData, setResultData] = useState<any>(null);
  const [quizInfo, setQuizInfo] = useState<any>(null);

  useEffect(() => {
    async function init() {
      try {
        const decodedSlug = decodeURIComponent(slug);
        const listRes = await fetch('/api/quizzes');
        const list = await listRes.json();
        const found = list.find((q: any) => 
          q.slug.toLowerCase() === decodedSlug.toLowerCase() || 
          encodeURIComponent(q.slug) === slug
        );
        
        if (found) {
          setQuizInfo(found);
          const stored = sessionStorage.getItem(`quiz_result_${found.id}`);
          if (stored) {
            setResultData(JSON.parse(stored));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    init();
  }, [slug]);

  if (!resultData || !quizInfo) {
    return <div className={styles.loading}>{rDict.loading}</div>;
  }

  const resultType = dict.quizzes.types[resultData.result.resultKey] || dict.quizzes.types.standard;

  const handleShare = () => {
    const shareText = rDict.shareText
      .replace('{title}', quizInfo.title)
      .replace('{result}', resultType.title);

    if (navigator.share) {
      navigator.share({
        title: quizInfo.title,
        text: shareText,
        url: window.location.href.split('/sonuc')[0]
      }).catch(() => {});
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.resultCard}>
        <div className={styles.confetti}>
          <Sparkles className={styles.sparkleIcon} />
        </div>

        <div className={styles.header}>
          <Trophy size={48} className={styles.trophyIcon} />
          <h1 className={styles.title}>{rDict.done}</h1>
          <p className={styles.subtitle}>{quizInfo.title}</p>
        </div>

        <div className={styles.scoreSection}>
          <div className={styles.scoreCircle}>
            <span className={styles.scoreValue}>{resultData.result.score}</span>
            <span className={styles.scoreLabel}>{rDict.scoreLabel}</span>
          </div>
          <div className={styles.personalityTitle}>
            <h2>{resultType.title}</h2>
            <p>{resultType.desc}</p>
          </div>
        </div>

        <div className={styles.aggregateStats}>
          <div className={styles.statItem}>
            <div className={styles.statHeader}>
              <Users size={18} />
              <span>{rDict.communityHeader}</span>
            </div>
            <div className={styles.barContainer}>
              <div className={styles.barFill} style={{ width: `${resultData.stats.percentage}%` }} />
            </div>
            <p className={styles.statText}>
              {rDict.communityText.split(/\{(boldStart|boldEnd)\}/).map((part: string, i: number) => {
                if (part === 'boldStart') return null;
                if (part === 'boldEnd') return null;
                if (rDict.communityText.split(/\{(boldStart|boldEnd)\}/)[i-1] === 'boldStart') {
                  const val = part.replace('{percentage}', resultData.stats.percentage.toString());
                  return <strong key={i}>{val}</strong>;
                }
                return part.replace('{percentage}', resultData.stats.percentage.toString());
              })}
            </p>
          </div>

          <div className={styles.totalStats}>
            <BarChart3 size={16} />
            <span>{rDict.totalText.replace('{count}', resultData.stats.totalParticipants.toString())}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button icon={Share2} onClick={handleShare}>{rDict.share}</Button>
          <Button variant="outline" icon={RefreshCw} onClick={() => router.push(`/${locale}/testler/${slug}`)}>{rDict.retry}</Button>
        </div>
      </Card>

      <div className={styles.footerActions}>
        <Button variant="ghost" icon={ArrowLeft} onClick={() => router.push(`/${locale}/testler`)}>
          {rDict.backToHub}
        </Button>
      </div>
    </div>
  );
}
