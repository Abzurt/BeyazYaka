'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminPagination } from '@/components/ui/AdminPagination';
import styles from './reports.module.css';
import { Flag, Search, CheckCircle, XCircle, AlertTriangle, User, MessageCircle, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function ReportsManagement() {
  const { showToast } = useToast();
  const [reports, setReports] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const PAGE_SIZE = 15;

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/reports?${params}`);
      if (res.ok) {
        const { data, total: t } = await res.json();
        setReports(data || []);
        setTotal(t || 0);
      }
    } catch {
      showToast('Raporlar yüklenemedi.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleAction = async (id: string, action: 'resolved' | 'dismissed') => {
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: action }),
      });
      if (res.ok) {
        setReports(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
        showToast(`Rapor ${action === 'resolved' ? 'çözümlendi' : 'reddedildi'}.`, 'success');
      }
    } catch {
      showToast('İşlem başarısız.', 'error');
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'open': return <span className={styles.openBadge}>Açık</span>;
      case 'reviewing': return <span className={styles.reviewBadge}>İncelemede</span>;
      case 'resolved': return <span className={styles.resolvedBadge}>Çözüldü</span>;
      default: return <span className={styles.dismissedBadge}>Reddedildi</span>;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Rapor ve Şikayetler</h1>
          <p className={styles.subtitle}>Kullanıcılardan gelen bildirimleri buradan inceleyip sonuçlandırabilirsiniz.</p>
        </div>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <AlertTriangle size={16} color="#ef4444" />
            <strong>{reports.filter(r => r.status === 'open').length}</strong> Açık
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-dim)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
        >
          <option value="">Durum: Hepsi</option>
          <option value="open">Açık</option>
          <option value="reviewing">İncelemede</option>
          <option value="resolved">Çözüldü</option>
          <option value="dismissed">Reddedildi</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          <Flag size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>Hiç rapor bulunamadı.</p>
        </div>
      ) : (
        <div className={styles.reportsGrid}>
          {reports.map((report) => (
            <div key={report.id} className={`${styles.reportCard} ${styles[report.status]}`}>
              <div className={styles.cardHeader}>
                <div className={styles.typeIcon}>
                  {report.postId ? <FileText size={20} /> : <MessageCircle size={20} />}
                </div>
                <div className={styles.reportMeta}>
                  <span className={styles.typeLabel}>{report.targetType || 'Şikayet'}</span>
                  {getStatusLabel(report.status)}
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.targetTitle}>"{report.reason}"</h3>
                {report.description && <p className={styles.reason}>{report.description}</p>}
                <div className={styles.footerInfo}>
                  <div className={styles.user}>
                    <User size={12} /> {report.reporter?.username || 'Bilinmeyen'}
                  </div>
                  <div className={styles.date}>{new Date(report.createdAt).toLocaleDateString('tr-TR')}</div>
                </div>
              </div>

              <div className={styles.cardActions}>
                {report.status !== 'resolved' && report.status !== 'dismissed' && (
                  <div className={styles.decisionGroup}>
                    <Button size="sm" icon={CheckCircle} onClick={() => handleAction(report.id, 'resolved')}>Çöz</Button>
                    <Button variant="ghost" size="sm" icon={XCircle} className={styles.rejectBtn} onClick={() => handleAction(report.id, 'dismissed')}>Red</Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
