import styles from "./page.module.css";
import { SUBJECTS, NOMENCLATURE_TOPICS } from "@/data/subjects";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>QyF PF</h1>
        <p className={styles.subtitle}>
          Practica para Química y Farmacia USACH.
        </p>
      </header>

      <Link href="/nomenclatura" className={styles.nomCard}>
        <span className={styles.nomIcon}>🏷️</span>
        <div>
          <h2 className={styles.cardTitle}>Nomenclatura</h2>
          <p className={styles.cardDesc}>Practica nombre → fórmula y fórmula → nombre</p>
        </div>
        <span className={styles.arrow}>→</span>
      </Link>

      <div className={styles.sectionLabel}>Ejercicios por materia</div>

      <div className={styles.grid}>
        {SUBJECTS.map((subject) => (
          <Link
            key={subject.slug}
            href={`/materia/${subject.slug}`}
            className={styles.card}
          >
            <span className={styles.icon}>{subject.icon}</span>
            <div>
              <h2 className={styles.cardTitle}>{subject.title}</h2>
              <p className={styles.cardDesc}>{subject.description}</p>
            </div>
            <span className={styles.arrow}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}