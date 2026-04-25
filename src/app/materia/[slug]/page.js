import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SUBJECTS } from '@/data/subjects';
import styles from '../../page.module.css';

export default async function SubjectPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const subject = SUBJECTS.find(s => s.slug === slug);
  
  if (!subject) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <Link href="/" style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'inline-block' }}>
            ← Volver a Materias
          </Link>
          <h1 className={styles.title}>
            {subject.title} {subject.icon}
          </h1>
          <p className={styles.subtitle}>
            Elige un subtema específico para enfocar tu práctica.
          </p>
        </div>
        
        <div className={styles.grid}>
          {subject.subtopics.map((subtopic) => (
            <Link 
              key={subtopic.slug} 
              href={`/materia/${slug}/${subtopic.slug}`}
              className={styles.subtopicCard}
            >
              <h3>{subtopic.title}</h3>
              <div className={styles.action}>
                <span>Practicar</span>
                <span className={styles.arrow}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
