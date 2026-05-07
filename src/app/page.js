import styles from "./page.module.css";
import { SUBJECTS, NOMENCLATURE_TOPICS } from "@/data/subjects";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logoRow}>
          <Image src="/logo.svg" alt="QyF PF" width={150} height={44} priority />
        </div>
        <p className={styles.subtitle}>
          Practica para Química y Farmacia.
        </p>
      </header>

      <Link href="/nomenclatura" className={styles.nomCard} style={{ animationDelay: '0.1s' }}>
        <span className={styles.nomIcon}>🏷️</span>
        <div>
          <h2 className={styles.cardTitle}>Nomenclatura</h2>
          <p className={styles.cardDesc}>Practica nombre → fórmula y fórmula → nombre</p>
        </div>
        <span className={styles.arrow}>→</span>
      </Link>

      <div className={styles.sectionLabel} style={{ animationDelay: '0.15s' }}>Ejercicios por materia</div>

      <div className={styles.grid}>
        {SUBJECTS.map((subject, i) => (
          <Link
            key={subject.slug}
            href={`/materia/${subject.slug}`}
            className={styles.card}
            style={{ animationDelay: `${0.2 + i * 0.06}s` }}
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