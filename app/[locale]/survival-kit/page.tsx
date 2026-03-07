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
      locale: locale,
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

  const campaignIds = campaigns.map((c: any) => c.id);

  const [ratingAggs, commentCounts] = await Promise.all([
    prisma.postRating.groupBy({
      by: ['campaignId'],
      where: { campaignId: { in: campaignIds } },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.comment.groupBy({
      by: ['campaignId'],
      where: { campaignId: { in: campaignIds }, isDeleted: false },
      _count: { id: true },
    }),
  ]);

  const ratingMap = Object.fromEntries(
    ratingAggs.map((r: any) => [r.campaignId, { avg: r._avg.rating, count: r._count.rating }])
  );
  const commentMap = Object.fromEntries(
    commentCounts.map((c: any) => [c.campaignId, c._count.id])
  );

  const enrichedCampaigns = campaigns.map((c: any) => ({
    ...c,
    avgRating: ratingMap[c.id]?.avg ? Number(ratingMap[c.id].avg!.toFixed(1)) : null,
    voteCount: ratingMap[c.id]?.count ?? 0,
    realCommentCount: commentMap[c.id] ?? 0,
  }));

  return (
    <div className="container" style={{ paddingTop: 'var(--space-xxl)' }}>
      <header style={{ marginBottom: 'var(--space-xxl)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: 'var(--space-xs)' }}>{dict.ads.hubTitle}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          {dict.ads.hubSubtitle}
        </p>
      </header>

      <AdsHubClient campaigns={enrichedCampaigns} dict={dict} locale={locale} />
    </div>
  );
}
