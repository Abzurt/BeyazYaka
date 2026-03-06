import { PrismaClient, ContentArea, VisibilityType, ContentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const authorId = 'd395f83e-f2e0-493a-95f8-b599b08cba9f'; // deneme user
  const parentCategorySlug = 'beyaz-yaka-dunyasi';

  // Ensure parent exists
  const parentCategory = await prisma.category.upsert({
    where: { slug: parentCategorySlug },
    update: {},
    create: {
      name: 'Beyaz Yaka Dünyası',
      slug: parentCategorySlug,
      description: 'Plaza insanının doğal yaşam alanı.',
      area: ContentArea.general,
      defaultVisibility: VisibilityType.public,
    },
  });

  const subCategories = [
    { name: 'Beyaz Yaka Markaları', slug: 'beyaz-yaka-markalari' },
    { name: 'Beyaz Yaka Ortamları', slug: 'beyaz-yaka-ortamlari' },
    { name: 'Cuma Kaçış Rotaları', slug: 'cuma-kacis-rotalari' },
    { name: 'Network Mekanları', slug: 'network-mekanlari' },
  ];

  for (const sub of subCategories) {
    console.log(`Processing category: ${sub.name}...`);
    const category = await prisma.category.upsert({
      where: { slug: sub.slug },
      update: { parentId: parentCategory.id },
      create: {
        name: sub.name,
        slug: sub.slug,
        parentId: parentCategory.id,
        area: ContentArea.general,
        defaultVisibility: VisibilityType.public,
      },
    });

    for (let i = 1; i <= 4; i++) {
        const postSlug = `${sub.slug}-ornek-${i}`;
        console.log(` Creating post: ${postSlug}...`);
        await prisma.post.upsert({
            where: { slug: postSlug },
            update: {},
            create: {
                title: `${sub.name} Örnek İçerik ${i}`,
                slug: postSlug,
                excerpt: `${sub.name} kategorisi için oluşturulmuş ${i}. örnek içerik açıklamasıdır.`,
                content: `Bu ${sub.name} için hazırlanmış detaylı bir içeriktir. Plaza hayatında ${i}. sıradaki önemli detayları içermektedir.`,
                authorId: authorId,
                categoryId: category.id,
                area: ContentArea.general,
                visibility: VisibilityType.public,
                status: ContentStatus.published,
                publishedAt: new Date(),
            }
        });
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
