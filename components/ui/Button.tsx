import styles from './Button.module.css';
import { LucideIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  fullWidth?: boolean;
  href?: string;
  loading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon, 
  fullWidth, 
  href,
  loading,
  className = '', 
  disabled,
  ...props 
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className
  ].join(' ');

  const content = (
    <>
      {loading ? (
        <Loader2 size={size === 'sm' ? 16 : 20} className={styles.spinner} />
      ) : (
        Icon && <Icon size={size === 'sm' ? 16 : 20} className={styles.icon} />
      )}
      {children}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
