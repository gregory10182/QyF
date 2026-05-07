import Link from 'next/link';
import styles from '@/app/page.module.css';

export default function SubjectNotFound() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Materia no encontrada</h1>
        <p className={styles.subtitle}>Esa materia no existe.</p>
      </header>
      <Link href="/" className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>← Volver al inicio</h2>
        </div>
      </Link>
    </div>
  );
}