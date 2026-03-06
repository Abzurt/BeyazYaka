'use client';

import { useState, useCallback, useEffect } from 'react';
import { CommentRatingForm } from './CommentRatingForm';
import { CommentItem } from './CommentItem';
import styles from './CommentSection.module.css';

interface CommentSectionProps {
  targetId: string;
  targetType: 'post' | 'quiz' | 'campaign';
  dict: any;
}

export function CommentSection({ targetId, targetType, dict }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/comments?${targetType}Id=${targetId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setComments(data);
        } else {
          setComments([]);
          console.error('API returned non-array data:', data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [targetId, targetType]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <div className={styles.section}>
      <CommentRatingForm 
        targetId={targetId} 
        targetType={targetType}
        dict={dict} 
        onSuccess={fetchComments} 
      />
      
      <div className={styles.list}>
        {isLoading ? (
          <p className={styles.loadingText}>{dict.loading || 'Yükleniyor...'}</p>
        ) : comments.length === 0 ? (
          <p className={styles.noComments}>{dict.noComments || 'Henüz yorum yapılmamış. İlk yorumu sen yap!'}</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              id={comment.id}
              author={comment.user?.displayName || comment.user?.name || 'Kullanıcı'}
              content={comment.content}
              time={new Date(comment.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
              initialLikes={comment.likeCount}
              dict={dict}
              targetId={targetId}
              targetType={targetType}
              onReplySuccess={fetchComments}
              replies={comment.replies?.map((r: any) => ({
                id: r.id,
                author: r.user?.displayName || r.user?.name || 'Kullanıcı',
                content: r.content,
                time: new Date(r.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
              })) || []}
            />
          ))
        )}
      </div>
    </div>
  );
}
