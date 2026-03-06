import { Locale } from '@/lib/i18n-config';
import { getDictionary } from '@/lib/get-dictionary';
import QuizDetail from './QuizDetail';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { StatusWarning } from '@/components/ui/StatusWarning';

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

  // Security: Only admins can see non-active quizzes
  if (!quiz.isActive && !isAdmin) {
    return notFound();
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--space-xl)' }}>
      <StatusWarning status={quiz.isActive ? 'published' : 'draft'} locale={locale} />
      <QuizDetail dict={dict} />
    </div>
  );
}
