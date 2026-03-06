import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const locale = searchParams.get("locale") || "tr";
    
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

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Failed to fetch trending posts:", error);
    return NextResponse.json({ error: "Failed to fetch trending posts" }, { status: 500 });
  }
}
