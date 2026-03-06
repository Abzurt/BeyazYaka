'use client';

import { useState, useEffect } from 'react';
import styles from './comments.module.css';
import { Search, Filter, Trash2, Edit2, MessageSquare, User, ExternalLink, ThumbsUp, Star, TrendingDown, TrendingUp, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { AdminPagination } from '@/components/ui/AdminPagination';

export default function CommentsManagement() {
  const { showToast } = useToast();
  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<any>(null);
  const [editText, setEditText] = useState('');

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('desc');
  const [dateRange, setDateRange] = useState('7d');
  const [comments, setComments] = useState<any[]>([]);
  const [statsData, setStatsData] = useState<any>(null);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const PAGE_SIZE = 15;

  useEffect(() => {
    fetchComments(search, filterType, sortBy, sortOrder, dateRange, commentsPage);
    fetchStats(dateRange);
  }, [filterType, sortBy, sortOrder, dateRange, commentsPage]);


  const fetchStats = async (range = dateRange) => {
    try {
      const res = await fetch(`/api/admin/comments/stats?dateRange=${range}`);
      if (res.ok) {
        const data = await res.json();
        setStatsData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchComments = async (query = search, type = filterType, sort = sortBy, order = sortOrder, range = dateRange, page = commentsPage) => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (type !== 'all') params.append('type', type);
      params.append('sortBy', sort);
      params.append('sortOrder', order);
      params.append('dateRange', range);
      params.append('page', page.toString());
      params.append('pageSize', PAGE_SIZE.toString());
      const res = await fetch(`/api/admin/comments?${params.toString()}`);
      if (res.ok) {
        const { data, total } = await res.json();
        setComments(data || []);
        setCommentsTotal(total || 0);
      }
    } catch (e) {

      console.error(e);
      showToast('Yorumlar yüklenemedi', 'error');
    }
  };

  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setCommentsPage(1);
      fetchComments(search, filterType, sortBy, sortOrder, dateRange, 1);
    }
  };

  const handleSort = (field: string) => {
    setCommentsPage(1);
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDelete = async (id: string, author: string) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setComments(comments.filter(c => c.id !== id));
        showToast(`${author} kullanıcısının yorumu silindi.`, 'success');
      } else {
        showToast('Silme başarısız.', 'error');
      }
    } catch {
       showToast('Bir hata oluştu.', 'error');
    }
  };

  const openEditModal = (comment: any) => {
    setEditingComment(comment);
    setEditText(comment.content);
    setIsModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/comments/${editingComment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editText })
      });
      if (res.ok) {
        setComments(comments.map(c => c.id === editingComment.id ? { ...c, content: editText } : c));
        showToast('Yorum başarıyla güncellendi.', 'success');
        setIsModalOpen(false);
      } else {
        showToast('Güncelleme başarısız.', 'error');
      }
    } catch {
      showToast('Bir hata oluştu.', 'error');
    }
  };
  
  // Existing summaryStats and top10Data...
  const summaryStats = statsData?.summaryStats || [
    { id: 'likes', label: 'Toplam Etkileşim', value: '...', detail: 'Yükleniyor', iconName: 'ThumbsUp', color: 'var(--accent)' },
    { id: 'ratings', label: 'Genel Puan Ort.', value: '...', detail: 'Yükleniyor', iconName: 'Star', color: 'var(--accent)' },
    { id: 'low-ratings', label: 'Düşük Puanlar (1-2)', value: '...', detail: 'Yükleniyor', iconName: 'TrendingDown', color: '#ef4444' },
    { id: 'discuss', label: 'Toplam Yorumlar', value: '...', detail: 'Yükleniyor', iconName: 'MessageSquare', color: '#3b82f6' },
  ];

  const top10Data = statsData?.top10Data || {
    likes: [],
    ratings: [],
    'low-ratings': [],
    discuss: []
  };

  const getIcon = (name: string) => {
    switch(name) {
      case 'ThumbsUp': return ThumbsUp;
      case 'Star': return Star;
      case 'TrendingDown': return TrendingDown;
      case 'MessageSquare': return MessageSquare;
      default: return MessageSquare;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Yorum Yönetimi</h1>
          <p className={styles.subtitle}>Sitedeki tüm yorumları buradan denetleyebilir ve yönetebilirsiniz.</p>
        </div>
        <div>
           <select 
              className={styles.filterSelect}
              value={dateRange}
              onChange={(e) => { setCommentsPage(1); setDateRange(e.target.value); }}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 500 }}
            >
              <option value="7d">Son 1 Hafta</option>
              <option value="30d">Son 1 Ay</option>
              <option value="all">Tüm Zamanlar</option>
            </select>
        </div>
      </header>

      <div className={styles.summaryGrid}>
        {summaryStats.map((stat: any) => {
          const Icon = getIcon(stat.iconName);
          return (
            <div 
              key={stat.id} 
              className={`${styles.summaryCard} ${activeMetric === stat.id ? styles.active : ''}`}
              onClick={() => setActiveMetric(activeMetric === stat.id ? null : stat.id)}
            >
              <div className={styles.statIcon} style={{ borderColor: stat.color, backgroundColor: `${stat.color}10` }}>
                <Icon size={20} color={stat.color} />
              </div>
              <div className={styles.statData}>
                <span className={styles.statLabel}>{stat.label}</span>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statDetail}>{stat.detail}</span>
              </div>
            </div>
          )
        })}
      </div>

      {activeMetric && (
        <div className={styles.top10Section}>
          <div className={styles.top10Header}>
            <h3>Top 10: {summaryStats.find((s: any) => s.id === activeMetric)?.label}</h3>
            <button onClick={() => setActiveMetric(null)} className={styles.closeBtn}><X size={18} /></button>
          </div>
          <div className={styles.top10Grid}>
            {(top10Data[activeMetric] || []).map((item: any, idx: number) => (
              <div key={item.id} className={styles.top10Item}>
                <span className={styles.rank}>{idx + 1}</span>
                <div className={styles.itemInfo}>
                  <strong>{item.title}</strong>
                  <span>@{item.author}</span>
                </div>
                <div className={styles.itemScore}>{item.score}</div>
                <Button variant="ghost" size="sm" icon={ExternalLink} onClick={() => window.open(item.url || '#', '_blank')} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.tableCard}>
        <div className={styles.tableFilters}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Yorum içeriği veya kullanıcı ile ara..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchSubmit} 
            />
          </div>
          <div className={styles.filterActions}>
            <select 
              className={styles.filterSelect}
              value={filterType}
              onChange={(e) => { setCommentsPage(1); setFilterType(e.target.value); }}
              style={{ padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              <option value="all">Sık Kullanılanlar Filtresi: Tümü</option>
              <option value="Post">Yazılar</option>
              <option value="Quiz">Testler</option>
              <option value="Survival Kit">Survival Kit</option>
            </select>
          </div>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Yorum / İçerik</th>
              <th>Kullanıcı</th>
              <th 
                className={styles.sortableCol} 
                onClick={() => handleSort('rating')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                   Puan {sortBy === 'rating' && (sortOrder === 'desc' ? <ChevronDown size={14}/> : <ChevronUp size={14}/>)}
                </div>
              </th>
              <th>Tür</th>
              <th 
                className={styles.sortableCol} 
                onClick={() => handleSort('likeCount')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                   Etkileşim {sortBy === 'likeCount' && (sortOrder === 'desc' ? <ChevronDown size={14}/> : <ChevronUp size={14}/>)}
                </div>
              </th>
              <th 
                className={styles.sortableCol} 
                onClick={() => handleSort('createdAt')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                   Tarih {sortBy === 'createdAt' && (sortOrder === 'desc' ? <ChevronDown size={14}/> : <ChevronUp size={14}/>)}
                </div>
              </th>
              <th className={styles.actionCol}>İşlemler</th>
            </tr>
          </thead>

          <tbody>
            {comments.map((comment) => (
              <tr key={comment.id}>
                <td className={styles.contentCol}>
                  <p className={styles.commentText}>"{comment.content}"</p>
                  <a href={comment.postUrl || "#"} target="_blank" rel="noopener noreferrer" className={styles.postContext}>
                    <ExternalLink size={10} /> {comment.post}
                  </a>
                </td>
                <td>
                  <div className={styles.userInfo}>
                    <User size={14} /> <strong>{comment.author}</strong>
                  </div>
                </td>
                <td>
                  {comment.rating ? (
                     <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent)' }}>
                        <Star size={14} fill="currentColor" /> <strong>{comment.rating}</strong>
                     </div>
                  ) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                </td>
                <td>
                  <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)' }}>
                     {comment.targetType}
                  </span>
                </td>
                <td>
                  <span className={styles.likesBadge}>
                    <ThumbsUp size={12} /> {comment.likes}
                  </span>
                </td>
                <td>{new Date(comment.createdAt).toLocaleDateString('tr-TR')}</td>
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

        <AdminPagination
          page={commentsPage}
          totalPages={Math.ceil(commentsTotal / PAGE_SIZE)}
          onPageChange={setCommentsPage}
          totalItems={commentsTotal}
          pageSize={PAGE_SIZE}
        />
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
