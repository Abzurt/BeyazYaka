'use client';

import { useState } from 'react';
import styles from './categories.module.css';
import { Plus, Edit2, Trash2, Move, Eye, EyeOff, LayoutTemplate } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function CategoryManagement() {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([
    { id: '1', name: 'Gerçekler & Yalanlar', slug: 'gercekler-yalanlar', status: 'active', posts: 145 },
    { id: '2', name: 'Plaza Mutfağı', slug: 'plaza-mutfagi', status: 'active', posts: 82 },
    { id: '3', name: 'Survival Kit', slug: 'survival-kit', status: 'active', posts: 34 },
    { id: '4', name: 'Gizli Dosyalar', slug: 'gizli-dosyalar', status: 'hidden', posts: 12 },
  ]);

  const [formData, setFormData] = useState({ name: '', slug: '' });

  const toggleVisibility = (id: string) => {
    setCategories(categories.map(cat => {
      if (cat.id === id) {
        const newStatus = cat.status === 'active' ? 'hidden' : 'active';
        showToast(`"${cat.name}" kategorisi ${newStatus === 'active' ? 'görünür' : 'gizli'} yapıldı.`, 'success');
        return { ...cat, status: newStatus };
      }
      return cat;
    }));
  };

  const deleteCategory = (id: string, name: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
    showToast(`"${name}" kategorisi silindi.`, 'success');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCat = {
      id: Date.now().toString(),
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-'),
      status: 'active' as const,
      posts: 0
    };
    setCategories([...categories, newCat]);
    showToast(`"${formData.name}" kategorisi başarıyla oluşturuldu.`, 'success');
    setIsModalOpen(false);
    setFormData({ name: '', slug: '' });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Kategori Yönetimi</h1>
          <p className={styles.subtitle}>Forum ve içerik hiyerarşisini buradan düzenleyebilirsiniz.</p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>Yeni Kategori Ekle</Button>
      </header>

      <div className={styles.categoryGrid}>
        {categories.map((cat) => (
          <div key={cat.id} className={`${styles.categoryCard} ${styles[cat.status]}`}>
            <div className={styles.cardHeader}>
              <LayoutTemplate size={24} className={styles.icon} />
              <div className={styles.actions}>
                <button title="Sırala" onClick={() => showToast('Sıralama özelliği yakında!', 'info')}><Move size={14} /></button>
                <button title="Düzenle" onClick={() => showToast('Kategori detayları açılıyor...', 'info')}><Edit2 size={14} /></button>
                <button title="Gizle/Göster" onClick={() => toggleVisibility(cat.id)}>
                   {cat.status === 'active' ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            </div>
            
            <div className={styles.cardBody}>
              <h3>{cat.name}</h3>
              <p>/{cat.slug}</p>
              <div className={styles.stats}>
                <strong>{cat.posts}</strong> konu
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span className={`${styles.statusBadge} ${styles[cat.status]}`}>
                {cat.status === 'active' ? 'AKTİF' : 'GİZLİ'}
              </span>
              <button className={styles.deleteBtn} onClick={() => deleteCategory(cat.id, cat.name)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}

        <div className={styles.addPlaceholder} onClick={() => setIsModalOpen(true)}>
          <Plus size={32} />
          <span>Yeni Kategori Ekle</span>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Yeni Kategori Oluştur</h2>
            <form onSubmit={handleAddSubmit}>
              <div className={styles.formGroup}>
                <label>Kategori Adı</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Örn: Kariyer Tavsiyeleri"
                  required
                />
              </div>
              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label>Kısa URL (Slug)</label>
                <input 
                  type="text" 
                  value={formData.slug} 
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  placeholder="Örn: kariyer-tavsiyeleri"
                />
              </div>
              <div className={styles.modalActions}>
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>İptal</Button>
                <Button type="submit">Oluştur</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
