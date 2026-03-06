'use client';

import { useState } from 'react';
import styles from './comments.module.css';
import { Search, Filter, Trash2, Edit2, MessageSquare, User, ExternalLink, ThumbsUp, Star, TrendingDown, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function CommentsManagement() {
  const { showToast } = useToast();
  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<any>(null);
  const [editText, setEditText] = useState('');

  const [comments, setComments] = useState([
    { id: '1', author: 'plaza_krali', content: 'Çok doğru tespitler. Özellikle "As discussed" kısmı tam bir savunma sanatı.', post: 'Kurumsal Mail Dili...', likes: 4, date: '06.03.2026' },
    { id: '2', author: 'dertli_beyazyaka', content: 'BCCye taşınmak aslında "seninle işim bitti" demenin medeni yolu.', post: 'Kurumsal Mail Dili...', likes: 2, date: '06.03.2026' },
    { id: '3', author: 'yazar_aytek', content: 'Kesinlikle, hayatta kalmanın ilk kuralı mail trafiğini yönetmek!', post: 'Kurumsal Mail Dili...', likes: 1, date: '06.03.2026' },
    { id: '4', author: 'gizli_user', content: 'Müdürümle bu konuyu konuşamıyorum bile.', post: 'Müdürüm Beni Neden...', likes: 0, date: '05.03.2026' },
  ]);

  const handleDelete = (id: string, author: string) => {
    setComments(comments.filter(c => c.id !== id));
    showToast(`${author} kullanıcısının yorumu silindi.`, 'success');
  };

  const openEditModal = (comment: any) => {
    setEditingComment(comment);
    setEditText(comment.content);
    setIsModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setComments(comments.map(c => c.id === editingComment.id ? { ...c, content: editText } : c));
    showToast('Yorum başarıyla güncellendi.', 'success');
    setIsModalOpen(false);
  };
  
  // Existing summaryStats and top10Data...
  const summaryStats = [
    { id: 'likes', label: 'En Çok Like Alanlar', value: '42', detail: 'Haftalık zirve', icon: ThumbsUp, color: 'var(--accent)' },
    { id: 'ratings', label: 'En Yüksek Puanlılar', value: '4.8/5', detail: 'Genel ortalama', icon: Star, color: 'var(--accent)' },
    { id: 'low-ratings', label: 'En Düşük Puanlılar', value: '1.2/5', detail: 'İnceleme bekleyen', icon: TrendingDown, color: '#ef4444' },
    { id: 'discuss', label: 'En Çok Yorum Alanlar', value: '156', detail: 'Yazı başına', icon: TrendingUp, color: '#3b82f6' },
  ];

  const top10Data: Record<string, any[]> = {
    likes: [
      { id: 1, title: 'BCC Sanatı', author: 'plaza_krali', score: '124 Like' },
      { id: 2, title: 'As Discussed Üzerine', author: 'yazar_aytek', score: '98 Like' },
      { id: 3, title: 'Müdürle Başa Çıkma', author: 'mert_stj', score: '82 Like' },
    ],
    ratings: [
      { id: 1, title: 'Kurumsal Sözlük', author: 'aytek_bey', score: '4.9 Yıldız' },
      { id: 2, title: 'İstifa Rehberi', author: 'kurumsal_kacak', score: '4.8 Yıldız' },
      { id: 3, title: 'Maaş Pazarlığı', author: 'pro_yazar', score: '4.7 Yıldız' },
    ],
    'low-ratings': [
      { id: 1, title: 'Ofiste Yoga Deneyi', author: 'spirituel_stajyer', score: '1.1 Yıldız' },
      { id: 2, title: 'Erken Kalkma Sırları', author: 'sabah_insani', score: '1.3 Yıldız' },
    ],
    discuss: [
      { id: 1, title: 'Uzaktan Çalışma Bitti mi?', author: 'ik_direktoru', score: '450+ Yorum' },
      { id: 2, title: 'Yan Haklar vs Maaş', author: 'analizci', score: '320+ Yorum' },
    ]
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Yorum Yönetimi</h1>
          <p className={styles.subtitle}>Sitedeki tüm yorumları buradan denetleyebilir ve yönetebilirsiniz.</p>
        </div>
      </header>

      <div className={styles.summaryGrid}>
        {summaryStats.map((stat) => (
          <div 
            key={stat.id} 
            className={`${styles.summaryCard} ${activeMetric === stat.id ? styles.active : ''}`}
            onClick={() => setActiveMetric(activeMetric === stat.id ? null : stat.id)}
          >
            <div className={styles.statIcon} style={{ borderColor: stat.color, backgroundColor: `${stat.color}10` }}>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div className={styles.statData}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statDetail}>{stat.detail}</span>
            </div>
          </div>
        ))}
      </div>

      {activeMetric && (
        <div className={styles.top10Section}>
          <div className={styles.top10Header}>
            <h3>Top 10: {summaryStats.find(s => s.id === activeMetric)?.label}</h3>
            <button onClick={() => setActiveMetric(null)} className={styles.closeBtn}><X size={18} /></button>
          </div>
          <div className={styles.top10Grid}>
            {(top10Data[activeMetric] || []).map((item, idx) => (
              <div key={item.id} className={styles.top10Item}>
                <span className={styles.rank}>{idx + 1}</span>
                <div className={styles.itemInfo}>
                  <strong>{item.title}</strong>
                  <span>@{item.author}</span>
                </div>
                <div className={styles.itemScore}>{item.score}</div>
                <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => showToast('İçeriğe gidiliyor...', 'info')} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.tableCard}>
        <div className={styles.tableFilters}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input type="text" placeholder="Yorum içeriği veya kullanıcı ile ara..." onChange={() => {}} />
          </div>
          <div className={styles.filterActions}>
            <Button variant="outline" size="sm" icon={Filter}>Sırala: En Yeni</Button>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Yorum / İçerik</th>
              <th>Kullanıcı</th>
              <th>Etkileşim</th>
              <th>Tarih</th>
              <th className={styles.actionCol}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment.id}>
                <td className={styles.contentCol}>
                  <p className={styles.commentText}>"{comment.content}"</p>
                  <span className={styles.postContext}><ExternalLink size={10} /> {comment.post}</span>
                </td>
                <td>
                  <div className={styles.userInfo}>
                    <User size={14} /> <strong>{comment.author}</strong>
                  </div>
                </td>
                <td>
                  <span className={styles.likesBadge}>
                    <ThumbsUp size={12} /> {comment.likes}
                  </span>
                </td>
                <td>{comment.date}</td>
                <td className={styles.actionCol}>
                  <div className={styles.actions}>
                    <Button variant="ghost" size="sm" icon={Edit2} onClick={() => openEditModal(comment)}>Düzenle</Button>
                    <Button variant="ghost" size="sm" icon={Trash2} className={styles.deleteBtn} onClick={() => handleDelete(comment.id, comment.author)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <span>Toplam 3.420 yorumdan 1-{comments.length} arası gösteriliyor</span>
          <div className={styles.pageButtons}>
            <Button variant="outline" size="sm" disabled>Önceki</Button>
            <Button variant="outline" size="sm" onClick={() => showToast('Sayfa geçişi simülasyonu!', 'info')}>Sonraki</Button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Yorumu Düzenle</h2>
            <form onSubmit={handleEditSubmit}>
              <div className={styles.formGroup}>
                <label>@{editingComment?.author} tarafından yapılan yorum</label>
                <textarea 
                  value={editText} 
                  onChange={(e) => setEditText(e.target.value)}
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>İptal</Button>
                <Button type="submit">Güncelle</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
