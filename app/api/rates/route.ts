import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/rates - Rate a post, quiz or campaign
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { targetId, targetType, rating } = await req.json();

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    if (!targetId || !targetType) {
      return NextResponse.json({ error: "Missing target" }, { status: 400 });
    }

    let existing;
    let result;

    if (targetType === "post") {
      existing = await prisma.postRating.findFirst({
        where: { postId: targetId, userId: session.user.id! },
      });
      if (existing) {
        result = await prisma.postRating.update({
          where: { id: existing.id },
          data: { rating },
        });
      } else {
        result = await prisma.postRating.create({
           data: { rating, postId: targetId, quizId: null, campaignId: null, userId: session.user.id! },
        });
      }
    } else if (targetType === "quiz") {
      existing = await prisma.postRating.findFirst({
        where: { quizId: targetId, userId: session.user.id! },
      });
      if (existing) {
        result = await prisma.postRating.update({
          where: { id: existing.id },
          data: { rating },
        });
      } else {
        result = await prisma.postRating.create({
           data: { rating, quizId: targetId, postId: null, campaignId: null, userId: session.user.id! },
        });
      }
    } else if (targetType === "campaign") {
      existing = await prisma.postRating.findFirst({
        where: { campaignId: targetId, userId: session.user.id! },
      });
      if (existing) {
        result = await prisma.postRating.update({
          where: { id: existing.id },
          data: { rating },
        });
      } else {
        result = await prisma.postRating.create({
           data: { rating, campaignId: targetId, postId: null, quizId: null, userId: session.user.id! },
        });
      }
    } else {
      return NextResponse.json({ error: "Invalid target type" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error rating:", error);
    return NextResponse.json({ error: "Failed to rate" }, { status: 500 });
  }
}
