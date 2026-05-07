import Link from 'next/link';
import { NOMENCLATURE_TOPICS } from '@/data/subjects';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import styles from '../page.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://qyfpf.cl';

export const metadata = {
  title: '🏷️ Nomenclatura — QyF PF',
  description: 'Practica nomenclatura química: nombre → fórmula y fórmula → nombre.',
  alternates: { canonical: `${SITE_URL}/nomenclatura` },
  openGraph: {
    title: '🏷️ Nomenclatura — QyF PF',
    description: 'Practica nomenclatura química: nombre → fórmula y fórmula → nombre.',
    url: `${SITE_URL}/nomenclatura`,
  },
};

export default function NomenclaturaPage() {
  return (
    <div className={styles.page}>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: `${SITE_URL}` },
        { name: 'Nomenclatura', url: `${SITE_URL}/nomenclatura` },
      ]} />
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