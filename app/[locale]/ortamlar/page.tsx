import { HubList } from '@/components/ui/HubList';
import styles from './page.module.css';
import prisma from '@/lib/prisma';

export default async function OrtamlarHub() {
  const posts = await prisma.post.findMany({
    where: {
      category: {
        slug: 'beyaz-yaka-ortamlari'
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
          <h1 className={styles.title}>Beyaz Yaka Ortamları</h1>
          <p className={styles.subtitle}>
            Plaza hayatının geçtiği o meşhur ortamlar. Toplantı salonlarından dynamic workspace'lere kadar her yer burada.
          </p>
        </div>
      </header>

      <div className="container" style={{ paddingBottom: 'var(--space-xxl)' }}>
        <HubList items={formattedItems} basePath="/ortamlar" allTags={allTags} />
      </div>
    </div>
  );
}
