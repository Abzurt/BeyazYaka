'use client';

import { Star } from 'lucide-react';
import styles from './StarRating.module.css';
import { useState } from 'react';

interface StarRatingProps {
  initialRating?: number;
  totalVotes?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  size?: number;
}

export function StarRating({ 
  initialRating = 0, 
  totalVotes = 0, 
  interactive = false, 
  onRate,
  size = 20
}: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(initialRating);

  return (
    <div className={styles.container}>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${styles.starBtn} ${interactive ? styles.interactive : ''}`}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => {
              if (interactive) {
                setRating(star);
                onRate?.(star);
              }
            }}
          >
            <Star 
              size={size} 
              fill={(hover || rating) >= star ? 'var(--accent)' : 'transparent'} 
              color={(hover || rating) >= star ? 'var(--accent)' : 'var(--text-muted)'}
              className={styles.starIcon}
            />
          </button>
        ))}
      </div>
      {totalVotes > 0 && <span className={styles.voteCount}>{rating.toFixed(1)} ({totalVotes} oy)</span>}
    </div>
  );
}
