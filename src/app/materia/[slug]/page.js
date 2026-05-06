import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SUBJECTS } from '@/data/subjects';
import styles from '../../page.module.css';

export default async function SubjectPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const subject = SUBJECTS.find(s => s.slug === slug);
  if (!subject) notFound();

  return (
    <div className={styles.page}>
      <Link href="/" className={styles.backLink}>← Materias</Link>

      <header className={styles.header}>
        <h1 className={styles.title}>{subject.icon} {subject.title}</h1>
        <p className={styles.subtitle}>{subject.description}</p>
      </header>

      <div className={styles.grid}>
        {subject.subtopics.map((subtopic) => (
          <Link
            key={subtopic.slug}
            href={`/materia/${slug}/${subtopic.slug}`}
            className={styles.card}
          >
            <div>
              <h2 className={styles.cardTitle}>{subtopic.title}</h2>
            </div>
            <span className={styles.arrow}>→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}