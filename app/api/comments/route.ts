import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logUserAction } from "@/lib/logger";

// GET /api/comments - Fetch comments for a specific target
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const quizId = searchParams.get("quizId");
  const campaignId = searchParams.get("campaignId");

  if (!postId && !quizId && !campaignId) {
    return NextResponse.json({ error: "Missing target ID" }, { status: 400 });
  }

  try {
    const whereClause: any = {
      parentId: null, // Only fetch top-level comments directly, replies are nested
      isDeleted: false,
    };

    if (postId) whereClause.postId = postId;
    if (quizId) whereClause.quizId = quizId;
    if (campaignId) whereClause.campaignId = campaignId;

    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        user: {
          select: { image: true, displayName: true, username: true }
        },
        replies: {
          where: { isDeleted: false },
          include: {
            user: {
              select: { image: true, displayName: true, username: true }
            }
          },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // We also want to know if the current user has liked any of these
    // But since this might be public, we can just return the comments and let the client handle likes if needed.
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

// POST /api/comments - Add a comment
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { postId, quizId, campaignId, content, parentId } = await req.json();

    if (!postId && !quizId && !campaignId) {
       return NextResponse.json({ error: "Missing target ID" }, { status: 400 });
    }

    if (!content || !content.trim()) {
       return NextResponse.json({ error: "Comment content is required" }, { status: 400 });
    }

    if (!parentId) {
      const existingComment = await prisma.comment.findFirst({
        where: {
          userId: session.user.id!,
          parentId: null,
          isDeleted: false,
          ...(postId && { postId }),
          ...(quizId && { quizId }),
          ...(campaignId && { campaignId }),
        }
      });

      if (existingComment) {
        return NextResponse.json({ 
          error: "Bu sayfada zaten bir yorumunuz bulunmaktadır. Görüşünüzü güncelleyebilir veya silebilirsiniz." 
        }, { status: 403 });
      }
    }

    // Use a transaction to create the comment and update the comment count
    const [comment] = await prisma.$transaction(async (tx: any) => {
      const newComment = await tx.comment.create({
        data: {
          content,
          postId: postId || null,
          quizId: quizId || null,
          campaignId: campaignId || null,
          userId: session.user.id!,
          parentId: parentId || null,
        },
        include: {
          user: {
            select: { image: true, displayName: true, username: true }
          }
        }
      });

      // Update counts if it's a new top-level comment (or even replies if desired)
      // Usually platforms count all comments including replies.
      if (postId) {
        await tx.post.update({
          where: { id: postId },
          data: { commentCount: { increment: 1 } }
        });
      }

      return [newComment];
    });

    await logUserAction({
      userId: session.user.id!,
      action: "create_comment",
      targetId: comment.id,
      targetType: "comment",
      details: {
        content: comment.content.substring(0, 50),
        postId: comment.postId,
        quizId: comment.quizId,
        campaignId: comment.campaignId,
      }
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
