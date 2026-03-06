'use client';

import { useState } from 'react';
import styles from './hubs.module.css';
import { LayoutTemplate, Plus, ExternalLink, Image, Search, Settings2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

import { use } from 'react';

export default function HubsManagement({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: currentLocale } = use(params);
  const { showToast } = useToast();
  const [hubs, setHubs] = useState([
    { id: 1, name: currentLocale === 'en' ? 'Brands' : 'Beyaz Yaka Markaları', slug: 'markalar', posts: 12, status: 'active' },
    { id: 2, name: currentLocale === 'en' ? 'Environments' : 'Beyaz Yaka Ortamları', slug: 'ortamlar', posts: 8, status: 'active' },
    { id: 3, name: currentLocale === 'en' ? 'Friday Escapes' : 'Cuma Kaçış Rotaları', slug: 'rotalar', posts: 15, status: 'active' },
    { id: 4, name: currentLocale === 'en' ? 'Network Spots' : 'Network Mekanları', slug: 'network', posts: 5, status: 'draft' },
  ]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Hub Sayfa Yönetimi</h1>
          <p className={styles.subtitle}>Büyük kategori giriş sayfalarını (Markalar, Rotalar vb.) buradan yapılandırın.</p>
        </div>
        <Button icon={Plus} onClick={() => showToast('Yeni Hub tasarım modülü üzerinde çalışıyoruz. Çok yakında burada olacak!', 'info')}>Yeni Hub Oluştur</Button>
      </header>

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
                <span className={styles.postsCount}>{hub.posts} İçerik</span>
              </div>
              <p className={styles.slug}>/{hub.slug}</p>
              
              <div className={styles.hubActions}>
                <Button variant="outline" size="sm" icon={Settings2} onClick={() => showToast(`${hub.name} sayfası ayarları ve özelleştirme seçenekleri yakında eklenecek.`, 'info')}>Sayfa Ayarları</Button>
                <div className={styles.quickIcons}>
                   <button title="Görüntüle" onClick={() => showToast('Hub önizleme özelliği yakında aktif edilecek.', 'info')}><Eye size={16} /></button>
                   <button title="URL Kopyala" onClick={() => {
                     navigator.clipboard.writeText(`${window.location.origin}/tr/${hub.slug}`);
                     showToast('Sayfa bağlantısı panoya kopyalandı!', 'success');
                   }}><ExternalLink size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
