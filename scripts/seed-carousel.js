const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const items = [
    {
      title: 'Beyaz Yaka Markaları',
      subtitle: 'Plaza insanının vazgeçilmezleri.',
      image: '/images/hero/brands.png',
      link: '/beyaz-yaka-markalari',
      status: 'active',
      order: 1,
      locale: 'tr'
    },
    {
      title: 'Hayatta Kalma Rehberi',
      subtitle: 'Ofis ortamında akıl sağlığını koru.',
      image: '/images/hero/survival.png',
      link: '/survival-kit',
      status: 'active',
      order: 2,
      locale: 'tr'
    },
    {
      title: 'White Collar Brands',
      subtitle: 'Essentials for corporate life.',
      image: '/images/hero/brands.png',
      link: '/beyaz-yaka-markalari',
      status: 'active',
      order: 1,
      locale: 'en'
    },
    {
      title: 'Survival Kit',
      subtitle: 'Maintain sanity in the office.',
      image: '/images/hero/survival.png',
      link: '/survival-kit',
      status: 'active',
      order: 2,
      locale: 'en'
    }
  ];

  for (const item of items) {
    await prisma.carouselItem.create({ data: item });
  }
  
  console.log('Seeded 4 carousel items (2 TR, 2 EN).');
  await prisma.$disconnect();
}

seed();
