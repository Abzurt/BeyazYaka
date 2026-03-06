import styles from './post.module.css';
import { CommentSection } from '@/components/ui/CommentSection';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Star, MessageSquare, Share2 } from 'lucide-react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { type Locale } from '@/lib/i18n-config';
import { getDictionary } from '@/lib/get-dictionary';

import { StatusWarning } from '@/components/ui/StatusWarning';
import { auth } from '@/lib/auth';

export default async function PostPage({ params }: { params: Promise<{ slug: string; locale: Locale }> }) {
  const { slug, locale } = await params;
  const dict = await getDictionary(locale);
  const session = await auth();
  const isAdmin = session?.user?.role === 'admin';

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { username: true, displayName: true, image: true } },
      category: true,
    },
  });

  if (!post) return notFound();

  // Security: Only admins can see non-published posts
  if (post.status !== 'published' && !isAdmin) {
    return notFound();
  }

  // Fetch real stats in parallel
  const [ratingAgg, realCommentCount] = await Promise.all([
    prisma.postRating.aggregate({
      where: { postId: post.id },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.comment.count({ where: { postId: post.id, isDeleted: false } }),
  ]);

  const avgRating = ratingAgg._avg.rating ? ratingAgg._avg.rating.toFixed(1) : null;
  const voteCount = ratingAgg._count.rating;

  const authorInitials = (post.isAnonymous
    ? 'AN'
    : (post.author?.displayName || post.author?.username || '?')
        .split(' ')
        .map((w: string) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2));

  const authorLabel = post.isAnonymous
    ? (locale === 'tr' ? 'Anonim' : 'Anonymous')
    : (post.author?.displayName || post.author?.username || '?');

  const timeAgo = (() => {
    const diffH = Math.floor((Date.now() - new Date(post.createdAt).getTime()) / 3600000);
    if (diffH < 24) return locale === 'tr' ? `${diffH} saat önce` : `${diffH} hours ago`;
    if (diffH < 48) return locale === 'tr' ? 'Dün' : 'Yesterday';
    return new Date(post.createdAt).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  })();

  return (
    <div className="container" style={{ paddingTop: 'var(--space-xxl)' }}>
      <StatusWarning status={post.status} locale={locale} />
      <div className={styles.postHeader}>
        {post.category && (
          <Link href={`/${locale}/forum/${post.category.slug}`} className={styles.badge} style={{ textDecoration: 'none', cursor: 'pointer' }}>
            {post.category.name}
          </Link>
        )}
        <h1 className={styles.title}>{post.title}</h1>

        {/* Stats row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: avgRating ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>
            <Star size={16} fill={avgRating ? 'var(--accent)' : 'transparent'} stroke={avgRating ? 'var(--accent)' : 'var(--text-muted)'} />
            {avgRating ? (
              <span>
                {avgRating}
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '13px', marginLeft: '4px' }}>({voteCount} {locale === 'tr' ? 'oy' : 'votes'})</span>
              </span>
            ) : (
              <span style={{ fontWeight: 400, fontSize: '13px' }}>{locale === 'tr' ? 'Henüz oy yok' : 'No votes yet'}</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
            <MessageSquare size={16} />
            <span style={{ fontSize: '14px' }}>{realCommentCount} {locale === 'tr' ? 'yorum' : 'comments'}</span>
          </div>
        </div>

        <div className={styles.authorBar}>
          <div className={styles.authorInfo}>
            <div className={styles.avatar}>{authorInitials}</div>
            <div>
              <div className={styles.authorName}>{authorLabel}</div>
              <div className={styles.meta}>{post.category?.name} • {timeAgo}</div>
            </div>
          </div>
          <div className={styles.actions}>
            <Button variant="outline" size="sm" icon={Share2}>
              {locale === 'tr' ? 'Paylaş' : 'Share'}
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.mainLayout}>
        <article className={styles.content}>
          {post.excerpt && <p style={{ color: 'var(--text-secondary)', fontSize: '20px', borderLeft: '3px solid var(--accent)', paddingLeft: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>{post.excerpt}</p>}
          {post.content.split('\n').map((line: string, i: number) => {
            if (line.trim().startsWith('### ')) return <h3 key={i}>{line.replace('### ', '').trim()}</h3>;
            if (line.trim().startsWith('## ')) return <h2 key={i}>{line.replace('## ', '').trim()}</h2>;
            if (line.trim().startsWith('- ')) return <li key={i}>{line.replace('- ', '').trim()}</li>;
            if (!line.trim()) return <br key={i} />;
            return <p key={i}>{line}</p>;
          })}
        </article>

        <CommentSection targetId={post.id} targetType="post" dict={dict.comments} />
      </div>
    </div>
  );
}
