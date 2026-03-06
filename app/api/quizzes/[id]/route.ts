import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logUserAction } from "@/lib/logger";

// GET /api/quizzes/[id] - Get a single quiz with questions and stats
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
          include: {
            choices: {
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        _count: {
          select: { results: true }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("GET /api/quizzes/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}

// DELETE /api/quizzes/[id] - Delete a quiz (Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // 1. Delete associated results, choices, and questions first to avoid foreign key issues
    await prisma.$transaction(async (tx: any) => {
      const currentQuestions = await tx.quizQuestion.findMany({
        where: { quizId: id },
        select: { id: true }
      });
      const questionIds = currentQuestions.map((q: any) => q.id);

      await tx.quizResult.deleteMany({ where: { quizId: id } });
      await tx.quizChoice.deleteMany({ where: { questionId: { in: questionIds } } });
      await tx.quizQuestion.deleteMany({ where: { quizId: id } });
      
      // 2. Finally delete the quiz
      await tx.quiz.delete({ where: { id } });
    });

    await logUserAction({
      userId: session.user.id!,
      action: "delete_quiz",
      targetId: id,
      targetType: "quiz"
    });

    return NextResponse.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/quizzes/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete quiz" }, { status: 500 });
  }
}// PATCH /api/quizzes/[id] - Update a quiz (Admin only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { title, slug, coverImageUrl, questions, isActive } = await req.json();

    if (slug) {
      const existingQuiz = await prisma.quiz.findFirst({
        where: { 
          slug,
          NOT: { id }
        }
      });

      if (existingQuiz) {
        return NextResponse.json({ error: "Bu slug zaten başka bir test tarafından kullanılıyor." }, { status: 400 });
      }
    }

    // Update quiz basic info and recreate questions/choices
    const quiz = await prisma.$transaction(async (tx: any) => {
      // 1. Delete existing questions (choices will be deleted via cascade if configured, 
      // otherwise delete them manually first)
      // Our schema doesn't explicitly show onDelete: Cascade for quiz_choices -> quiz_questions,
      // and quiz_questions -> quizzes. Let's be safe.
      
      const currentQuestions = await tx.quizQuestion.findMany({
        where: { quizId: id },
        select: { id: true }
      });
      const questionIds = currentQuestions.map((q: any) => q.id);

      await tx.quizChoice.deleteMany({
        where: { questionId: { in: questionIds } }
      });

      await tx.quizQuestion.deleteMany({
        where: { quizId: id }
      });

      // 2. Update quiz and create new questions
      return await tx.quiz.update({
        where: { id },
        data: {
          title,
          slug,
          coverImageUrl,
          isActive,
          questions: {
            create: questions.map((q: any) => ({
              questionText: q.questionText,
              sortOrder: q.sortOrder,
              choices: {
                create: q.choices.map((c: any) => ({
                  choiceText: c.choiceText,
                  score: c.score,
                  resultKey: c.resultKey,
                  sortOrder: c.sortOrder
                }))
              }
            }))
          }
        },
        include: {
          questions: {
            include: { choices: true }
          }
        }
      });
    });

    await logUserAction({
      userId: session.user.id!,
      action: "edit_quiz",
      targetId: quiz.id,
      targetType: "quiz",
      details: { title: quiz.title, slug: quiz.slug }
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("PATCH /api/quizzes/[id] error:", error);
    return NextResponse.json({ error: "Failed to update quiz" }, { status: 500 });
  }
}
