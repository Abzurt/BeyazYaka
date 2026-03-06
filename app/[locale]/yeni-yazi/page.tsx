import styles from './yeni-yazi.module.css';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FileText, Type, List, Eye, Send, ShieldAlert } from 'lucide-react';

export default function YeniYaziPage() {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-xxl)' }}>
      <header className={styles.header}>
        <h1 className={styles.title}>Yeni İçerik Paylaş</h1>
        <p className={styles.subtitle}>Deneyimlerini, plaza hikayelerini veya önerilerini toplulukla paylaş.</p>
      </header>

      <div className={styles.layout}>
        <div className={styles.formArea}>
          <Card className={styles.formCard}>
            <form className={styles.form}>
              <div className={styles.inputGroup}>
                <label><Type size={16} /> Başlık</label>
                <input type="text" placeholder="Yazına etkileyici bir başlık ver..." className={styles.input} />
              </div>

              <div className={styles.grid}>
                <div className={styles.inputGroup}>
                  <label><List size={16} /> Kategori</label>
                  <select className={styles.input}>
                    <option value="">Seçiniz...</option>
                    <option value="beyaz-yaka-markalari">Beyaz Yaka Markaları</option>
                    <option value="gercekler-ve-yalanlar">Gerçekler & Yalanlar</option>
                    <option value="plaza-hikayeleri">Plaza Hikayeleri</option>
                  </select>
                </div>
                
                <div className={styles.inputGroup}>
                  <label><Eye size={16} /> Görünürlük</label>
                  <select className={styles.input}>
                    <option value="members_only">Sadece Üyeler</option>
                    <option value="public">Herkes (Public)</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label><FileText size={16} /> İçerik</label>
                <textarea 
                  placeholder="İçeriğini buraya yaz... (Markdown desteklenir)" 
                  className={styles.textarea} 
                  rows={12}
                />
              </div>

              <div className={styles.options}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" />
                  <span>Anonim olarak paylaş</span>
                </label>
                <div className={styles.info}>
                  <ShieldAlert size={14} />
                  <span>İsminiz gizli tutulacaktır.</span>
                </div>
              </div>

              <div className={styles.actions}>
                <Button variant="outline" size="lg">Taslak Olarak Kaydet</Button>
                <Button size="lg" icon={Send}>Hemen Yayınla</Button>
              </div>
            </form>
          </Card>
        </div>

        <aside className={styles.sidebar}>
          <Card title="Yazım Kuralları" className={styles.sideCard}>
            <ul className={styles.rules}>
              <li>Nezaket kurallarına uyun.</li>
              <li>Şirket/Kişi isimlerini direkt vermekten kaçının (X Şirketi kullanın).</li>
              <li>Okunabilirliği artırmak için başlıklar kullanın.</li>
              <li>Görsel eklemek yazı etkileşimini %40 artırır.</li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
