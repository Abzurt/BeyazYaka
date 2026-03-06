'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize?: number;
}

export function AdminPagination({ page, totalPages, onPageChange, totalItems, pageSize = 15 }: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 0',
      marginTop: '16px',
      borderTop: '1px solid var(--border-dim)',
      flexWrap: 'wrap',
      gap: '12px',
    }}>
      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        {totalItems} sonuçtan {from}–{to} arası
      </span>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '6px 12px', borderRadius: '6px',
            border: '1px solid var(--border-dim)',
            background: 'var(--bg-card)', color: page === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '13px',
            opacity: page === 1 ? 0.5 : 1,
          }}
        >
          <ChevronLeft size={14} /> Önceki
        </button>

        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 7) {
            pageNum = i + 1;
          } else if (page <= 4) {
            pageNum = i + 1;
          } else if (page >= totalPages - 3) {
            pageNum = totalPages - 6 + i;
          } else {
            pageNum = page - 3 + i;
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              style={{
                width: '32px', height: '32px', borderRadius: '6px',
                border: '1px solid var(--border-dim)',
                background: pageNum === page ? 'var(--accent)' : 'var(--bg-card)',
                color: pageNum === page ? '#fff' : 'var(--text-primary)',
                cursor: 'pointer', fontSize: '13px', fontWeight: pageNum === page ? 700 : 400,
              }}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '6px 12px', borderRadius: '6px',
            border: '1px solid var(--border-dim)',
            background: 'var(--bg-card)', color: page === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '13px',
            opacity: page === totalPages ? 0.5 : 1,
          }}
        >
          Sonraki <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// Utility hook for client-side pagination of an array
export function usePagination<T>(items: T[], pageSize = 15) {
  return {
    paginate: (page: number) => items.slice((page - 1) * pageSize, page * pageSize),
    totalPages: (items: T[]) => Math.ceil(items.length / pageSize),
  };
}
