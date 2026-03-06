import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SAMPLE_COMMENTS = [
  "Harika bir yazı olmuş, elinize sağlık!",
  "Katılıyorum, ofis hayatında bunlar hep başımıza geliyor.",
  "Daha fazla detay verebilir misiniz? Çok merak ettim.",
  "Gerçekten ufuk açıcı bir bakış açısı.",
  "Bunu ben de yaşadım, kesinlikle doğru.",
  "Bence bir tık abartılmış ama yine de güzel.",
  "Teşekkürler, çok faydalı oldu.",
  "Kesinlikle favorilerim arasına ekledim.",
  "Bununla ilgili daha çok yazı bekliyoruz.",
  "Güzel bir derleme olmuş, emeğinize sağlık."
];

async function main() {
  console.log('Starting seed process for comments and ratings...');
  
  // 1. Fetch available users
  const users = await prisma.user.findMany({
    select: { id: true }
  });
  
  if (users.length === 0) {
    console.log('No users found. Please create some users first.');
    return;
  }

  // 2. Fetch all target entities
  const posts = await prisma.post.findMany({ select: { id: true, title: true } });
  const quizzes = await prisma.quiz.findMany({ select: { id: true, title: true } });
  const campaigns = await prisma.adCampaign.findMany({ select: { id: true, title: true } });

  console.log(`Found ${posts.length} posts, ${quizzes.length} quizzes, ${campaigns.length} campaigns.`);

  let totalComments = 0;
  let totalRatings = 0;

  // Helper to get random item
  const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const getRandomRating = () => Math.floor(Math.random() * 5) + 1;

  // 3. Process each entity type
  const processEntities = async (entities: any[], type: 'postId' | 'quizId' | 'campaignId') => {
    for (const entity of entities) {
      console.log(`Processing ${type.replace('Id', '')}: ${entity.title}`);
      
      // Select 5 unique random users for this entity
      const selectedUsers = [...users].sort(() => 0.5 - Math.random()).slice(0, 5);
      
      for (const user of selectedUsers) {
        // Create Rating
        const ratingVal = getRandomRating();
        try {
          await prisma.postRating.upsert({
            where: type === 'postId' ? { postId_userId: { postId: entity.id, userId: user.id } } :
                   type === 'quizId' ? { quizId_userId: { quizId: entity.id, userId: user.id } } :
                   { campaignId_userId: { campaignId: entity.id, userId: user.id } },
            update: { rating: ratingVal },
            create: {
              rating: ratingVal,
              [type]: entity.id,
              userId: user.id
            }
          });
          totalRatings++;
        } catch (e) {
             // fallback for upsert issues with optionals
            const existing = await prisma.postRating.findFirst({
                where: { [type]: entity.id, userId: user.id }
            });
            if (!existing) {
                await prisma.postRating.create({
                    data: { rating: ratingVal, [type]: entity.id, userId: user.id }
                });
                totalRatings++;
            }
        }

        // Create Comment
        await prisma.comment.create({
          data: {
            content: getRandomItem(SAMPLE_COMMENTS),
            [type]: entity.id,
            userId: user.id,
            likeCount: Math.floor(Math.random() * 10)
          }
        });
        totalComments++;
      }
      
      // Update comment count if it's a post
      if (type === 'postId') {
          await prisma.post.update({
             where: { id: entity.id },
             data: { commentCount: { increment: 5 }}
          });
      }
    }
  };

  // Run the seeding
  await processEntities(posts, 'postId');
  await processEntities(quizzes, 'quizId');
  await processEntities(campaigns, 'campaignId');

  console.log(`\n✅ Seed completed!`);
  console.log(`Created ${totalComments} comments and ${totalRatings} ratings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
