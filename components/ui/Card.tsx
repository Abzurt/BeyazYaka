import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  interactive?: boolean;
  className?: string;
  footer?: React.ReactNode;
}

export function Card({ 
  children, 
  title, 
  subtitle, 
  interactive = false, 
  className = '', 
  footer 
}: CardProps) {
  return (
    <div className={`${styles.card} ${interactive ? styles.interactive : ''} ${className}`}>
      {(title || subtitle) && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      )}
      <div className={styles.content}>
        {children}
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
