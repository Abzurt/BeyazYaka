import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const userId = session.user.id;

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId: id,
          userId: userId!,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.$transaction([
        prisma.commentLike.delete({
          where: {
            commentId_userId: {
              commentId: id,
              userId: userId!,
            },
          },
        }),
        prisma.comment.update({
          where: { id },
          data: { likeCount: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.$transaction([
        prisma.commentLike.create({
          data: {
            commentId: id,
            userId: userId!,
          },
        }),
        prisma.comment.update({
          where: { id },
          data: { likeCount: { increment: 1 } },
        }),
      ]);
      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
