import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const dateRange = searchParams.get("dateRange") || "7d";

    const dateFilter: any = {};
    if (dateRange !== 'all') {
      const startDate = new Date();
      if (dateRange === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (dateRange === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      }
      dateFilter.createdAt = { gte: startDate };
    }

    // 1. Total Comments
    const totalComments = await prisma.comment.count({
      where: { isDeleted: false, ...dateFilter }
    });

    // 2. Average Rating
    const ratings = await prisma.postRating.aggregate({
      _avg: {
        rating: true
      },
      where: { ...dateFilter }
    });
    const avgRating = ratings._avg.rating ? Number(ratings._avg.rating.toFixed(1)) : 0;

    // 3. Total Likes
    const likes = await prisma.comment.aggregate({
      _sum: {
        likeCount: true
      },
      where: { isDeleted: false, ...dateFilter }
    });
    const totalLikes = likes._sum.likeCount || 0;

    // 4. Low Ratings (1 or 2 stars) count
    const lowRatings = await prisma.postRating.count({
      where: { rating: { lte: 2 }, ...dateFilter }
    });

    // 5. Build Top 10 Data
    
    // Most liked comments
    const topLiked = await prisma.comment.findMany({
      where: { isDeleted: false, ...dateFilter },
      orderBy: { likeCount: 'desc' },
      take: 10,
      include: {
        user: { select: { displayName: true, username: true } },
        post: { select: { title: true, slug: true } },
        quiz: { select: { title: true, slug: true } },
        campaign: { select: { title: true, targetUrl: true } }
      }
    });

    const formatCommentTop10 = (c: any) => {
      let url = "#";
      if (c.postId) url = c.post?.slug ? `/yazi/${c.post.slug}` : "#";
      else if (c.quizId) url = c.quiz?.slug ? `/quiz/${c.quiz.slug}` : "#";
      else if (c.campaignId) url = c.campaign?.targetUrl || "#";

      return {
        id: c.id,
        title: c.post?.title || c.quiz?.title || c.campaign?.title || "Bilinmeyen İçerik",
        author: c.user?.displayName || c.user?.username || "Bilinmeyen Üye",
        score: `${c.likeCount} Beğeni`,
        url
      };
    };

    const topLikedFormatted = topLiked.map(formatCommentTop10);

    return NextResponse.json({
      summaryStats: [
        { id: 'likes', label: 'Toplam Etkileşim', value: totalLikes.toString(), detail: 'Yorum Beğenileri', iconName: 'ThumbsUp', color: 'var(--accent)' },
        { id: 'ratings', label: 'Genel Puan Ort.', value: `${avgRating}/5`, detail: 'Tüm İçerikler', iconName: 'Star', color: 'var(--accent)' },
        { id: 'low-ratings', label: 'Düşük Puanlar (1-2)', value: lowRatings.toString(), detail: 'İnceleme bekleyen', iconName: 'TrendingDown', color: '#ef4444' },
        { id: 'discuss', label: 'Toplam Yorumlar', value: totalComments.toString(), detail: 'Sistemdeki', iconName: 'MessageSquare', color: '#3b82f6' },
      ],
      top10Data: {
        likes: topLikedFormatted,
        ratings: [], // We can populate these with actual posts if needed, but for MVP returning empty array or top liked is fine for the UI.
        'low-ratings': [],
        discuss: []
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
