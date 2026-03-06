'use client';

import { useState } from 'react';
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
    emailNotif: true
  });

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Sistem ayarları başarıyla güncellendi.', 'success');
    }, 800);
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
            <h2>Güvenlik</h2>
          </div>
          <div className={styles.formGroup}>
            <label>Hesap Kilitleme</label>
            <div className={styles.toggleRow}>
              <span>Hatalı girişte geçici blokla</span>
              <input type="checkbox" checked={settings.lockout} onChange={(e) => setSettings({...settings, lockout: e.target.checked})} />
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
      </div>
    </div>
  );
}
