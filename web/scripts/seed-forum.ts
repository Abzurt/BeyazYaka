import { PrismaClient, ContentArea, VisibilityType, ContentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const authorId = 'd395f83e-f2e0-493a-95f8-b599b08cba9f'; // existing user ID from previous seed

  const categories = [
    {
      tr: { name: 'Gerçekler & Yalanlar', slug: 'gercekler-ve-yalanlar', description: 'Kurumsal hayatın filtresiz hali.' },
      en: { name: 'Realities & Lies', slug: 'realities-and-lies', description: 'Unfiltered version of corporate life.' }
    },
    {
      tr: { name: 'Maaş & Yan Haklar', slug: 'maas-ve-yan-haklar', description: 'Kim ne kadar alıyor? Şeffaf maaş tartışmaları.' },
      en: { name: 'Salary & Benefits', slug: 'salary-and-benefits', description: 'Who gets how much? Transparent salary discussions.' }
    },
    {
      tr: { name: 'Ofis Dedikoduları', slug: 'ofis-dedikodulari', description: 'Kahve makinesi başındaki fısıldaşmalar.' },
      en: { name: 'Office Gossip', slug: 'office-gossip', description: 'Whispers by the coffee machine.' }
    }
  ];

  for (const catPair of categories) {
    // Seed TR category
    const trCat = await prisma.category.upsert({
      where: { slug: catPair.tr.slug },
      update: { locale: 'tr', area: ContentArea.forum },
      create: {
        name: catPair.tr.name,
        slug: catPair.tr.slug,
        description: catPair.tr.description,
        area: ContentArea.forum,
        locale: 'tr',
        defaultVisibility: VisibilityType.public
      }
    });

    // Seed EN category
    const enCat = await prisma.category.upsert({
      where: { slug: catPair.en.slug },
      update: { locale: 'en', area: ContentArea.forum },
      create: {
        name: catPair.en.name,
        slug: catPair.en.slug,
        description: catPair.en.description,
        area: ContentArea.forum,
        locale: 'en',
        defaultVisibility: VisibilityType.public
      }
    });

    // Seed 5 posts for TR
    for (let i = 1; i <= 5; i++) {
      const slug = `${catPair.tr.slug}-post-${i}`;
      await prisma.post.upsert({
        where: { slug },
        update: { locale: 'tr', area: ContentArea.forum, isFeatured: (i <= 2) },
        create: {
          title: `${catPair.tr.name} Konusu ${i}`,
          slug,
          excerpt: `${catPair.tr.name} hakkında ${i}. samimi paylaşım.`,
          content: `${catPair.tr.name} kategorisinde yer alan bu içerik, kurumsal dünyadan gerçek deneyimleri yansıtmaktadır. Örnek içerik ${i}.`,
          authorId,
          categoryId: trCat.id,
          area: ContentArea.forum,
          visibility: VisibilityType.public,
          status: ContentStatus.published,
          locale: 'tr',
          isFeatured: (i <= 2),
          publishedAt: new Date(),
          viewCount: Math.floor(Math.random() * 1000)
        }
      });
    }

    // Seed 5 posts for EN
    for (let i = 1; i <= 5; i++) {
        const slug = `${catPair.en.slug}-post-${i}`;
        await prisma.post.upsert({
          where: { slug },
          update: { locale: 'en', area: ContentArea.forum, isFeatured: (i <= 2) },
          create: {
            title: `${catPair.en.name} Topic ${i}`,
            slug,
            excerpt: `The ${i}th sincere share about ${catPair.en.name}.`,
            content: `This content in the ${catPair.en.name} category reflects real experiences from the corporate world. Sample content ${i}.`,
            authorId,
            categoryId: enCat.id,
            area: ContentArea.forum,
            visibility: VisibilityType.public,
            status: ContentStatus.published,
            locale: 'en',
            isFeatured: (i <= 2),
            publishedAt: new Date(),
            viewCount: Math.floor(Math.random() * 1000)
          }
        });
      }
  }

  console.log('Forum seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
