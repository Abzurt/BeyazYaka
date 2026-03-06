import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany();
  console.log('Total Categories:', categories.length);
  categories.forEach(c => console.log(`- ${c.name} (${c.slug}) id: ${c.id} parentId: ${c.parentId}`));

  const users = await prisma.user.findMany();
  console.log('Total Users:', users.length);
  users.forEach(u => console.log(`- ${u.username} (${u.email}) id: ${u.id}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
