import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SUBJECTS } from '@/data/subjects';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import styles from '../../page.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://qyfpf.cl';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const subject = SUBJECTS.find(s => s.slug === slug);
  if (!subject) return { title: 'Materia no encontrada' };
  return {
    title: `${subject.icon} ${subject.title} — QyF PF`,
    description: subject.description,
    alternates: { canonical: `${SITE_URL}/materia/${slug}` },
    openGraph: {
      title: `${subject.icon} ${subject.title} — QyF PF`,
      description: subject.description,
      url: `${SITE_URL}/materia/${slug}`,
    },
  };
}

export default async function SubjectPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const subject = SUBJECTS.find(s => s.slug === slug);
  if (!subject) notFound();

  return (
    <div className={styles.page}>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: `${SITE_URL}` },
        { name: subject.title, url: `${SITE_URL}/materia/${slug}` },
      ]} />
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