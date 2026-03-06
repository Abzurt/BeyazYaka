import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function GET(req: Request) {
  try {
    await checkAdmin();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "all";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const dateRange = searchParams.get("dateRange") || "7d";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "15");
    const skip = (page - 1) * pageSize;

    let PrismaFilter: any = search ? {
        OR: [
          { content: { contains: search, mode: "insensitive" } },
          { user: { displayName: { contains: search, mode: "insensitive" } } },
          { user: { username: { contains: search, mode: "insensitive" } } },
        ]
      } : {};

    if (type !== 'all') {
      if (!PrismaFilter.AND) PrismaFilter.AND = [];
      if (type === 'Post') PrismaFilter.AND.push({ postId: { not: null } });
      if (type === 'Quiz') PrismaFilter.AND.push({ quizId: { not: null } });
      if (type === 'Survival Kit') PrismaFilter.AND.push({ campaignId: { not: null } });
    }

    if (dateRange !== 'all') {
      const startDate = new Date();
      if (dateRange === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (dateRange === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      }
      if (!PrismaFilter.AND) PrismaFilter.AND = [];
      PrismaFilter.AND.push({ createdAt: { gte: startDate } });
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
      where: PrismaFilter,
      include: {
        user: {
          select: { displayName: true, username: true }
        },
        post: { select: { title: true, slug: true } },
        quiz: { select: { title: true, slug: true } },
        campaign: { select: { title: true, targetUrl: true } }
      },

      ...(sortBy === 'createdAt' || sortBy === 'likeCount' ? { orderBy: { [sortBy]: sortOrder } } : {}),
      skip,
      take: pageSize,
    }),
      prisma.comment.count({ where: PrismaFilter }),
    ]);

    // Since Prisma cannot easily join PostRating mapped by (targetId, userId) without knowing the target, 
    // we fetch user ratings in memory for the returned comments.
    const userIds = comments.map((c: any) => c.userId);
    const postIds = comments.map((c: any) => c.postId).filter(Boolean) as string[];
    const quizIds = comments.map((c: any) => c.quizId).filter(Boolean) as string[];
    const campaignIds = comments.map((c: any) => c.campaignId).filter(Boolean) as string[];

    const ratings = await prisma.postRating.findMany({
       where: {
          userId: { in: userIds },
          OR: [
             { postId: { in: postIds } },
             { quizId: { in: quizIds } },
             { campaignId: { in: campaignIds } }
          ]
       }
    });

    const formattedComments = comments.map((c: any) => {
      let targetType = "Unknown";
      let postTitle = "Bilinmeyen Başlık";
      let postUrl = "#";
      let ratingObj = null;

      if (c.postId) {
         targetType = "Post";
         postTitle = c.post?.title || postTitle;
         postUrl = c.post?.slug ? `/yazi/${c.post.slug}` : "#";
         ratingObj = ratings.find((r: any) => r.postId === c.postId && r.userId === c.userId);
      } else if (c.quizId) {
         targetType = "Quiz";
         postTitle = c.quiz?.title || postTitle;
         postUrl = c.quiz?.slug ? `/quiz/${c.quiz.slug}` : "#";
         ratingObj = ratings.find((r: any) => r.quizId === c.quizId && r.userId === c.userId);
      } else if (c.campaignId) {
         targetType = "Survival Kit";
         postTitle = c.campaign?.title || postTitle;
         postUrl = c.campaign?.targetUrl || "#";
         ratingObj = ratings.find((r: any) => r.campaignId === c.campaignId && r.userId === c.userId);
      }

      return {
        id: c.id,
        content: c.content,
        author: c.user?.displayName || c.user?.username || "Bilinmeyen Kullanıcı",
        post: postTitle,
        postUrl,
        targetType,
        rating: ratingObj ? ratingObj.rating : null,
        likes: c.likeCount || 0,
        createdAt: c.createdAt,
      };
    });

    if (sortBy === 'rating') {
       formattedComments.sort((a: any, b: any) => {
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          return sortOrder === 'desc' ? ratingB - ratingA : ratingA - ratingB;
       });
    }

    return NextResponse.json({ data: formattedComments, total });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 500 });
  }
}
