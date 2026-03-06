'use client';

import { useState, useEffect, use } from 'react';
import { AdminPagination } from '@/components/ui/AdminPagination';

import styles from './hubs.module.css';
import { LayoutTemplate, Plus, ExternalLink, Image, Search, Settings2, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function HubsManagement({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: currentLocale } = use(params);
  const { showToast } = useToast();
  const [hubsPage, setHubsPage] = useState(1);
  const HUBS_PAGE_SIZE = 15;
  const [hubs, setHubs] = useState<any[]>([]);
  const [hubsTotal, setHubsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHubs();
  }, [currentLocale, page]);

  const fetchHubs = async () => {
    setLoading(true);
    try {
      // Fetching from carousel API since carousels act as hubs
      const res = await fetch(`/api/admin/hubs?page=${page}&pageSize=15`);
      const { data, total } = await res.json();
        setHubsTotal(total || 0);
      if (res.ok) {
        setHubs((data || []).map((item: any) => ({
          id: item.id,
          name: item.title,
          slug: item.link.replace(/^\//, ''), // Remove leading slash if any
          status: item.status,
          posts: 0 // Placeholder for posts, can be updated later if needed
        })));
      }
    } catch (error) {
      showToast('Veriler yüklenirken hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Hub Sayfa Yönetimi</h1>
          <p className={styles.subtitle}>Büyük kategori giriş sayfalarını (Markalar, Rotalar vb.) buradan yapılandırın.</p>
        </div>
        <Button icon={Plus} onClick={() => showToast('Yeni Hub tasarım modülü üzerinde çalışıyoruz. Çok yakında burada olacak!', 'info')}>Yeni Hub Oluştur</Button>
      </header>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <Loader2 className="animate-spin" size={20} /> Veriler yükleniyor...
        </div>
      ) : (
        <div className={styles.hubGrid}>
          {hubs.map((hub) => (
            <div key={hub.id} className={`${styles.hubCard} ${styles[hub.status]}`}>
              <div className={styles.hubPreview}>
                 <LayoutTemplate size={40} className={styles.previewIcon} />
                 <div className={styles.hubBadge}>{hub.status === 'active' ? 'AKTİF' : 'TASLAK'}</div>
              </div>
              
              <div className={styles.hubBody}>
                <div className={styles.hubHeader}>
                  <h3>{hub.name}</h3>
                  <span className={styles.postsCount}>Hub Sayfası</span>
                </div>
                <p className={styles.slug}>/{hub.slug}</p>
                
                <div className={styles.hubActions}>
                  <Button variant="outline" size="sm" icon={Settings2} onClick={() => showToast(`${hub.name} sayfası ayarları ve özelleştirme seçenekleri yakında eklenecek.`, 'info')}>Sayfa Ayarları</Button>
                  <div className={styles.quickIcons}>
                     <button title="Görüntüle" onClick={() => showToast('Hub önizleme özelliği yakında aktif edilecek.', 'info')}><Eye size={16} /></button>
                     <button title="URL Kopyala" onClick={() => {
                       navigator.clipboard.writeText(`${window.location.origin}/${currentLocale}/${hub.slug}`);
                       showToast('Sayfa bağlantısı panoya kopyalandı!', 'success');
                     }}><ExternalLink size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

        <AdminPagination
          page={page}
          totalPages={Math.ceil(hubsTotal / 15)}
          onPageChange={setPage}
          totalItems={hubsTotal}
          pageSize={15}
        />
    </div>
  );
}
