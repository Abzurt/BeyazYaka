import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/posts/[id]/rate - Rate a post (1-5)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { rating } = await req.json();

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const upsertRating = await prisma.postRating.upsert({
      where: {
        postId_userId: {
          postId: id,
          userId: session.user.id!,
        },
      },
      update: { rating },
      create: {
        rating,
        postId: id,
        userId: session.user.id!,
      },
    });

    return NextResponse.json(upsertRating);
  } catch (error) {
    return NextResponse.json({ error: "Failed to rate post" }, { status: 500 });
  }
}
