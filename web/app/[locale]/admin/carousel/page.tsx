'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './carousel.module.css';
import { Plus, Image as ImageIcon, GripVertical, Trash2, Edit2, Play, Pause, ExternalLink, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

const PREDEFINED_LINKS = [
  { label: 'Ana Sayfa', value: '/' },
  { label: 'Markalar Hub', value: '/markalar' },
  { label: 'Ortamlar Hub', value: '/ortamlar' },
  { label: 'Rotalar Hub', value: '/rotalar' },
  { label: 'Survival Kit', value: '/survival-kit' },
  { label: 'Forum', value: '/forum' },
];

import { use } from 'react';

export default function CarouselManagement({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: currentLocale } = use(params);
  const { showToast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    link: '',
    image: '',
    locale: currentLocale || 'tr'
  });

  useEffect(() => {
    fetchItems();
  }, [currentLocale]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/carousel?locale=${currentLocale}`);
      const data = await res.json();
      if (res.ok) setItems(data);
    } catch (error) {
      showToast('Veriler yüklenirken hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (res.ok) {
        setFormData({ ...formData, image: data.url });
        showToast('Görsel yüklendi.', 'success');
      } else {
        showToast(data.error || 'Yükleme başarısız.', 'error');
      }
    } catch (error) {
      showToast('Yükleme sırasında hata oluştu.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ title: '', subtitle: '', link: PREDEFINED_LINKS[0].value, image: '', locale: currentLocale || 'tr' });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({ 
      title: item.title, 
      subtitle: item.subtitle, 
      link: item.link, 
      image: item.image,
      locale: item.locale || currentLocale || 'tr'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      showToast('Lütfen bir görsel yükleyin.', 'error');
      return;
    }

    const method = editingItem ? 'PUT' : 'POST';
    const body = JSON.stringify(editingItem ? { id: editingItem.id, ...formData } : formData);

    try {
      const res = await fetch('/api/admin/carousel', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (res.ok) {
        showToast(editingItem ? 'Güncellendi.' : 'Eklendi.', 'success');
        setIsModalOpen(false);
        fetchItems();
      } else {
        const error = await res.json();
        showToast(error.error || 'İşlem başarısız.', 'error');
      }
    } catch (error) {
      showToast('İşlem sırasında hata oluştu.', 'error');
    }
  };

  const toggleStatus = async (item: any) => {
    const newStatus = item.status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch('/api/admin/carousel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, status: newStatus }),
      });
      if (res.ok) {
        fetchItems();
        showToast(`Durum güncellendi.`, 'success');
      }
    } catch (error) {
      showToast('Durum güncellenemedi.', 'error');
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/carousel?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchItems();
        showToast('Silindi.', 'success');
      }
    } catch (error) {
      showToast('Silinemedi.', 'error');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Manşet Yönetimi (Carousel)</h1>
          <p className={styles.subtitle}>Ana sayfadaki slider alanını buradan yönetebilirsiniz.</p>
        </div>
        <Button icon={Plus} onClick={openAddModal}>Yeni Manşet Ekle</Button>
      </header>

      {loading ? (
        <div className={styles.loadingState}><Loader2 className="animate-spin" /> Veriler yükleniyor...</div>
      ) : (
        <div className={styles.reorderList}>
          {items.map((item) => (
            <div key={item.id} className={`${styles.itemCard} ${styles[item.status]}`}>
              <div className={styles.dragHandle} onClick={() => showToast('Sürükle-Bırak yakında!', 'info')}><GripVertical size={20} /></div>
              
              <div className={styles.previewImage}>
                {item.image ? (
                  <img src={item.image} alt={item.title} className={styles.actualImg} />
                ) : (
                  <div className={styles.imgPlaceholder}><ImageIcon size={24} /></div>
                )}
              </div>

              <div className={styles.itemContent}>
                <div className={styles.topRow}>
                  <div className={styles.titleInfo}>
                    <h3>{item.title}</h3>
                    <span className={styles.localeBadge}>{item.locale?.toUpperCase() || 'TR'}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[item.status]}`} onClick={() => toggleStatus(item)}>
                     {item.status === 'active' ? <Play size={10} /> : <Pause size={10} />}
                     {item.status === 'active' ? 'YAYINDA' : 'DURDURULDU'}
                  </span>
                </div>
                <p>{item.subtitle}</p>
                <div className={styles.linkInfo}>
                  <ExternalLink size={12} /> <span>{item.link || '/'}</span>
                </div>
              </div>

              <div className={styles.actions}>
                <Button variant="ghost" size="sm" icon={Edit2} onClick={() => openEditModal(item)}>Düzenle</Button>
                <Button variant="ghost" size="sm" icon={Trash2} className={styles.deleteBtn} onClick={() => deleteItem(item.id)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>{editingItem ? 'Manşeti Düzenle' : 'Yeni Manşet Ekle'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Başlık</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label>Alt Başlık</label>
                <input 
                  type="text" 
                  value={formData.subtitle} 
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  required
                />
              </div>
              
              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label>Görsel Yükle</label>
                <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
                  {uploading ? (
                    <div className={styles.uploadHint}><Loader2 className="animate-spin" /> Yükleniyor...</div>
                  ) : formData.image ? (
                    <img src={formData.image} alt="Preview" className={styles.uploadPreview} />
                  ) : (
                    <div className={styles.uploadHint}><Upload size={24} /> Tıkla ve Görsel Seç</div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label>Dil</label>
                <select 
                  className={styles.selectInput}
                  value={formData.locale}
                  onChange={(e) => setFormData({...formData, locale: e.target.value})}
                  required
                >
                  <option value="tr">Türkçe (TR)</option>
                  <option value="en">English (EN)</option>
                </select>
              </div>

              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label>Bağlantı Sayfası</label>
                <select 
                  className={styles.selectInput}
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  required
                >
                  {PREDEFINED_LINKS.map((link) => (
                    <option key={link.value} value={link.value}>{link.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.modalActions}>
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>İptal</Button>
                <Button type="submit" disabled={uploading}>
                  {editingItem ? 'Güncelle' : 'Ekle'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
