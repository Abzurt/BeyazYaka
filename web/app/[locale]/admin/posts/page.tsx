'use client';

import { useState } from 'react';
import styles from './posts.module.css';
import { Search, Filter, Check, X, Clock, ExternalLink, MessageCircle, Undo } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function PostsManagement() {
  const { showToast } = useToast();
  const [posts, setPosts] = useState([
    { id: '1', title: 'Kurumsal Mail Dili Çeviri Sözlüğü', author: 'yazar_aytek', status: 'published', date: '06.03.2026', views: 1240, comments: 12 },
    { id: '2', title: 'İstifanın En Şık Yolu: 5 Adımda Veda', author: 'plaza_krali', status: 'pending', date: '06.03.2026', views: 0, comments: 0 },
    { id: '3', title: 'Müdürüm Beni Neden Sevmiyor?', author: 'dertli_beyazyaka', status: 'published', date: '05.03.2026', views: 820, comments: 45 },
    { id: '4', title: 'Yemek Kartı ile Hayatta Kalma Rehberi', author: 'stajyer_can', status: 'rejected', date: '04.03.2026', views: 0, comments: 0 },
  ]);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        showToast(`"${p.title}" yazısı ${newStatus === 'published' ? 'onaylandı' : 'reddedildi'}.`, newStatus === 'published' ? 'success' : 'info');
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'published': return <Check size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'rejected': return <X size={14} />;
      default: return null;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>İçerik Moderasyonu</h1>
          <p className={styles.subtitle}>Bekleyen yazıları onaylayabilir veya yayındaki içerikleri yönetebilirsiniz.</p>
        </div>
      </header>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input type="text" placeholder="Başlık veya yazar ile ara..." onChange={() => {}} />
          </div>
          <div className={styles.filters}>
            <Button variant="outline" size="sm" icon={Filter} onClick={() => showToast('Gelişmiş filtreler yakında!', 'info')}>Durum: Hepsi</Button>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>İçerik Başlığı</th>
              <th>Yazar</th>
              <th>Durum</th>
              <th>Tarih</th>
              <th>İstatistik</th>
              <th className={styles.actionCol}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className={styles[post.status]}>
                <td className={styles.titleCol}>
                  <strong>{post.title}</strong>
                  <button className={styles.previewLink} onClick={() => showToast('Önizleme modu yakında!', 'info')}><ExternalLink size={12} /> Önizle</button>
                </td>
                <td>@{post.author}</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[post.status]}`}>
                    {getStatusIcon(post.status)}
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </span>
                </td>
                <td>{post.date}</td>
                <td>
                  <div className={styles.stats}>
                    <span title="Görüntülenme"><ExternalLink size={12} /> {post.views}</span>
                    <span title="Yorumlar"><MessageCircle size={12} /> {post.comments}</span>
                  </div>
                </td>
                <td className={styles.actionCol}>
                  <div className={styles.actions}>
                    {post.status === 'pending' ? (
                      <>
                        <Button size="sm" icon={Check} onClick={() => handleUpdateStatus(post.id, 'published')}>Onayla</Button>
                        <Button variant="ghost" size="sm" icon={X} className={styles.rejectBtn} onClick={() => handleUpdateStatus(post.id, 'rejected')}>Reddet</Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="sm" icon={Undo} onClick={() => handleUpdateStatus(post.id, 'pending')}>Geri Al</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
