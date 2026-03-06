'use client';

import { useState } from 'react';
import { StarRating } from './StarRating';
import { Button } from './Button';
import styles from './CommentRatingForm.module.css';
import { Send, Star, LogIn } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface CommentRatingFormProps {
  targetId: string;
  targetType: 'post' | 'quiz' | 'campaign';
  onSuccess?: () => void;
  dict: any;
}

export function CommentRatingForm({ targetId, targetType, onSuccess, dict }: CommentRatingFormProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isAuthenticated = status === 'authenticated';
  const canSubmitRating = rating > 0 && isAuthenticated;
  const canSubmitComment = rating > 0 && comment.trim().length > 0 && isAuthenticated;

  const handleLoginRedirect = () => {
    router.push(`/login?callbackUrl=${window.location.pathname}`);
  };

  const handleSubmit = async (type: 'vote' | 'comment') => {
    if (!isAuthenticated) {
      handleLoginRedirect();
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      if (type === 'vote' || type === 'comment') {
        // Submit rating if > 0
        if (rating > 0) {
          const rateRes = await fetch('/api/rates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetId, targetType, rating })
          });
          if (!rateRes.ok) throw new Error('Rating failed');
        }
      }

      if (type === 'comment' && comment.trim()) {
        const commentRes = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            [`${targetType}Id`]: targetId,
            content: comment
          })
        });

        if (!commentRes.ok) {
          const errorData = await commentRes.json();
          throw new Error(errorData.error || 'Comment failed');
        }
      }
      
      setComment('');
      setRating(0);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message === 'Comment failed' || err.message === 'Rating failed' 
        ? (dict.errorFallback || 'Bir hata oluştu, lütfen tekrar deneyin.')
        : err.message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{dict.yourDecision}</h3>
        <p className={styles.subtitle}>{dict.opinion}</p>
      </div>

      <div className={styles.ratingWrapper}>
        <label className={styles.label}>{dict.rate}</label>
        <StarRating 
          interactive 
          initialRating={rating} 
          onRate={(r) => {
            setRating(r);
            setError('');
          }} 
          size={28} 
        />
      </div>

      <div className={`${styles.commentWrapper} ${!canSubmitRating ? styles.disabled : ''}`}>
        <textarea
          placeholder={canSubmitRating ? dict.placeholder : dict.placeholderDisabled}
          className={styles.textarea}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={!canSubmitRating}
        />
        {comment.length > 0 && !canSubmitRating && (
          <p className={styles.errorText}>{dict.errorNoStar}</p>
        )}
      </div>

      <div className={styles.actions}>
        {!isAuthenticated ? (
          <Button onClick={handleLoginRedirect} icon={LogIn}>
            {dict.loginToJoin}
          </Button>
        ) : !comment.trim() ? (
          <Button 
            onClick={() => handleSubmit('vote')} 
            disabled={!canSubmitRating || isSubmitting}
            variant="outline"
            icon={Star}
          >
            {isSubmitting ? dict.voting : dict.voteOnly}
          </Button>
        ) : (
          <Button 
            onClick={() => handleSubmit('comment')} 
            disabled={!canSubmitComment || isSubmitting}
            icon={Send}
          >
            {isSubmitting ? dict.submitting : dict.rateAndComment}
          </Button>
        )}
      </div>
      
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
