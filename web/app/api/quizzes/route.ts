import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logUserAction } from "@/lib/logger";

// GET /api/quizzes - List all quizzes
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const adminMode = searchParams.get('admin') === 'true';
    const locale = searchParams.get('locale');

    const where: any = adminMode ? {} : { isActive: true };
    if (locale) where.locale = locale;

    const page = adminMode ? parseInt(searchParams.get('page') || '1') : 1;
    const pageSize = adminMode ? parseInt(searchParams.get('pageSize') || '15') : 1000;
    const skip = (page - 1) * pageSize;

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        include: {
          _count: {
            select: { results: true, questions: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.quiz.count({ where }),
    ]);

    if (adminMode) {
      return NextResponse.json({ data: quizzes, total });
    }
    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("GET /api/quizzes error:", error);
    return NextResponse.json({ error: "Failed to fetch quizzes" }, { status: 500 });
  }
}

// POST /api/quizzes - Create a new quiz (Admin only)
export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, slug, coverImageUrl, questions, locale } = await req.json();

    if (!title || !slug) {
      return NextResponse.json({ error: "Başlık ve slug zorunludur." }, { status: 400 });
    }

    const existingQuiz = await prisma.quiz.findUnique({
      where: { slug }
    });

    if (existingQuiz) {
      return NextResponse.json({ error: "Bu slug (URL adresi) zaten kullanılıyor. Lütfen farklı bir başlık seçin veya slug'ı değiştirin." }, { status: 400 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        slug,
        coverImageUrl,
        locale: locale || 'tr',
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

    await logUserAction({
      userId: session.user.id!,
      action: "create_quiz",
      targetId: quiz.id,
      targetType: "quiz",
      details: { title: quiz.title, slug: quiz.slug }
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("POST /api/quizzes error:", error);
    return NextResponse.json({ error: "Failed to create quiz" }, { status: 500 });
  }
}
