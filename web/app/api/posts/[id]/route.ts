import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logUserAction } from "@/lib/logger";

// GET /api/posts/[id] - Get a single post
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: { select: { username: true, image: true } },
        category: true,
        comments: {
          include: { user: { select: { username: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

// PATCH /api/posts/[id] - Update a post
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const existingPost = await prisma.post.findUnique({ where: { id } });

    if (!existingPost) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (existingPost.authorId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        status: data.status,
      },
    });

    await logUserAction({
      userId: session.user.id!,
      action: "edit_post",
      targetId: updatedPost.id,
      targetType: "post",
      details: { title: updatedPost.title, status: updatedPost.status },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existingPost = await prisma.post.findUnique({ where: { id } });
    if (!existingPost) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    
    if (existingPost.authorId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.post.delete({ where: { id } });

    await logUserAction({
      userId: session.user.id!,
      action: "delete_post",
      targetId: id,
      targetType: "post",
      details: { title: existingPost.title },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
