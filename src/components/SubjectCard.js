import Link from 'next/link';
import styles from './SubjectCard.module.css';

export default function SubjectCard({ title, description, slug, icon }) {
  return (
    <Link href={`/materia/${slug}`} className={styles.card}>
      <div className={styles.iconWrapper}>
        <span className={styles.icon}>{icon}</span>
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      <div className={styles.action}>
        <span>Practicar ahora</span>
        <span className={styles.arrow}>→</span>
      </div>
    </Link>
  );
}
