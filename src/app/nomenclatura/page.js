import Link from 'next/link';
import { NOMENCLATURE_TOPICS } from '@/data/subjects';
import styles from '../page.module.css';

export default function NomenclaturaPage() {
  return (
    <div className={styles.page}>
      <Link href="/" className={styles.backLink}>← Inicio</Link>

      <header className={styles.header}>
        <h1 className={styles.title}>🏷️ Nomenclatura</h1>
        <p className={styles.subtitle}>
          Practica nombre → fórmula y fórmula → nombre para compuestos químicos.
        </p>
      </header>

      {NOMENCLATURE_TOPICS.map((group) => (
        <div key={group.slug} style={{ marginBottom: '1.5rem' }}>
          <h2 className={styles.sectionLabel}>{group.title}</h2>
          <div className={styles.grid}>
            {group.items.map((item) => (
              <Link
                key={item.slug}
                href={`/nomenclatura/${group.slug}/${item.slug}`}
                className={styles.card}
              >
                <div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                </div>
                <span className={styles.arrow}>→</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}