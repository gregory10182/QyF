'use client';

import styles from '@/app/page.module.css';

export default function SubjectError({ reset }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Error</h1>
        <p className={styles.subtitle}>No se pudo cargar esta materia.</p>
      </header>
      <button onClick={reset} className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Reintentar</h2>
        </div>
      </button>
    </div>
  );
}