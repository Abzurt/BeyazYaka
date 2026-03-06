import { Locale } from '@/lib/i18n-config';
import { getDictionary } from '@/lib/get-dictionary';
import QuizDetail from './QuizDetail';

export default async function Page({ params }: { params: Promise<{ locale: Locale, slug: string }> }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <QuizDetail dict={dict} />;
}
