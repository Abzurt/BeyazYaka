import { HubList } from '@/components/ui/HubList';
import styles from './page.module.css';
import prisma from '@/lib/prisma';

export default async function MarkalarHub() {
  const posts = await prisma.post.findMany({
    where: {
      category: {
        slug: 'beyaz-yaka-markalari'
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

  const formattedBrands = posts.map((post: any) => ({
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
          <h1 className={styles.title}>Beyaz Yaka Markaları</h1>
          <p className={styles.subtitle}>
            Plaza hayatının vazgeçilmezleri ve cebinizi yakan o "ayrıntı"lar.
            Doğruluğu tartışılır, prestiji tartışılmaz markalar burada.
          </p>
        </div>
      </header>

      <div className="container" style={{ paddingBottom: 'var(--space-xxl)' }}>
        <HubList items={formattedBrands} basePath="/markalar" allTags={allTags} />
      </div>
    </div>
  );
}
