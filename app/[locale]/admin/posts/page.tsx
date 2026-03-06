'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminPagination } from '@/components/ui/AdminPagination';
import styles from './posts.module.css';
import { Search, Filter, Check, X, Clock, ExternalLink, MessageCircle, Undo, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function PostsManagement() {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const PAGE_SIZE = 15;

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const res = await fetch(`/api/admin/posts?${params}`);
      if (res.ok) {
        const { data, total: t } = await res.json();
        setPosts(data || []);
        setTotal(t || 0);
      }
    } catch {
      showToast('Yazılar yüklenemedi.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleUpdateStatus = async (id: string, newStatus: string, title: string) => {
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setPosts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        showToast(`"${title}" ${newStatus === 'published' ? 'onaylandı' : 'reddedildi'}.`, newStatus === 'published' ? 'success' : 'info');
      } else {
        showToast('İşlem başarısız.', 'error');
      }
    } catch {
      showToast('Bir hata oluştu.', 'error');
    }
  };

  const getStatusIcon = (s: string) => {
    if (s === 'published') return <Check size={14} />;
    if (s === 'pending') return <Clock size={14} />;
    if (s === 'rejected') return <X size={14} />;
    return null;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>İçerik Moderasyonu</h1>
          <p className={styles.subtitle}>Bekleyen yazıları onaylayabilir veya yayındaki içerikleri yönetebilirsiniz. <strong>{total}</strong> yazı.</p>
        </div>
      </header>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input
              type="text"
              placeholder="Başlık veya slug ile ara..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className={styles.filters}>
            <select
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              style={{ padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dim)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
            >
              <option value="">Durum: Hepsi</option>
              <option value="published">Yayında</option>
              <option value="pending">Beklemede</option>
              <option value="rejected">Reddedildi</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>İçerik Başlığı</th>
                <th>Yazar</th>
                <th>Alan</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th className={styles.actionCol}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className={styles[post.status]}>
                  <td className={styles.titleCol}>
                    <strong>{post.title}</strong>
                    {post.slug && (
                      <a href={`/tr/yazi/${post.slug}`} target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
                        <ExternalLink size={12} /> Önizle
                      </a>
                    )}
                  </td>
                  <td>@{post.author?.username || '—'}</td>
                  <td><span style={{ fontSize: '12px', opacity: 0.7 }}>{post.area}</span></td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[post.status]}`}>
                      {getStatusIcon(post.status)}
                      {post.status}
                    </span>
                  </td>
                  <td>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td className={styles.actionCol}>
                    <div className={styles.actions}>
                      {post.status === 'pending' ? (
                        <>
                          <Button size="sm" icon={Check} onClick={() => handleUpdateStatus(post.id, 'published', post.title)}>Onayla</Button>
                          <Button variant="ghost" size="sm" icon={X} className={styles.rejectBtn} onClick={() => handleUpdateStatus(post.id, 'rejected', post.title)}>Reddet</Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm" icon={Undo} onClick={() => handleUpdateStatus(post.id, 'pending', post.title)}>Geri Al</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AdminPagination
        page={page}
        totalPages={Math.ceil(total / PAGE_SIZE)}
        onPageChange={setPage}
        totalItems={total}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
