'use client';

import { useState } from 'react';
import styles from './editor.module.css';
import { Save, Eye, ArrowLeft, Image, Tags, Layout, Globe, Lock, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';

export default function ContentEditor() {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    title: 'Kurumsal Mail Dili Çeviri Sözlüğü',
    slug: 'kurumsal-mail-dili-sozlugu',
    category: 'gercekler-yalanlar',
    visibility: 'public',
    status: 'published',
    excerpt: 'Plaza dilinin gizli anlamlarını keşfedin.',
    content: 'Kurumsal hayatın vazgeçilmezi olan mailleşme dilinde her kelimenin aslında sakladığı bir anlam vardır...'
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('İçerik başarıyla güncellendi.', 'success');
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.left}>
          <Link href="/admin/posts">
            <Button variant="ghost" size="sm" icon={ArrowLeft}>Yazılara Dön</Button>
          </Link>
          <h1 className={styles.title}>İçerik Düzenleyici</h1>
        </div>
        <div className={styles.actions}>
          <Button variant="outline" icon={Eye} onClick={() => showToast('Önizleme oluşturuluyor...', 'info')}>Önizle</Button>
          <Button icon={Save} onClick={handleSave} disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Güncelle'}
          </Button>
        </div>
      </header>

      <div className={styles.editorGrid}>
        <div className={styles.mainEditor}>
          <div className={styles.card}>
            <div className={styles.inputGroup}>
              <label>Başlık</label>
              <input 
                type="text" 
                value={data.title} 
                onChange={(e) => setData({...data, title: e.target.value})}
                className={styles.titleInput}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Kısa Özet (Excerpt)</label>
              <textarea 
                value={data.excerpt}
                onChange={(e) => setData({...data, excerpt: e.target.value})}
                className={styles.excerptInput}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>İçerik (Markdown/Rich Text)</label>
              <div className={styles.toolbar}>
                 <span><strong>B</strong></span>
                 <span><em>I</em></span>
                 <span><u>U</u></span>
                 <span># H1</span>
                 <Image size={16} />
              </div>
              <textarea 
                value={data.content}
                onChange={(e) => setData({...data, content: e.target.value})}
                className={styles.contentInput}
              />
            </div>
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.card}>
             <div className={styles.sideHeader}><Globe size={16} /> Yayınlama</div>
             <div className={styles.sideOption}>
                <strong>Durum:</strong>
                <span className={styles.badge}>{data.status}</span>
             </div>
             <div className={styles.sideOption}>
                <strong>Görünürlük:</strong>
                <span className={styles.badge}>{data.visibility}</span>
             </div>
          </div>

          <div className={styles.card}>
             <div className={styles.sideHeader}><Layout size={16} /> Kategori & Medya</div>
             <div className={styles.inputGroup}>
                <label>Kategori</label>
                <select value={data.category}>
                   <option value="gercekler-yalanlar">Gerçekler & Yalanlar</option>
                   <option value="markalar">Markalar</option>
                </select>
             </div>
             <div className={styles.imagePreview}>
                <Image size={32} />
                <span>Kapak Resmi Yükle</span>
             </div>
          </div>

          <div className={styles.card}>
             <div className={styles.sideHeader}><Tags size={16} /> Etiketler</div>
             <input type="text" placeholder="Yeni etiket ekle..." />
             <div className={styles.tagCloud}>
                <span className={styles.tag}>Kurumsal</span>
                <span className={styles.tag}>Mizah</span>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
