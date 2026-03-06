'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './users.module.css';
import { Search, UserPlus, Filter, MoreVertical, Shield, Ban, CheckCircle, RotateCcw, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
}

export default function UsersManagement() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'member'
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${page}&search=${search}`);
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch (error) {
      showToast('Kullanıcılar yüklenemedi.', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user: User) => {
    try {
      const newBannedStatus = !user.isBanned;
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: newBannedStatus }),
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === user.id ? { ...u, isBanned: newBannedStatus } : u));
        showToast(`${user.username} adlı kullanıcı ${newBannedStatus ? 'yasaklandı' : 'yasağı kaldırıldı'}.`, newBannedStatus ? 'info' : 'success');
      } else {
        throw new Error();
      }
    } catch (error) {
      showToast('İşlem başarısız oldu.', 'error');
    }
  };

  const handleChangeRole = async (id: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
        showToast(`Kullanıcı rolü ${newRole} olarak güncellendi.`, 'success');
      } else {
        throw new Error();
      }
    } catch (error) {
      showToast('Rol güncellenemedi.', 'error');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast('Yeni kullanıcı başarıyla oluşturuldu.', 'success');
        setIsModalOpen(false);
        setFormData({ username: '', email: '', password: '', role: 'member' });
        fetchUsers();
      } else {
        const data = await res.json();
        showToast(data.error || 'Kullanıcı oluşturulamadı.', 'error');
      }
    } catch (error) {
      showToast('Bir hata oluştu.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Üye Yönetimi</h1>
          <p className={styles.subtitle}>Toplam {total} kayıtlı kullanıcı bulunmaktadır.</p>
        </div>
        <Button icon={UserPlus} onClick={() => setIsModalOpen(true)}>Yeni Üye Ekle</Button>
      </header>

      <div className={styles.tableCard}>
        <div className={styles.tableFilters}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Kullanıcı adı veya e-posta ile ara..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <div className={styles.filterActions}>
            <Button variant="outline" size="sm" icon={Filter}>Filtrele</Button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <Loader2 className={styles.spinner} size={40} />
            <p>Kullanıcılar yükleniyor...</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Kullanıcı</th>
                <th>Rol</th>
                <th>Durum</th>
                <th>Katılım Tarihi</th>
                <th className={styles.actionCol}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>{user.username.slice(0, 2).toUpperCase()}</div>
                      <div className={styles.userMeta}>
                        <strong>{user.username}</strong>
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select 
                      className={`${styles.roleSelect} ${styles[user.role]}`}
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                    >
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                      <option value="member">Member</option>
                    </select>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${user.isBanned ? styles.banned : styles.active}`}>
                      {!user.isBanned ? <CheckCircle size={12} /> : <Ban size={12} />}
                      {!user.isBanned ? 'Aktif' : 'Yasaklı'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td className={styles.actionCol}>
                    <div className={styles.actions}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={!user.isBanned ? Ban : RotateCcw}
                        className={!user.isBanned ? styles.rejectBtn : styles.approveBtn}
                        onClick={() => handleToggleStatus(user)}
                      >
                        {!user.isBanned ? 'Yasakla' : 'Kaldır'}
                      </Button>
                      <button className={styles.moreBtn} onClick={() => showToast('Detay görüntüleme yakında!', 'info')}><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className={styles.pagination}>
          <span>{total} sonuçtan {(page - 1) * 10 + 1}-{Math.min(page * 10, total)} arası gösteriliyor</span>
          <div className={styles.pageButtons}>
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Önceki</Button>
            <Button variant="outline" size="sm" disabled={page * 10 >= total} onClick={() => setPage(p => p + 1)}>Sonraki</Button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Yeni Üye Ekle</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateUser} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Kullanıcı Adı</label>
                <input 
                  type="text" 
                  required 
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>E-posta</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Şifre</label>
                <input 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Rol</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="member">Üye</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>İptal</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Oluşturuluyor...' : 'Kullanıcıyı Oluştur'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
