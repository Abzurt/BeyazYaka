import styles from './survival.module.css';
import prisma from '@/lib/prisma';
import { getDictionary } from '@/lib/get-dictionary';
import { Locale } from '@/lib/i18n-config';
import { AdsHubClient } from '@/components/ads/AdsHubClient';

export default async function SurvivalKitPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  const campaigns = await prisma.adCampaign.findMany({
    where: {
      isActive: true,
      slot: {
        locationKey: {
          startsWith: 'survival-kit'
        }
      }
    },
    include: {
      slot: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="container" style={{ paddingTop: 'var(--space-xxl)' }}>
      <header style={{ marginBottom: 'var(--space-xxl)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: 'var(--space-xs)' }}>{dict.ads.hubTitle}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          {dict.ads.hubSubtitle}
        </p>
      </header>

      <AdsHubClient campaigns={campaigns} dict={dict} locale={locale} />
    </div>
  );
}
