'use client';

import { useState, useEffect } from 'react';
import styles from './settings.module.css';
import { Save, Shield, Bell, Globe, Lock, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function SystemSettings() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Beyaz Yaka Dosyası',
    maintenance: false,
    lockout: true,
    emailNotif: true,
    authControl: true,
    cacheTTL: 5
  });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        showToast('Sistem ayarları başarıyla güncellendi.', 'success');
      } else {
        showToast('Ayarlar güncellenirken bir hata oluştu.', 'error');
      }
    } catch (error) {
      showToast('Ayarlar güncellenirken bir hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePurgeCache = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/cache-reset', { method: 'POST' });
      if (res.ok) {
        showToast('Önbellek başarıyla temizlendi.', 'success');
      } else {
        showToast('Cache temizlenirken hata oluştu.', 'error');
      }
    } catch (error) {
      showToast('İşlem başarısız.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Sistem Ayarları</h1>
          <p className={styles.subtitle}>Platformun küresel yapılandırmalarını buradan yönetin.</p>
        </div>
        <Button icon={Save} onClick={handleSave} disabled={loading}>
          {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
        </Button>
      </header>

      <div className={styles.settingsGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Globe size={20} />
            <h2>Genel Bilgiler</h2>
          </div>
          <div className={styles.formGroup}>
            <label>Site Başlığı</label>
            <input type="text" value={settings.siteName} onChange={(e) => setSettings({...settings, siteName: e.target.value})} />
          </div>
          <div className={styles.formGroup}>
            <label>Bakım Modu</label>
            <div className={styles.toggleRow}>
              <span>Siteyi sadece yöneticilere aç</span>
              <input type="checkbox" checked={settings.maintenance} onChange={(e) => setSettings({...settings, maintenance: e.target.checked})} />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Shield size={20} />
            <h2>Güvenlik ve Yetkilendirme</h2>
          </div>
          <div className={styles.formGroup}>
            <label>Hesap Kilitleme</label>
            <div className={styles.toggleRow}>
              <span>Hatalı girişte geçici blokla</span>
              <input type="checkbox" checked={settings.lockout} onChange={(e) => setSettings({...settings, lockout: e.target.checked})} />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Auth Kontrolü (Yetkilendirme)</label>
            <div className={styles.toggleRow}>
              <span>Sitedeki kullanıcı kurallarını (yorum/metin engeli vb.) uygula</span>
              <input type="checkbox" checked={settings.authControl} onChange={(e) => setSettings({...settings, authControl: e.target.checked})} />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Kayıt Kuralları</label>
            <select><option>Sıkı (Argon2id + Kurallar)</option><option>Standart</option></select>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Bell size={20} />
            <h2>Bildirimler</h2>
          </div>
          <div className={styles.formGroup}>
            <div className={styles.toggleRow}>
              <span>Yeni raporlarda e-posta gönder</span>
              <input type="checkbox" checked={settings.emailNotif} onChange={(e) => setSettings({...settings, emailNotif: e.target.checked})} />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Cpu size={20} />
            <h2>Performans ve Önbellek</h2>
          </div>
          <div className={styles.formGroup}>
            <label>Önbellek Süresi (TTL - Dakika)</label>
            <div className={styles.toggleRow}>
              <span>Verilerin sunucuda saklanma süresi</span>
              <input 
                type="number" 
                style={{ width: '80px', background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 8px', color: 'white' }}
                value={settings.cacheTTL} 
                onChange={(e) => setSettings({...settings, cacheTTL: parseInt(e.target.value)})} 
              />
            </div>
          </div>
          <div className={styles.formGroup} style={{ marginTop: '16px' }}>
            <Button variant="outline" onClick={handlePurgeCache} disabled={loading} style={{ width: '100%', borderColor: 'rgba(200,246,63,0.3)', color: 'var(--accent)' }}>
              Tüm Önbelleği (Cache) Temizle
            </Button>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              Bu işlem sunucu tarafındaki tüm önbelleği sıfırlar ve sayfaların yeni verilerle oluşturulmasını sağlar.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
