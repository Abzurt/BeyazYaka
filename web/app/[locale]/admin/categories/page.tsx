'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminPagination } from '@/components/ui/AdminPagination';
import styles from './categories.module.css';
import { Plus, Edit2, Trash2, Eye, LayoutTemplate, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function CategoryManagement() {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });
  const PAGE_SIZE = 15;

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories?page=${page}&pageSize=${PAGE_SIZE}`);
      if (res.ok) {
        const { data, total: t } = await res.json();
        setCategories(data || []);
        setTotal(t || 0);
      }
    } catch {
      showToast('Kategoriler yüklenemedi.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
        setTotal(t => t - 1);
        showToast(`"${name}" kategorisi silindi.`, 'success');
      }
    } catch {
      showToast('Silme başarısız.', 'error');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, ''),
          description: formData.description,
        }),
      });
      if (res.ok) {
        showToast(`"${formData.name}" kategorisi oluşturuldu.`, 'success');
        setIsModalOpen(false);
        setFormData({ name: '', slug: '', description: '' });
        fetchCategories();
      } else {
        const err = await res.json();
        showToast(err.error || 'Oluşturulamadı.', 'error');
      }
    } catch {
      showToast('Bir hata oluştu.', 'error');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Kategori Yönetimi</h1>
          <p className={styles.subtitle}>Forum ve içerik hiyerarşisini buradan düzenleyebilirsiniz. Toplam <strong>{total}</strong> kategori.</p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>Yeni Kategori Ekle</Button>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className={styles.categoryGrid}>
          {categories.map((cat) => (
            <div key={cat.id} className={styles.categoryCard}>
              <div className={styles.cardHeader}>
                <LayoutTemplate size={24} className={styles.icon} />
                <div className={styles.actions}>
                  <button title="Düzenle" onClick={() => showToast('Kategori düzenleme yakında!', 'info')}><Edit2 size={14} /></button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3>{cat.name}</h3>
                <p>/{cat.slug}</p>
                <div className={styles.stats}>
                  <strong>{cat._count?.posts ?? 0}</strong> konu
                </div>
              </div>

              <div className={styles.cardFooter}>
                <span className={`${styles.statusBadge} ${styles.active}`}>AKTİF</span>
                <button className={styles.deleteBtn} onClick={() => deleteCategory(cat.id, cat.name)}><Trash2 size={14} /></button>
              </div>
            </div>
          ))}

          <div className={styles.addPlaceholder} onClick={() => setIsModalOpen(true)}>
            <Plus size={32} />
            <span>Yeni Kategori Ekle</span>
          </div>
        </div>
      )}

      <AdminPagination
        page={page}
        totalPages={Math.ceil(total / PAGE_SIZE)}
        onPageChange={setPage}
        totalItems={total}
        pageSize={PAGE_SIZE}
      />

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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Kariyer Tavsiyeleri"
                  required
                />
              </div>
              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label>Kısa URL (Slug)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Örn: kariyer-tavsiyeleri"
                />
              </div>
              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label>Açıklama (opsiyonel)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Kategori hakkında kısa açıklama"
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
