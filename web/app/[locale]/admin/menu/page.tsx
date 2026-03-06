'use client';

import { useState, useEffect } from 'react';
import { AdminPagination } from '@/components/ui/AdminPagination';

import { usePathname } from 'next/navigation';
import styles from '../categories/categories.module.css'; // Reusing similar grid styles
import { Plus, Edit2, Trash2, Move, Eye, EyeOff, FolderTree } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface MenuItem {
  id: string;
  title: string;
  url: string;
  order: number;
  isActive: boolean;
  locale: string;
}

export default function MenuManagement() {
  const { showToast } = useToast();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || 'tr';
  const [menuPage, setMenuPage] = useState(1);
  const MENU_PAGE_SIZE = 15;
  const [items, setItems] = useState<MenuItem[]>([]);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: '', title: '', url: '', order: 0 });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [currentLocale, page]);

  const fetchItems = async () => {
    try {
      const res = await fetch(`/api/admin/menu?locale=${currentLocale}&page=${page}&pageSize=15`);
      if (res.ok) {
        const { data, total } = await res.json();
        setItems(data || []);
        setItemsTotal(total || 0);
      }
    } catch {
      showToast('Menü öğeleri yüklenemedi', 'error');
    }
  };

  const toggleVisibility = async (item: MenuItem) => {
    try {
      const updated = { ...item, isActive: !item.isActive };
      const res = await fetch(`/api/admin/menu/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setItems(items.map(i => i.id === item.id ? updated : i));
        showToast(`"${item.title}" ${updated.isActive ? 'görünür' : 'gizli'} yapıldı.`, 'success');
      }
    } catch {
      showToast('İşlem başarısız', 'error');
    }
  };

  const deleteItem = async (id: string, title: string) => {
    if (!window.confirm(`"${title}" öğesini silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/menu/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(items.filter(i => i.id !== id));
        showToast(`"${title}" başarıyla silindi.`, 'success');
      }
    } catch {
      showToast('Silme başarısız', 'error');
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ id: '', title: '', url: '', order: items.length });
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setIsEditing(true);
    setFormData({ id: item.id, title: item.title, url: item.url, order: item.order });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, locale: currentLocale, isActive: true };
      
      let res;
      if (isEditing) {
        res = await fetch(`/api/admin/menu/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/admin/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        showToast(`Menü öğesi ${isEditing ? 'güncellendi' : 'oluşturuldu'}.`, 'success');
        setIsModalOpen(false);
        fetchItems();
      } else {
        showToast('Bir hata oluştu', 'error');
      }
    } catch {
      showToast('İşlem başarısız', 'error');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Menü Yönetimi ({currentLocale.toUpperCase()})</h1>
          <p className={styles.subtitle}>Ana sayfa üst barındaki ve diğer ortak alanlardaki menü linklerini düzenleyebilirsiniz.</p>
        </div>
        <Button icon={Plus} onClick={openAddModal}>Yeni Link Ekle</Button>
      </header>

      <div className={styles.categoryGrid}>
        {items.map((item) => (
          <div key={item.id} className={`${styles.categoryCard} ${item.isActive ? '' : styles.hidden}`}>
            <div className={styles.cardHeader}>
              <FolderTree size={24} className={styles.icon} />
              <div className={styles.actions}>
                <button title="Düzenle" onClick={() => openEditModal(item)}><Edit2 size={14} /></button>
                <button title="Gizle/Göster" onClick={() => toggleVisibility(item)}>
                   {item.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            </div>
            
            <div className={styles.cardBody}>
              <h3 style={{ textTransform: 'capitalize' }}>{item.title}</h3>
              <p>{item.url}</p>
              <div className={styles.stats}>
                Sıra: <strong>{item.order}</strong>
              </div>
            </div>

            <div className={styles.cardFooter}>
              <span className={`${styles.statusBadge} ${item.isActive ? styles.active : styles.hidden}`}>
                {item.isActive ? 'AKTİF' : 'GİZLİ'}
              </span>
              <button className={styles.deleteBtn} onClick={() => deleteItem(item.id, item.title)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}

        <div className={styles.addPlaceholder} onClick={openAddModal}>
          <Plus size={32} />
          <span>Yeni Link Ekle</span>
        </div>

        <AdminPagination
          page={page}
          totalPages={Math.ceil(itemsTotal / 15)}
          onPageChange={setPage}
          totalItems={itemsTotal}
          pageSize={15}
        />
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>{isEditing ? 'Link Düzenle' : 'Yeni Link Oluştur'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Link Adı (Örn: Forum)</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label>Hedef URL (Örn: /forum)</label>
                <input 
                  type="text" 
                  value={formData.url} 
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                <label>Sıralama (Küçük sayı önce çıkar)</label>
                <input 
                  type="number" 
                  value={formData.order} 
                  onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>İptal</Button>
                <Button type="submit">{isEditing ? 'Güncelle' : 'Oluştur'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
