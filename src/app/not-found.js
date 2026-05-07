import Link from 'next/link';
import styles from '@/app/page.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.subtitle}>Página no encontrada.</p>
      </header>
      <Link href="/" className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>← Volver al inicio</h2>
        </div>
      </Link>
    </div>
  );
}