'use client';

import { useState } from 'react';
import styles from './reports.module.css';
import { Flag, Search, CheckCircle, XCircle, AlertTriangle, User, MessageCircle, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function ReportsManagement() {
  const { showToast } = useToast();
  const [reports, setReports] = useState([
    { id: '1', type: 'post', target: 'Kurumsal Mail...', reason: 'Spam / Reklam', reporter: 'plaza_krali', date: '06.03.2026', status: 'open' },
    { id: '2', type: 'comment', target: 'BCCye taşınmak...', reason: 'Uygunsuz Dil', reporter: 'dertli_beyazyaka', date: '06.03.2026', status: 'reviewing' },
    { id: '3', type: 'post', target: 'Müdürüm Beni...', reason: 'Telif Hakkı', reporter: 'gizli_user', date: '05.03.2026', status: 'open' },
    { id: '4', type: 'comment', target: 'Çok doğru...', reason: 'Taciz / Zorbalık', reporter: 'stajyer_mert', date: '04.03.2026', status: 'resolved' },
  ]);

  const handleAction = (id: string, action: 'resolve' | 'dismiss') => {
    setReports(prev => prev.map(r => {
      if (r.id === id) {
        showToast(`Rapor ${action === 'resolve' ? 'çözümlendi' : 'reddedildi'}.`, 'success');
        return { ...r, status: action === 'resolve' ? 'resolved' : 'dismissed' };
      }
      return r;
    }));
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
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
        <div className={styles.searchBox}>
          <Search size={18} />
          <input type="text" placeholder="Rapor veya kullanıcı ara..." onChange={() => {}} />
        </div>
        <div className={styles.stats}>
          <div className={styles.statItem}>
             <AlertTriangle size={16} color="#ef4444" />
             <strong>{reports.filter(r => r.status === 'open').length}</strong> Açık
          </div>
        </div>
      </div>

      <div className={styles.reportsGrid}>
        {reports.map((report) => (
          <div key={report.id} className={`${styles.reportCard} ${styles[report.status]}`}>
            <div className={styles.cardHeader}>
              <div className={styles.typeIcon}>
                {report.type === 'post' ? <FileText size={20} /> : <MessageCircle size={20} />}
              </div>
              <div className={styles.reportMeta}>
                <span className={styles.typeLabel}>{report.type === 'post' ? 'Yazı Şikayeti' : 'Yorum Şikayeti'}</span>
                {getStatusLabel(report.status)}
              </div>
            </div>

            <div className={styles.cardBody}>
              <h3 className={styles.targetTitle}>"{report.target}"</h3>
              <p className={styles.reason}><strong>Sebep:</strong> {report.reason}</p>
              
              <div className={styles.footerInfo}>
                <div className={styles.user}>
                  <User size={12} /> {report.reporter}
                </div>
                <div className={styles.date}>{report.date}</div>
              </div>
            </div>

            <div className={styles.cardActions}>
              <Button variant="outline" size="sm" icon={ExternalLink} onClick={() => showToast('İçerik inceleniyor...', 'info')}>İncele</Button>
              {report.status !== 'resolved' && report.status !== 'dismissed' && (
                <div className={styles.decisionGroup}>
                  <Button size="sm" icon={CheckCircle} onClick={() => handleAction(report.id, 'resolve')}>Çöz</Button>
                  <Button variant="ghost" size="sm" icon={XCircle} className={styles.rejectBtn} onClick={() => handleAction(report.id, 'dismiss')}>Red</Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
