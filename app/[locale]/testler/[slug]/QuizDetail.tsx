'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  BrainCircuit, 
  Timer, 
  Users, 
  MessageCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CommentSection } from '@/components/ui/CommentSection';
import styles from './quizDetail.module.css';
import Image from 'next/image';

export default function QuizDetail({ dict }: { dict: any }) {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const locale = params.locale as string;
  const qDict = dict.quizzes.detail;

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1); // -1 is intro
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const decodedSlug = decodeURIComponent(slug);
        const listRes = await fetch('/api/quizzes');
        const list = await listRes.json();
        
        // Find by slug, case insensitive and slug-safe
        const found = list.find((q: any) => 
          q.slug.toLowerCase() === decodedSlug.toLowerCase() || 
          encodeURIComponent(q.slug) === slug
        );
        
        if (!found) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/quizzes/${found.id}`);
        const data = await res.json();
        setQuiz(data);
      } catch (error) {
        console.error("Error fetching quiz:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [slug]);

  const handleStart = () => {
    setCurrentQuestionIndex(0);
  };

  const handleAnswerSelect = (questionId: string, choiceId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: choiceId }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const choiceIds = Object.values(answers);
      const res = await fetch(`/api/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choices: choiceIds })
      });
      const data = await res.json();
      
      sessionStorage.setItem(`quiz_result_${quiz.id}`, JSON.stringify(data));
      router.push(`/${locale}/testler/${slug}/sonuc`);
    } catch (error) {
      console.error("Error submitting quiz:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className={styles.loading}>{qDict.loading}</div>;
  if (!quiz) return <div className={styles.error}>{qDict.notFound}</div>;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = currentQuestionIndex >= 0 
    ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 
    : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Button 
          variant="ghost" 
          size="sm" 
          icon={ChevronLeft} 
          onClick={() => router.back()}
          className={styles.backBtn}
        >
          {qDict.back}
        </Button>
        <div className={styles.quizInfo}>
           <h1 className={styles.quizTitle}>{quiz.title}</h1>
           <div className={styles.meta}>
              <span className={styles.metaItem}>
                <Timer size={14} /> 
                {qDict.duration.replace('{time}', (quiz.questions.length * 0.5).toString())}
              </span>
              <span className={styles.metaItem}>
                <Users size={14} /> 
                {qDict.participation.replace('{count}', quiz._count.results.toLocaleString())}
              </span>
           </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {currentQuestionIndex === -1 ? (
          <Card className={styles.introCard}>
            <div className={styles.introImage}>
              {quiz.coverImageUrl && (
                <Image src={quiz.coverImageUrl} alt={quiz.title} fill style={{ objectFit: 'cover' }} />
              )}
              <div className={styles.imageOverlay} />
            </div>
            <div className={styles.introContent}>
              <h2>{qDict.ready}</h2>
              <p>{qDict.intro.replace('{count}', quiz.questions.length.toString())}</p>
              <Button size="lg" icon={ChevronRight} onClick={handleStart} className={styles.startBtn}>
                {qDict.startBtn}
              </Button>
            </div>
          </Card>
        ) : (
          <div className={styles.quizWrapper}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              <span className={styles.progressText}>
                {qDict.progress
                  .replace('{current}', (currentQuestionIndex + 1).toString())
                  .replace('{total}', quiz.questions.length.toString())}
              </span>
            </div>

            <Card className={styles.questionCard}>
              <h2 className={styles.questionText}>{currentQuestion.questionText}</h2>
              <div className={styles.choicesGrid}>
                {currentQuestion.choices.map((choice: any) => (
                  <button
                    key={choice.id}
                    className={`${styles.choiceBtn} ${answers[currentQuestion.id] === choice.id ? styles.selected : ''}`}
                    onClick={() => handleAnswerSelect(currentQuestion.id, choice.id)}
                  >
                    <span className={styles.choiceCircle}>
                      {answers[currentQuestion.id] === choice.id && <CheckCircle2 size={20} />}
                    </span>
                    <span className={styles.choiceText}>{choice.choiceText}</span>
                  </button>
                ))}
              </div>
            </Card>

            <div className={styles.actions}>
              <Button 
                variant="outline" 
                onClick={handleBack} 
                disabled={currentQuestionIndex === 0}
              >
                {qDict.prev}
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!answers[currentQuestion.id] || submitting}
                loading={submitting}
              >
                {currentQuestionIndex === quiz.questions.length - 1 ? qDict.finish : qDict.next}
              </Button>
            </div>
          </div>
        )}

        <CommentSection targetId={quiz.id} targetType="quiz" dict={dict.comments} />
      </div>
    </div>
  );
}
