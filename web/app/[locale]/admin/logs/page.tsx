'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './logs.module.css';
import { Search, Filter, Activity, Clock, User as UserIcon, Shield, Search as SearchIcon, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface Log {
  id: string;
  userId: string;
  action: string;
  targetId: string | null;
  targetType: string | null;
  details: any;
  createdAt: string;
  user: {
    username: string;
    email: string;
  };
}

export default function AdminLogs() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        search,
        action: actionFilter
      });
      const res = await fetch(`/api/admin/logs?${query.toString()}`);
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (error) {
      showToast('Loglar yüklenemedi.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, actionFilter, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLogs();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create_post': return 'İçerik Oluşturma';
      case 'edit_post': return 'İçerik Düzenleme';
      case 'delete_post': return 'İçerik Silme';
      case 'create_user': return 'Yeni Üye Kaydı';
      case 'update_user': return 'Üye Güncelleme';
      case 'delete_user': return 'Üye Silme';
      case 'login': return 'Giriş Yapıldı';
      case 'create_carousel_item': return 'Manşet Ekleme';
      case 'update_carousel_item': return 'Manşet Güncelleme';
      case 'delete_carousel_item': return 'Manşet Silme';
      case 'create_ad_campaign': return 'Kampanya Ekleme';
      case 'update_ad_campaign': return 'Kampanya Güncelleme';
      case 'delete_ad_campaign': return 'Kampanya Silme';
      case 'create_quiz': return 'Test Ekleme';
      case 'edit_quiz': return 'Test Güncelleme';
      case 'delete_quiz': return 'Test Silme';
      default: return action;
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('delete')) return styles.deleteColor;
    if (action.includes('create')) return styles.createColor;
    if (action.includes('edit') || action.includes('update')) return styles.updateColor;
    return styles.defaultColor;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Kullanıcı Logları</h1>
          <p className={styles.subtitle}>Sistem üzerindeki tüm kullanıcı aktivitelerini takip edin.</p>
        </div>
      </header>

      <div className={styles.filterCard}>
        <div className={styles.searchBox}>
          <SearchIcon size={18} />
          <input 
            type="text" 
            placeholder="Kullanıcı adı, işlem veya tip ara..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className={styles.selectWrapper}>
          <Filter size={16} />
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="">Tüm İşlemler</option>
            <option value="create_post">İçerik Oluşturma</option>
            <option value="edit_post">İçerik Düzenleme</option>
            <option value="delete_post">İçerik Silme</option>
            <option value="create_user">Yeni Üye Kaydı</option>
            <option value="update_user">Üye Güncelleme</option>
            <option value="delete_user">Üye Silme</option>
            <option value="create_carousel_item">Manşet Ekleme</option>
            <option value="update_carousel_item">Manşet Güncelleme</option>
            <option value="delete_carousel_item">Manşet Silme</option>
            <option value="create_ad_campaign">Kampanya Ekleme</option>
            <option value="update_ad_campaign">Kampanya Güncelleme</option>
            <option value="delete_ad_campaign">Kampanya Silme</option>
            <option value="create_quiz">Test Ekleme</option>
            <option value="edit_quiz">Test Güncelleme</option>
            <option value="delete_quiz">Test Silme</option>
          </select>
        </div>
      </div>

      <div className={styles.logsList}>
        {loading ? (
          <div className={styles.loadingState}>
            <Loader2 className={styles.spinner} size={40} />
            <p>Loglar yükleniyor...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className={styles.emptyState}>
            <Activity size={48} />
            <p>Sonuç bulunamadı.</p>
          </div>
        ) : (
          <div className={styles.logsTableWrapper}>
            <table className={styles.logsTable}>
              <thead>
                <tr>
                  <th>Zaman</th>
                  <th>Kullanıcı</th>
                  <th>İşlem</th>
                  <th>Hedef</th>
                  <th>Detaylar</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className={styles.logRow}>
                    <td className={styles.timeCol}>
                      <div className={styles.timeInfo}>
                        <Clock size={12} />
                        <span>{new Date(log.createdAt).toLocaleString('tr-TR')}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>{log.user.username[0].toUpperCase()}</div>
                        <div className={styles.userDetails}>
                          <strong>{log.user.username}</strong>
                          <span>{log.user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.actionBadge} ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td>
                      {log.targetType && (
                        <div className={styles.targetInfo}>
                          <span className={styles.targetType}>{log.targetType}</span>
                          <span className={styles.targetId}>{log.targetId?.slice(0, 8)}...</span>
                        </div>
                      )}
                    </td>
                    <td className={styles.detailsCol}>
                      <pre className={styles.detailsJson}>
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.pagination}>
          <span>{total} sonuçtan {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} arası gösteriliyor</span>
          <div className={styles.pageButtons}>
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Önceki</Button>
            <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Sonraki</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
