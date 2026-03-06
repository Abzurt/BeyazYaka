import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import QuizForm from '../../QuizForm';
import { Locale } from '@/lib/i18n-config';

export default async function EditQuizPage({
  params
}: {
  params: Promise<{ id: string; locale: Locale }>
}) {
  const { id } = await params;

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
      }
    }
  });

  if (!quiz) {
    notFound();
  }

  // Transform data to match Question/Choice interface if necessary
  // (In this case, the DB schema and interface names match fairly well)
  const formattedQuiz = {
    ...quiz,
    questions: quiz.questions.map((q: any) => ({
      questionText: q.questionText,
      sortOrder: q.sortOrder,
      choices: q.choices.map((c: any) => ({
        choiceText: c.choiceText,
        score: c.score,
        resultKey: c.resultKey || 'standard',
        sortOrder: c.sortOrder
      }))
    }))
  };

  return <QuizForm initialData={formattedQuiz} isEdit={true} />;
}
