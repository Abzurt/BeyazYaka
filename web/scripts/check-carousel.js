const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const items = await prisma.carouselItem.findMany();
  console.log('Carousel Items:', JSON.stringify(items, null, 2));
  await prisma.$disconnect();
}

check();
