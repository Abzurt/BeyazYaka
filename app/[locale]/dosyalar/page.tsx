import prisma from '@/lib/prisma';
import { getDictionary } from '@/lib/get-dictionary';
import { Locale } from '@/lib/i18n-config';
import { HubList } from '@/components/ui/HubList';
import styles from '../forum/forum.module.css';

export default async function DosyalarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  const carouselItems = await prisma.carouselItem.findMany({
    where: {
      status: 'active',
      locale: locale,
    },
    orderBy: {
      order: 'asc',
    },
  });

  // Map carousel items to HubItem format
  const hubItems = carouselItems.map((item: any) => {
    let slug = item.link;
    if (slug.startsWith('/')) {
      slug = slug.substring(1);
    }
    return {
      id: item.id,
      title: item.title,
      description: item.subtitle,
      image: item.image,
      tags: ['Dosya'],
      slug: slug,
    };
  });

  return (
    <div className="container" style={{ paddingTop: 'var(--space-xxl)' }}>
      <header className={styles.header}>
        <h1 className={styles.title}>{dict.dosyalar.title}</h1>
        <p className={styles.subtitle}>{dict.dosyalar.subtitle}</p>
      </header>

      <HubList 
        items={hubItems} 
        basePath="" 
        allTags={['Dosya']} 
      />
    </div>
  );
}
