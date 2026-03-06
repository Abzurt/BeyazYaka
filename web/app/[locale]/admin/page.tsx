import styles from './dashboard.module.css';
import { Users, FileText, Flag, TrendingUp, MessageSquare } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { label: 'Toplam Üye', value: '1.284', change: '+12%', icon: Users },
    { label: 'Aktif Yazılar', value: '342', change: '+5%', icon: FileText },
    { label: 'Bekleyen Raporlar', value: '4', change: '-20%', color: '#ef4444', icon: Flag },
    { label: 'Aylık Trafik', value: '45.2K', change: '+18%', icon: TrendingUp },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Sistemin genel durumuna ve aktivite özetine buradan ulaşabilirsiniz.</p>
      </header>

      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statChange} style={{ color: stat.color }}>
                {stat.change} bu ay
              </span>
            </div>
            <div className={styles.statIcon} style={{ borderColor: stat.color }}>
              <stat.icon size={24} color={stat.color || 'var(--accent)'} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.chartPlaceholder}>
          <h3>Aktivite Grafiği</h3>
          <div className={styles.emptyChart}>
            Grafik verileri yakında burada...
          </div>
        </div>
        
        <div className={styles.recentActivity}>
          <h3>Son İşlemler</h3>
          <div className={styles.activityList}>
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className={styles.activityItem}>
                <div className={styles.dot} />
                <div className={styles.activityContent}>
                  <strong>yazar_aytek</strong> yeni bir yazı yayınladı: <em>"Kurumsal Hayat..."</em>
                  <span>2 saat önce</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
