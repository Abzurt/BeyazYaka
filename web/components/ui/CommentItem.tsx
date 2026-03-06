'use client';

import { useState } from 'react';
import { ThumbsUp, MessageSquare, CornerDownRight } from 'lucide-react';
import { Button } from './Button';
import styles from './CommentItem.module.css';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface CommentItemProps {
  id: string;
  author: string;
  content: string;
  time: string;
  initialLikes?: number;
  dict: any;
  replies?: Array<{
    id: string;
    author: string;
    content: string;
    time: string;
  }>;
  targetId?: string;
  targetType?: 'post' | 'quiz' | 'campaign';
  onReplySuccess?: () => void;
}

export function CommentItem({ 
  id, 
  author, 
  content, 
  time, 
  initialLikes = 0,
  dict,
  replies = [],
  targetId,
  targetType,
  onReplySuccess
}: CommentItemProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [commentReply, setCommentReply] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const isAuthenticated = status === 'authenticated';

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${window.location.pathname}`);
      return;
    }
    
    if (isLiking) return;
    setIsLiking(true);

    try {
      const res = await fetch(`/api/comments/${id}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        // data.liked boolean tells if user liked or unliked
        setLikes(prev => data.liked ? prev + 1 : prev - 1);
        setIsLiked(data.liked);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleReplyToggle = () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${window.location.pathname}`);
      return;
    }
    setShowReplyForm(!showReplyForm);
  };

  const handleReplySubmit = async () => {
    if (!isAuthenticated || !commentReply.trim() || !targetId || !targetType) return;
    
    setIsSubmittingReply(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [`${targetType}Id`]: targetId,
          content: commentReply,
          parentId: id
        })
      });

      if (res.ok) {
        setCommentReply('');
        setShowReplyForm(false);
        onReplySuccess?.();
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.comment}>
        <div className={styles.commentHeader}>
          <strong>{author}</strong>
          <span className={styles.time}>• {time}</span>
        </div>
        <p className={styles.content}>{content}</p>
        <div className={styles.commentActions}>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLike}
            disabled={isLiking}
            className={isLiked ? styles.activeLike : ''}
          >
            <ThumbsUp size={16} /> {dict.like} ({likes})
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleReplyToggle}
          >
            <MessageSquare size={16} /> {dict.reply}
          </Button>
        </div>

        {showReplyForm && (
          <div className={styles.replyForm}>
            <textarea 
              placeholder={dict.replyTo.replace('{author}', author)}
              className={styles.textarea}
              value={commentReply}
              onChange={(e) => setCommentReply(e.target.value)}
            />
            <div className={styles.replyActions}>
              <Button size="sm" variant="ghost" onClick={() => setShowReplyForm(false)} disabled={isSubmittingReply}>{dict.cancel}</Button>
              <Button size="sm" onClick={handleReplySubmit} disabled={!commentReply.trim() || isSubmittingReply}>
                {isSubmittingReply ? dict.loading || 'Gönderiliyor...' : dict.reply}
              </Button>
            </div>
          </div>
        )}
      </div>

      {replies.length > 0 && (
        <div className={styles.repliesList}>
          {replies.map(reply => (
             <div key={reply.id} className={styles.replyItem}>
                <CornerDownRight size={16} className={styles.replyIcon} />
                <div className={styles.comment}>
                  <div className={styles.commentHeader}>
                    <strong>{reply.author}</strong>
                    <span className={styles.time}>• {reply.time}</span>
                  </div>
                  <p className={styles.content}>{reply.content}</p>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
