import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface StatusWarningProps {
  status: string;
  locale: string;
}

export function StatusWarning({ status, locale }: StatusWarningProps) {
  const isRejected = status === 'rejected';
  const isPending = status === 'pending';
  const isDraft = status === 'draft';

  if (status === 'published') return null;

  const labels: Record<string, Record<string, { title: string; desc: string }>> = {
    tr: {
      rejected: { title: 'DÜZENLEME GEREKLİ / REDDEDİLDİ', desc: 'Bu içerik şu anda yayında değil ve normal kullanıcılar tarafından görüntülenemez.' },
      pending: { title: 'ONAY BEKLİYOR', desc: 'Bu içerik henüz incelenme aşamasındadır.' },
      draft: { title: 'TASLAK', desc: 'Bu içerik henüz tamamlanmamış bir taslaktır.' },
    },
    en: {
      rejected: { title: 'REVISION REQUIRED / REJECTED', desc: 'This content is not currently live and cannot be viewed by regular users.' },
      pending: { title: 'PENDING APPROVAL', desc: 'This content is still under review.' },
      draft: { title: 'DRAFT', desc: 'This content is currently an incomplete draft.' },
    }
  };

  const l = labels[locale] || labels.en;
  const current = l[status as keyof typeof l] || { title: status.toUpperCase(), desc: '' };

  return (
    <div style={{
      backgroundColor: isRejected ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
      border: `1px solid ${isRejected ? '#ef4444' : '#f59e0b'}`,
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-lg)',
      marginBottom: 'var(--space-xl)',
      display: 'flex',
      gap: 'var(--space-md)',
      alignItems: 'flex-start',
      color: isRejected ? '#ef4444' : '#f59e0b'
    }}>
      <div style={{ 
        backgroundColor: isRejected ? '#ef4444' : '#f59e0b', 
        borderRadius: '50%', 
        padding: '6px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <AlertTriangle size={20} />
      </div>
      <div>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, letterSpacing: '0.05em' }}>{current.title}</h4>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.9 }}>{current.desc}</p>
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, opacity: 0.7 }}>
          <ShieldCheck size={12} />
          <span>SADECE YÖNETİCİLER BU SAYFAYI GÖREBİLİR</span>
        </div>
      </div>
    </div>
  );
}
