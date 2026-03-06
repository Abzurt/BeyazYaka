'use client';

import { signIn } from 'next-auth/react';

import styles from './register.module.css';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { User, Mail, Lock, Building, MapPin, Briefcase } from 'lucide-react';
import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getDictionary } from '@/lib/get-dictionary';
import { Locale } from '@/lib/i18n-config';

export default function RegisterPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [dict, setDict] = useState<any>(null);

  useState(() => {
    getDictionary(locale).then(setDict);
  });

  if (!dict) return null;

  const t = dict.auth.register;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Registration failed');
      }

      router.push(`/${locale}/login?registered=true`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.registerCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <div className={styles.inputGroup}>
              <label><User size={16} /> {t.username}</label>
              <input name="username" type="text" placeholder="plaza_insani" className={styles.input} required />
            </div>

            <div className={styles.inputGroup}>
              <label><Mail size={16} /> {t.email}</label>
              <input name="email" type="email" placeholder="isim@sirket.com" className={styles.input} required />
            </div>

            <div className={styles.inputGroup}>
              <label><Lock size={16} /> {t.password}</label>
              <input name="password" type="password" placeholder="••••••••" className={styles.input} required />
              <span className={styles.hint}>{t.passwordHint}</span>
            </div>

            <div className={styles.inputGroup}>
              <label><Briefcase size={16} /> {t.sector}</label>
              <input name="sector" type="text" placeholder={t.sectorPlaceholder} className={styles.input} />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.inputGroup}>
              <label><MapPin size={16} /> {t.city}</label>
              <input name="city" type="text" placeholder={t.cityPlaceholder} className={styles.input} />
            </div>

            <div className={styles.inputGroup}>
              <label><Building size={16} /> {t.workModel}</label>
              <select name="workModel" className={styles.input}>
                <option value="office">Office</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>

          <Button fullWidth size="lg" type="submit" disabled={loading}>
            {loading ? t.submitting : t.submit}
          </Button>

          <div className={styles.divider}>
            <span>{t.or}</span>
          </div>

          <Button 
            fullWidth 
            variant="outline" 
            size="lg" 
            type="button"
            onClick={() => signIn('google', { callbackUrl: `/${locale}/forum` })}
            className={styles.googleBtn}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" width={16} height={16} />
            {t.google}
          </Button>
        </form>

        <div className={styles.footer}>
          <span>{t.footer}</span>
          <a href={`/${locale}/login`} className={styles.link}>{t.loginLink} &rarr;</a>
        </div>
      </Card>
      <div className={styles.glow}></div>
    </div>
  );
}
