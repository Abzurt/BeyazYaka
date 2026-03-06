import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logUserAction } from "@/lib/logger";

// GET /api/posts - Get all published posts
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    
    const locale = searchParams.get("locale") || "tr";
    
    const posts = await prisma.post.findMany({
      where: {
        status: "published",
        locale,
        ...(category && { category: { slug: category } }),
      },
      include: {
        author: {
          select: { username: true, image: true },
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST /api/posts - Create a new post
export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { title, content, categoryId, area, visibility, isAnonymous } = data;

    // Simple slug generator for demo
    const slug = title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");

    const post = await prisma.post.create({
      data: {
        title,
        content,
        slug,
        categoryId,
        authorId: session.user.id!,
        area,
        visibility,
        isAnonymous: isAnonymous || false,
        status: "published", // Auto-publish for demo, usually 'pending'
      },
    });

    await logUserAction({
      userId: session.user.id!,
      action: "create_post",
      targetId: post.id,
      targetType: "post",
      details: { title: post.title, categoryId: post.categoryId },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Post creation error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
