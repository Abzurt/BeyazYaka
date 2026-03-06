const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.menuItem.count();
  if (existing === 0) {
    await prisma.menuItem.createMany({
      data: [
        { title: 'Dosyalar', url: '/dosyalar', order: 1, isActive: true, locale: 'tr' },
        { title: 'Forum', url: '/forum', order: 2, isActive: true, locale: 'tr' },
        { title: 'Survival Kit', url: '/survival-kit', order: 3, isActive: true, locale: 'tr' },
        { title: 'Testler', url: '/testler', order: 4, isActive: true, locale: 'tr' },
        { title: 'Files', url: '/dosyalar', order: 1, isActive: true, locale: 'en' },
        { title: 'Forum', url: '/forum', order: 2, isActive: true, locale: 'en' },
        { title: 'Survival Kit', url: '/survival-kit', order: 3, isActive: true, locale: 'en' },
        { title: 'Quizzes', url: '/testler', order: 4, isActive: true, locale: 'en' },
      ],
    });
    console.log("Default menu items seeded!");
  } else {
    console.log("Menu items already exist.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
