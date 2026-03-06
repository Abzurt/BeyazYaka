'use client';

import { useState, useEffect } from 'react';
import styles from './quizzes.module.css';
import { BrainCircuit, Plus, Edit2, BarChart2, Eye, Trash2, HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function QuizManagement() {
  const { showToast } = useToast();
  const { locale } = useParams();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quizzes?admin=true&locale=${locale}`);
      const data = await res.json();
      setQuizzes(data);
    } catch (error) {
      showToast('Testler yüklenirken bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean, title: string) => {
    // API logic to toggle would go here, for now local update
    setQuizzes(prev => prev.map(q => {
      if (q.id === id) {
        return { ...q, isActive: !currentStatus };
      }
      return q;
    }));
    showToast(`"${title}" ${!currentStatus ? 'yayına alındı' : 'taslağa çekildi'}.`, 'success');
  };

  const deleteQuiz = async (id: string, title: string) => {
    if (!confirm(`"${title}" testini silmek istediğinize emin misiniz?`)) return;
    
    try {
      const res = await fetch(`/api/quizzes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuizzes(prev => prev.filter(q => q.id !== id));
        showToast('Test başarıyla silindi.', 'success');
      } else {
        showToast('Silme işlemi başarısız oldu.', 'error');
      }
    } catch (error) {
      showToast('Bir hata oluştu.', 'error');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Test & Quiz Yönetimi</h1>
          <p className={styles.subtitle}>Sitenin viral gücü olan testleri buradan hazırlayabilir ve istatistikleri görebilirsiniz.</p>
        </div>
        <Link href={`/${locale}/admin/quizzes/new`}>
          <Button icon={Plus}>Yeni Test Oluştur</Button>
        </Link>
      </header>

      {loading ? (
        <div className={styles.loading}>Veriler yükleniyor...</div>
      ) : (
        <div className={styles.quizGrid}>
          {quizzes.map((quiz) => (
            <div key={quiz.id} className={`${styles.quizCard} ${!quiz.isActive ? styles.draft : ''}`}>
              <div className={styles.cardTop}>
                <div className={styles.iconWrapper}><BrainCircuit size={24} /></div>
                <span 
                  className={`${styles.statusBadge} ${quiz.isActive ? styles.published : styles.draft}`} 
                  onClick={() => toggleStatus(quiz.id, quiz.isActive, quiz.title)}
                >
                  {quiz.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                  {quiz.isActive ? 'Yayında' : 'Taslak'}
                </span>
              </div>
              
              <div className={styles.cardContent}>
                <h3>{quiz.title}</h3>
                <div className={styles.details}>
                  <div className={styles.detailItem}>
                    <HelpCircle size={14} /> {quiz._count.questions} Soru
                  </div>
                  <div className={styles.detailItem}>
                    <BarChart2 size={14} /> {quiz._count.results} Katılım
                  </div>
                </div>
              </div>

              <div className={styles.cardActions}>
                <Link href={`/${locale}/admin/quizzes/${quiz.id}/edit`}>
                  <Button variant="outline" size="sm" icon={Edit2}>Düzenle</Button>
                </Link>
                <div className={styles.iconButtons}>
                  <Link href={`/${locale}/testler/${quiz.slug}`} target="_blank">
                    <button title="Önizle"><Eye size={18} /></button>
                  </Link>
                  <button title="İstatistikler" onClick={() => showToast('Detaylı analitikler hazırlanıyor...', 'info')}><BarChart2 size={18} /></button>
                  <button title="Sil" className={styles.deleteBtn} onClick={() => deleteQuiz(quiz.id, quiz.title)}><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}

          <Link href={`/${locale}/admin/quizzes/new`} className={styles.addCard}>
             <Plus size={40} />
             <span>Yeni Viral Test Tasarla</span>
          </Link>
        </div>
      )}
    </div>
  );
}
