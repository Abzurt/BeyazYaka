'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ChevronLeft, 
  Save, 
  Plus, 
  Trash2, 
  HelpCircle,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import styles from './quizForm.module.css';

interface Choice {
  choiceText: string;
  score: number;
  resultKey: string;
  sortOrder: number;
}

interface Question {
  questionText: string;
  sortOrder: number;
  choices: Choice[];
}

interface QuizFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    coverImageUrl: string | null;
    isActive: boolean;
    questions: Question[];
  };
  isEdit?: boolean;
}

export default function QuizForm({ initialData, isEdit = false }: QuizFormProps) {
  const router = useRouter();
  const { locale } = useParams();
  const { showToast } = useToast();

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl || '');
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions || [
      { 
        questionText: '', 
        sortOrder: 0, 
        choices: [
          { choiceText: '', score: 0, resultKey: 'standard', sortOrder: 0 },
          { choiceText: '', score: 0, resultKey: 'standard', sortOrder: 1 }
        ] 
      }
    ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { 
        questionText: '', 
        sortOrder: questions.length, 
        choices: [
          { choiceText: '', score: 0, resultKey: 'standard', sortOrder: 0 },
          { choiceText: '', score: 0, resultKey: 'standard', sortOrder: 1 }
        ] 
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      showToast('En az bir soru olmalıdır.', 'warning');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestionText = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].questionText = text;
    setQuestions(newQuestions);
  };

  const addChoice = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].choices.push({
      choiceText: '',
      score: 0,
      resultKey: 'standard',
      sortOrder: newQuestions[qIndex].choices.length
    });
    setQuestions(newQuestions);
  };

  const updateChoice = (qIndex: number, cIndex: number, fields: Partial<Choice>) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].choices[cIndex] = {
      ...newQuestions[qIndex].choices[cIndex],
      ...fields
    };
    setQuestions(newQuestions);
  };

  const removeChoice = (qIndex: number, cIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[qIndex].choices.length <= 2) {
      showToast('En az iki seçenek olmalıdır.', 'warning');
      return;
    }
    newQuestions[qIndex].choices = newQuestions[qIndex].choices.filter((_, i) => i !== cIndex);
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || questions.some(q => !q.questionText)) {
      showToast('Lütfen tüm zorunlu alanları dolduron.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = isEdit ? `/api/quizzes/${initialData?.id}` : '/api/quizzes';
      const method = isEdit ? 'PATCH' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, coverImageUrl, questions, isActive, locale })
      });

      if (res.ok) {
        showToast(isEdit ? 'Test başarıyla güncellendi!' : 'Test başarıyla oluşturuldu!', 'success');
        router.push(`/${locale}/admin/quizzes`);
        router.refresh();
      } else {
        const err = await res.json();
        showToast(err.error || 'Bir hata oluştu.', 'error');
      }
    } catch (error) {
      showToast('Bir hata oluştu.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Button variant="ghost" size="sm" icon={ChevronLeft} onClick={() => router.back()}>Geri</Button>
        <h1 className={styles.title}>{isEdit ? 'Testi Düzenle' : 'Yeni Viral Test Oluştur'}</h1>
      </header>

      <form onSubmit={handleSubmit} className={styles.form}>
        <Card className={styles.configCard}>
          <div className={styles.inputGroup}>
            <label>Test Başlığı</label>
            <input 
              type="text" 
              placeholder="Örn: Hangi Plaza İnsanısınız?" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Slug (URL yolu)</label>
            <input 
              type="text" 
              placeholder="Örn: hangi-plaza-insanisiniz" 
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Kapak Görseli URL</label>
            <input 
              type="text" 
              placeholder="https://..." 
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
            />
          </div>
          <div className={styles.checkboxGroup}>
            <label>
              <input 
                type="checkbox" 
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              <span>Aktif / Yayında</span>
            </label>
          </div>
        </Card>

        <section className={styles.questionsSection}>
          <div className={styles.sectionHeader}>
            <h2>Sorular & Seçenekler</h2>
            <Button type="button" size="sm" variant="outline" icon={Plus} onClick={addQuestion}>Soru Ekle</Button>
          </div>

          {questions.map((q, qIndex) => (
            <Card key={qIndex} className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <div className={styles.qNum}><Hash size={16} /> Question {qIndex + 1}</div>
                <button type="button" onClick={() => removeQuestion(qIndex)} className={styles.removeBtn}><Trash2 size={18} /></button>
              </div>

              <div className={styles.inputGroup}>
                <textarea 
                  placeholder="Soru metni..." 
                  value={q.questionText}
                  onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                  rows={2}
                />
              </div>

              <div className={styles.choicesList}>
                <label>Seçenekler & Puanlama</label>
                {q.choices.map((c, cIndex) => (
                  <div key={cIndex} className={styles.choiceRow}>
                    <input 
                      className={styles.choiceInput}
                      placeholder="Seçenek metni..."
                      value={c.choiceText}
                      onChange={(e) => updateChoice(qIndex, cIndex, { choiceText: e.target.value })}
                    />
                    <input 
                      type="number" 
                      className={styles.scoreInput}
                      placeholder="Puan"
                      value={c.score}
                      onChange={(e) => updateChoice(qIndex, cIndex, { score: parseInt(e.target.value) || 0 })}
                    />
                    <select 
                      className={styles.keySelect}
                      value={c.resultKey}
                      onChange={(e) => updateChoice(qIndex, cIndex, { resultKey: e.target.value })}
                    >
                      <option value="strategist">Strateji</option>
                      <option value="warrior">Kriz</option>
                      <option value="social">Sosyal</option>
                      <option value="standard">Genel</option>
                    </select>
                    <button type="button" onClick={() => removeChoice(qIndex, cIndex)} className={styles.removeChoiceBtn}><Trash2 size={14} /></button>
                  </div>
                ))}
                <button type="button" className={styles.addChoiceBtn} onClick={() => addChoice(qIndex)}>+ Seçenek Ekle</button>
              </div>
            </Card>
          ))}
        </section>

        <div className={styles.formActions}>
          <Button variant="ghost" type="button" onClick={() => router.back()}>İptal</Button>
          <Button type="submit" icon={Save} loading={isSubmitting}>
            {isEdit ? 'Değişiklikleri Kaydet' : 'Testi Kaydet ve Yayınla'}
          </Button>
        </div>
      </form>
    </div>
  );
}
