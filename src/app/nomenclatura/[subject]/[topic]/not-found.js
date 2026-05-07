import Link from 'next/link';
import styles from '@/app/page.module.css';

export default function NomenclatureTopicNotFound() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Tema no encontrado</h1>
        <p className={styles.subtitle}>Ese tema de nomenclatura no existe.</p>
      </header>
      <Link href="/nomenclatura" className={styles.card}>
        <div>
          <h2 className={styles.cardTitle}>← Volver a nomenclatura</h2>
        </div>
      </Link>
    </div>
  );
}