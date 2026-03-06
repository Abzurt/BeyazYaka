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
}

export function CommentItem({ 
  id, 
  author, 
  content, 
  time, 
  initialLikes = 0,
  dict,
  replies = []
}: CommentItemProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [commentReply, setCommentReply] = useState('');

  const isAuthenticated = status === 'authenticated';

  const handleLike = () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${window.location.pathname}`);
      return;
    }
    
    if (isLiked) {
      setLikes(prev => prev - 1);
    } else {
      setLikes(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleReplyToggle = () => {
    if (!isAuthenticated) {
      router.push(`/login?callbackUrl=${window.location.pathname}`);
      return;
    }
    setShowReplyForm(!showReplyForm);
  };

  const handleReplySubmit = () => {
    if (!isAuthenticated) return;
    console.log(`Reply to ${id}:`, commentReply);
    setCommentReply('');
    setShowReplyForm(false);
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
              <Button size="sm" variant="ghost" onClick={() => setShowReplyForm(false)}>{dict.cancel}</Button>
              <Button size="sm" onClick={handleReplySubmit} disabled={!commentReply.trim()}>{dict.reply}</Button>
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
