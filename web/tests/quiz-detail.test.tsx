import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import QuizDetail from '../app/[locale]/testler/[slug]/QuizDetail';

// Mocking Next.js Navigation Hooks
vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'coffee-quiz', locale: 'tr' }),
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mocking Next.js Image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

// Mocking CommentSection
vi.mock('@/components/ui/CommentSection', () => ({
  CommentSection: () => <div data-testid="comment-section" />,
}));

const mockDict = {
  quizzes: {
    detail: {
      loading: 'Yükleniyor...',
      notFound: 'Bulunamadı',
      back: 'Geri',
      ready: 'Hazır mısın?',
      intro: '{count} soruluk test.',
      startBtn: 'Başla',
      duration: '{time} dk',
      participation: '{count} kişi',
      progress: '{current}/{total}',
      next: 'Sonraki',
      prev: 'Önceki',
      finish: 'Bitir',
    },
  },
  comments: {},
};

describe('QuizDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear global fetch mock if any
    (global as any).fetch = vi.fn();
  });

  it('should render intro screen after fetching quiz', async () => {
    const mockQuizList = [{ id: '1', slug: 'coffee-quiz' }];
    const mockQuizData = {
      id: '1',
      title: 'Kahve Testi',
      questions: [{ id: 'q1', questionText: 'Hangi kahve?', choices: [{ id: 'c1', choiceText: 'Latte' }] }],
      _count: { results: 50 },
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockQuizList) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockQuizData) });

    render(<QuizDetail dict={mockDict} />);

    expect(await screen.findByText('Kahve Testi')).toBeDefined();
    expect(screen.getByText('Başla')).toBeDefined();
  });

  it('should navigate between questions', async () => {
    const mockQuizList = [{ id: '1', slug: 'coffee-quiz' }];
    const mockQuizData = {
      id: '1',
      title: 'Kahve Testi',
      questions: [
        { id: 'q1', questionText: 'Soru 1', choices: [{ id: 'c1', choiceText: 'A' }] },
        { id: 'q2', questionText: 'Soru 2', choices: [{ id: 'c2', choiceText: 'B' }] },
      ],
      _count: { results: 50 },
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockQuizList) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockQuizData) });

    render(<QuizDetail dict={mockDict} />);

    // Start quiz
    const startBtn = await screen.findByText('Başla');
    fireEvent.click(startBtn);

    // Question 1
    expect(await screen.findByText('Soru 1')).toBeDefined();
    
    // Select answer
    fireEvent.click(screen.getByText('A'));
    
    // Next
    fireEvent.click(screen.getByText('Sonraki'));
    
    // Question 2
    expect(await screen.findByText('Soru 2')).toBeDefined();
  });
});
