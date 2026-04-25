import styles from "./page.module.css";
import SubjectCard from "@/components/SubjectCard";
import { SUBJECTS } from "@/data/subjects";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            Bienvenido a <span className={styles.highlight}>PharmaStudy</span>
          </h1>
          <p className={styles.subtitle}>
            Domina la Química y Farmacia con ejercicios dinámicos generados por IA.
          </p>
        </div>
        
        <div className={styles.grid}>
          {SUBJECTS.map((subject) => (
            <SubjectCard key={subject.slug} {...subject} />
          ))}
        </div>
      </main>
    </div>
  );
}
