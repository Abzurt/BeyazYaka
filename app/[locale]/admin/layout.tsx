import { AdminSidebar } from '@/components/layout/AdminSidebar';
import styles from './admin.module.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.wrapper}>
      <AdminSidebar />
      <main className={styles.content}>
        <div className={styles.pageContainer}>
          {children}
        </div>
      </main>
    </div>
  );
}
