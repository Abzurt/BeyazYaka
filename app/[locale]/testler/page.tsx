import styles from './testler.module.css';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BrainCircuit, Timer, Users, ArrowRight, Sparkles } from 'lucide-react';
import prisma from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';
import { getDictionary } from '@/lib/get-dictionary';
import { Locale } from '@/lib/i18n-config';

interface QuizWithCount {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  _count: {
    results: number;
    questions: number;
  };
}

export default async function TestlerPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const qDict = dict.quizzes.hub;

  const quizzes = await prisma.quiz.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { results: true, questions: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  }) as QuizWithCount[];

  return (
    <div className="container" style={{ paddingTop: 'var(--space-xxl)', paddingBottom: 'var(--space-xxl)' }}>
      <header className={styles.header}>
        <div className={styles.badge}>
          <Sparkles size={14} className={styles.sparkle} />
          <span>{qDict.badge}</span>
        </div>
        <h1 className={styles.title}>{qDict.title}</h1>
        <p className={styles.subtitle}>
          {qDict.subtitle.split(/\{(boldStart|boldEnd)\}/).map((part: string, i: number) => {
            if (part === 'boldStart') return null;
            if (part === 'boldEnd') return null;
            if (qDict.subtitle.split(/\{(boldStart|boldEnd)\}/)[i-1] === 'boldStart') {
              return <strong key={i}>{part}</strong>;
            }
            return part;
          })}
        </p>
      </header>

      <div className={styles.quizGrid}>
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <Card key={quiz.id} interactive className={styles.quizCard}>
              <Link href={`/${locale}/testler/${quiz.slug}`} className={styles.cardLink}>
                <div className={styles.imageWrapper}>
                  {quiz.coverImageUrl ? (
                    <Image 
                      src={quiz.coverImageUrl} 
                      alt={quiz.title} 
                      fill 
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <div className={styles.placeholderImage}>
                       <BrainCircuit size={48} color="var(--accent)" opacity={0.2} />
                    </div>
                  )}
                  <div className={styles.imageOverlay} />
                  <div className={styles.cardBadge}>
                    <BrainCircuit size={12} />
                    <span>{qDict.test}</span>
                  </div>
                </div>
                
                <div className={styles.quizContent}>
                  <h3 className={styles.quizTitle}>{quiz.title}</h3>
                  
                  <div className={styles.quizMeta}>
                    <div className={styles.metaItem}>
                      <Timer size={14} />
                      <span>{qDict.duration.replace('{time}', (quiz._count.questions * 0.5).toString())}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Users size={14} />
                      <span>{qDict.participation.replace('{count}', quiz._count.results.toLocaleString())}</span>
                    </div>
                  </div>

                  <Button fullWidth variant="primary" icon={ArrowRight} className={styles.quizBtn}>
                    {qDict.startBtn}
                  </Button>
                </div>
              </Link>
            </Card>
          ))
        ) : (
          <div className={styles.emptyState}>
            <BrainCircuit size={48} />
            <h3>{qDict.empty}</h3>
            <p>{qDict.emptySub}</p>
          </div>
        )}
      </div>
    </div>
  );
}
