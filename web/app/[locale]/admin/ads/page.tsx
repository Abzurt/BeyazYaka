import { useState, useEffect } from 'react';
import styles from './ads.module.css';
import { 
  Megaphone, Plus, Power, Trash2, Edit2, BarChart3, 
  ExternalLink, TrendingUp, Target, MousePointer2, 
  PlusCircle, X, Search, Filter, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function AdManagement() {
  const { showToast } = useToast();
  const [activeMetric, setActiveMetric] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    imageUrl: '',
    targetUrl: '',
    slotId: '',
    isActive: true,
    locale: 'tr'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [adsRes, slotsRes] = await Promise.all([
        fetch('/api/admin/ads?type=campaigns'),
        fetch('/api/admin/ads?type=slots')
      ]);
      const adsData = await adsRes.json();
      const slotsData = await slotsRes.json();
      
      if (adsRes.ok) setAds(adsData);
      if (slotsRes.ok) {
        setSlots(slotsData);
        if (slotsData.length > 0 && !formData.slotId) {
          setFormData(prev => ({ ...prev, slotId: slotsData[0].id }));
        }
      }
    } catch (error) {
      showToast('Veriler yüklenirken hata oluştu.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const summaryStats = [
    { id: 'active', label: 'Aktif Kampanyalar', value: ads.filter(a => a.isActive).length.toString(), detail: 'Sitede yayında', icon: Target, color: 'var(--accent)' },
    { id: 'clicks', label: 'Toplam Tıklama', value: '0', detail: 'Yakında', icon: MousePointer2, color: '#3b82f6' },
    { id: 'ctr', label: 'En Yüksek CTR', value: '0%', detail: '-', icon: TrendingUp, color: '#10b981' },
    { id: 'new', label: 'Toplam Kampanya', value: ads.length.toString(), detail: 'Sistemde kayıtlı', icon: PlusCircle, color: '#f59e0b' },
  ];

  const toggleAd = async (ad: any) => {
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad.id, isActive: !ad.isActive }),
      });
      if (res.ok) {
        showToast(`"${ad.title}" ${!ad.isActive ? 'yayına alındı' : 'durduruldu'}.`, 'success');
        fetchData();
      }
    } catch (error) {
      showToast('Durum güncellenemedi.', 'error');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" kampanyasını silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/ads?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`"${title}" kampanyası silindi.`, 'success');
        fetchData();
      }
    } catch (error) {
      showToast('Kampanya silinemedi.', 'error');
    }
  };

  const openAddModal = () => {
    setEditingAd(null);
    setFormData({
      title: '',
      body: '',
      imageUrl: '',
      targetUrl: '',
      slotId: slots[0]?.id || '',
      isActive: true,
      locale: 'tr'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (ad: any) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      body: ad.body || '',
      imageUrl: ad.imageUrl || '',
      targetUrl: ad.targetUrl,
      slotId: ad.slotId,
      isActive: ad.isActive,
      locale: ad.locale || 'tr'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/ads', {
        method: editingAd ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAd ? { id: editingAd.id, ...formData } : formData),
      });
      if (res.ok) {
        showToast(editingAd ? 'Kampanya güncellendi.' : 'Yeni kampanya eklendi.', 'success');
        setIsModalOpen(false);
        fetchData();
      } else {
        const error = await res.json();
        showToast(error.error || 'İşlem başarısız.', 'error');
      }
    } catch (error) {
      showToast('Bir hata oluştu.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Kampanya Yönetimi</h1>
          <p className={styles.subtitle}>Survival Kit ve diğer alanlardaki affiliate ilanlarını yönetin.</p>
        </div>
        <Button icon={Plus} onClick={openAddModal}>Yeni Kampanya</Button>
      </header>

      {/* Stats Grid */}
      <div className={styles.summaryGrid}>
        {summaryStats.map((stat) => (
          <div 
            key={stat.id} 
            className={styles.summaryCard}
          >
            <div className={styles.statIcon} style={{ borderColor: stat.color, backgroundColor: `${stat.color}10` }}>
              <stat.icon size={20} color={stat.color} />
            </div>
            <div className={styles.statData}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statDetail}>{stat.detail}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableFilters}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input type="text" placeholder="Kampanya başlığı veya slot ile ara..." />
          </div>
          <Button variant="outline" size="sm" icon={Filter}>Filtrele</Button>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <Loader2 className="animate-spin" size={32} />
            <p>Yükleniyor...</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Kampanya / URL</th>
                <th>Slot / Kategori</th>
                <th>Durum</th>
                <th>Dil</th>
                <th className={styles.actionCol}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad.id}>
                  <td>
                    <div className={styles.adInfo}>
                      <span className={styles.adTitle}>{ad.title}</span>
                      <span className={styles.adUrl} title={ad.targetUrl}><ExternalLink size={10} /> {ad.targetUrl.slice(0, 30)}...</span>
                    </div>
                  </td>
                  <td><span className={styles.slotBadge}>{ad.slot?.name || 'Genel'}</span></td>
                  <td>
                    <span className={`${styles.statusBadge} ${ad.isActive ? styles.activeStatus : styles.pausedStatus}`}>
                      {ad.isActive ? 'Yayında' : 'Pasif'}
                    </span>
                  </td>
                  <td><span className={styles.localeBadge}>{ad.locale?.toUpperCase()}</span></td>
                  <td className={styles.actionCol}>
                    <div className={styles.actions}>
                      <button className={styles.powerBtn} onClick={() => toggleAd(ad)}>
                        <Power size={18} color={ad.isActive ? 'var(--accent)' : 'var(--text-muted)'} />
                      </button>
                      <Button variant="ghost" size="sm" icon={Edit2} onClick={() => openEditModal(ad)} />
                      <Button variant="ghost" size="sm" icon={Trash2} className={styles.deleteBtn} onClick={() => handleDelete(ad.id, ad.title)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.top10Header}>
              <h2>{editingAd ? 'Kampanyayı Düzenle' : 'Yeni Kampanya Ekle'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form className={styles.formGrid} onSubmit={handleSubmit}>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Kampanya Başlığı</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Örn: Sony Kulaklık Kampanyası" 
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Görsel URL</label>
                <input 
                  type="text" 
                  value={formData.imageUrl} 
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://..." 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Hedef URL (Affiliate)</label>
                <input 
                  type="text" 
                  value={formData.targetUrl} 
                  onChange={(e) => setFormData({...formData, targetUrl: e.target.value})}
                  placeholder="https://..." 
                  required 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Slot / Kategori</label>
                <select 
                  value={formData.slotId} 
                  onChange={(e) => setFormData({...formData, slotId: e.target.value})}
                  required
                >
                  {slots.map(slot => (
                    <option key={slot.id} value={slot.id}>{slot.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Dil</label>
                <select 
                  value={formData.locale} 
                  onChange={(e) => setFormData({...formData, locale: e.target.value})}
                >
                  <option value="tr">Türkçe (TR)</option>
                  <option value="en">English (EN)</option>
                </select>
              </div>
              <div className={`${styles.formGroup} ${styles.full}`}>
                <label>Açıklama / İçerik</label>
                <textarea 
                  value={formData.body} 
                  onChange={(e) => setFormData({...formData, body: e.target.value})}
                  placeholder="Kampanya detaylarını buraya yazın..."
                ></textarea>
              </div>
              <div className={`${styles.modalActions} ${styles.full}`}>
                 <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>İptal</Button>
                 <Button type="submit" disabled={submitting}>
                    {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                 </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
