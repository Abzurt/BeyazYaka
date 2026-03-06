import { HubList } from '@/components/ui/HubList';
import styles from './page.module.css';
import prisma from '@/lib/prisma';

export default async function RotalarHub() {
  const posts = await prisma.post.findMany({
    where: {
      category: {
        slug: 'cuma-kacis-rotalari'
      },
      status: 'published'
    },
    include: {
      tags: {
        include: {
          tag: true
        }
      }
    }
  });

  const allTagsData = await prisma.tag.findMany();
  const allTags = allTagsData.map((t: any) => t.name);

  const formattedItems = posts.map((post: any) => ({
    id: post.id,
    title: post.title,
    description: post.excerpt || '',
    image: post.coverImageUrl || '/images/hero/brands.png',
    tags: post.tags.map((pt: any) => pt.tag.name),
    slug: post.slug
  }));

  return (
    <div className={styles.wrapper}>
      <header className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Cuma Kaçış Rotaları</h1>
          <p className={styles.subtitle}>
            Mesai biter bitmez kaçılacak en iyi rotalar. Hafta sonunu kurtaran lokasyon önerileri.
          </p>
        </div>
      </header>

      <div className="container" style={{ paddingBottom: 'var(--space-xxl)' }}>
        <HubList items={formattedItems} basePath="/rotalar" allTags={allTags} />
      </div>
    </div>
  );
}
