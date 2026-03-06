import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mocking Next.js Navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

// Mocking Next.js Image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

// Mocking Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    post: {
      findUnique: vi.fn(),
    },
    postRating: {
      aggregate: vi.fn(),
    },
    comment: {
      count: vi.fn(),
    },
  },
}));

// Mocking Dictionaries
vi.mock('@/lib/get-dictionary', () => ({
  getDictionary: vi.fn().mockResolvedValue({
    comments: { back: 'Geri Dön', starVotes: 'oy' },
    home: { starVotes: 'oy' },
  }),
}));

// Mocking CommentSection component
vi.mock('@/components/ui/CommentSection', () => ({
  CommentSection: () => <div data-testid="comment-section" />,
}));

import BrandDetailPage from '../app/[locale]/markalar/[slug]/page';
import prisma from '@/lib/prisma';

describe('BrandDetailPage', () => {
  const mockParams = Promise.resolve({ slug: 'starbucks', locale: 'tr' as any });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render brand details when slug exists', async () => {
    (prisma.post.findUnique as any).mockResolvedValue({
      id: '1',
      title: 'Starbucks',
      excerpt: 'Kahve devi',
      content: '### İçerik\n- Madde 1',
      coverImageUrl: '/starbucks.jpg',
      category: { name: 'Kafeler' },
      tags: [{ tag: { name: 'Kahve' } }],
    });

    (prisma.postRating.aggregate as any).mockResolvedValue({
      _avg: { rating: 4.5 },
      _count: { rating: 100 },
    });

    (prisma.comment.count as any).mockResolvedValue(10);

    const Page = await BrandDetailPage({ params: mockParams });
    render(Page);

    expect(screen.getByText('Starbucks')).toBeDefined();
    expect(screen.getByText('Kahve devi')).toBeDefined();
    expect(screen.getByText('4.5')).toBeDefined();
    expect(screen.getByTestId('comment-section')).toBeDefined();
  });

  it('should call notFound when slug does not exist', async () => {
    (prisma.post.findUnique as any).mockResolvedValue(null);
    const { notFound } = await import('next/navigation');

    await BrandDetailPage({ params: mockParams });
    expect(notFound).toHaveBeenCalled();
  });
});
