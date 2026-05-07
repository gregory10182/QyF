'use client';

import styles from '@/app/page.module.css';

export default function Error({ reset }) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Algo salió mal</h1>
        <p className={styles.subtitle}>Ocurrió un error inesperado.</p>
      </header>
      <button onClick={reset} className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>Reintentar</h2>
        </div>
      </button>
    </div>
  );
}