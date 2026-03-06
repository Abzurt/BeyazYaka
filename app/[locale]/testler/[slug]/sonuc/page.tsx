import QuizResult from './QuizResult';
import { getDictionary } from '@/lib/get-dictionary';
import { Locale } from '@/lib/i18n-config';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ locale: Locale, slug: string }> }) {
  const { locale, slug } = await params;
  const dict = await getDictionary(locale);
  const session = await auth();
  const isAdmin = session?.user?.role === 'admin';

  const quiz = await prisma.quiz.findUnique({
    where: { slug },
    select: { id: true, isActive: true }
  });

  if (!quiz) return notFound();

  // Security: Only admins can see results for non-active quizzes
  if (!quiz.isActive && !isAdmin) {
    return notFound();
  }
  
  return <QuizResult dict={dict} />;
}
