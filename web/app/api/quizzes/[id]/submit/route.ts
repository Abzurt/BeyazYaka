import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// POST /api/quizzes/[id]/submit - Submit quiz results
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: quizId } = await params;
  const session = await auth();
  
  try {
    const { choices, email } = await req.json();

    // 1. Fetch quiz to verify existence and get scoring logic if needed
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            choices: true
          }
        }
      }
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // 2. Calculate score and determine result key
    // For this implementation, we'll sum the 'score' of selected choices
    // And pick the most frequent 'resultKey' if applicable
    let totalScore = 0;
    const resultCounts: Record<string, number> = {};

    for (const choiceId of choices) {
      // Find the choice in our fetched quiz data to be secure
      let found = false;
      for (const q of quiz.questions) {
        const c = q.choices.find((choice: any) => choice.id === choiceId);
        if (c) {
          totalScore += c.score;
          if (c.resultKey) {
            resultCounts[c.resultKey] = (resultCounts[c.resultKey] || 0) + 1;
          }
          found = true;
          break;
        }
      }
    }

    // Determine primary resultKey (the one with most occurrences)
    let finalResultKey = "standard";
    let maxCount = 0;
    for (const [key, count] of Object.entries(resultCounts)) {
      if (count > maxCount) {
        maxCount = count;
        finalResultKey = key;
      }
    }

    // 3. Save result
    const result = await prisma.quizResult.create({
      data: {
        quizId,
        userId: session?.user?.id || null,
        email: email || session?.user?.email || null,
        score: totalScore,
        resultKey: finalResultKey
      }
    });

    // 4. Calculate aggregate stats for this quiz
    const totalResults = await prisma.quizResult.count({ where: { quizId } });
    const sameResultResults = await prisma.quizResult.count({ 
      where: { quizId, resultKey: finalResultKey } 
    });

    const percentage = totalResults > 0 
      ? Math.round((sameResultResults / totalResults) * 100) 
      : 100;

    return NextResponse.json({
      result,
      stats: {
        percentage,
        totalParticipants: totalResults
      }
    });

  } catch (error) {
    console.error("POST /api/quizzes/[id]/submit error:", error);
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}
