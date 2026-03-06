'use client';

import styles from './login.module.css';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useState, use } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDictionary } from '@/lib/get-dictionary';
import { Locale } from '@/lib/i18n-config';

export default function LoginPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const registered = searchParams.get('registered');

  const [dict, setDict] = useState<any>(null);

  useState(() => {
    getDictionary(locale).then(setDict);
  });

  if (!dict) return null;

  const t = dict.auth.login;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error === "CredentialsSignin" ? t.errorCredentials : (res.error || t.errorDefault));
      } else {
        router.push(`/${locale}/forum`);
        router.refresh();
      }
    } catch (err) {
      setError(t.errorDefault);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>
        </div>

        {registered && <div className={styles.success}>{t.success}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label><Mail size={16} /> {t.email}</label>
            <input name="email" type="email" placeholder="isim@sirket.com" className={styles.input} required />
          </div>

          <div className={styles.inputGroup}>
            <label><Lock size={16} /> {t.password}</label>
            <input name="password" type="password" placeholder="••••••••" className={styles.input} required />
          </div>

          <Button fullWidth size="lg" disabled={loading}>
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
          <a href={`/${locale}/register`} className={styles.link}>
            {t.registerLink} <ArrowRight size={14} />
          </a>
        </div>
      </Card>
      <div className={styles.glow}></div>
    </div>
  );
}
