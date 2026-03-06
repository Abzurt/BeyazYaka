import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

import { unstable_cache } from "next/cache";

const getCachedTrendingPosts = unstable_cache(
  async (locale: string) => {
    // Fetch top 3 featured forum posts, ordered by view count
    const posts = await prisma.post.findMany({
      where: {
        status: "published",
        area: "forum",
        locale: locale,
        isFeatured: true
      },
      include: {
        author: {
          select: { username: true, image: true },
        },
        category: true,
      },
      orderBy: [
        { viewCount: "desc" },
        { createdAt: "desc" }
      ],
      take: 3,
    });

    const postIds = posts.map((p: any) => p.id);

    const ratingAggs = await prisma.postRating.groupBy({
      by: ['postId'],
      where: { postId: { in: postIds } },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const ratingMap = Object.fromEntries(
      ratingAggs.map((r: any) => [r.postId, { avg: r._avg.rating, count: r._count.rating }])
    );

    return posts.map((p: any) => ({
      ...p,
      avgRating: ratingMap[p.id]?.avg ? Number(ratingMap[p.id].avg.toFixed(1)) : null,
      ratingCount: ratingMap[p.id]?.count ?? 0,
    }));
  },
  ["trending-posts"],
  { tags: ["trending", "posts"] }
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "tr";
    
    const enriched = await getCachedTrendingPosts(locale);

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Failed to fetch trending posts:", error);
    return NextResponse.json({ error: "Failed to fetch trending posts" }, { status: 500 });
  }
}
