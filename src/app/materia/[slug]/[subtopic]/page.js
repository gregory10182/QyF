import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { SUBJECTS } from '@/data/subjects';
import PracticeEngine from '@/components/PracticeEngine';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import styles from '../../../page.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://qyfpf.cl';

export async function generateMetadata({ params }) {
  const { slug, subtopic } = await params;
  const subjectData = SUBJECTS.find(s => s.slug === slug);
  if (!subjectData) return { title: 'Ejercicio no encontrado' };
  const subtopicData = subjectData.subtopics.find(s => s.slug === subtopic);
  if (!subtopicData) return { title: 'Ejercicio no encontrado' };
  const title = `${subtopicData.title} — ${subjectData.title} — QyF PF`;
  const description = `Practica ${subtopicData.title.toLowerCase()} con ejercicios generados por IA.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/materia/${slug}/${subtopic}` },
    openGraph: { title, description, url: `${SITE_URL}/materia/${slug}/${subtopic}` },
  };
}

export default async function SubtopicPage({ params }) {
  const resolvedParams = await params;
  const { slug, subtopic } = resolvedParams;

  const subjectData = SUBJECTS.find(s => s.slug === slug);
  if (!subjectData) notFound();

  const subtopicData = subjectData.subtopics.find(s => s.slug === subtopic);
  if (!subtopicData) notFound();

  return (
    <div className={styles.page}>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: `${SITE_URL}` },
        { name: subjectData.title, url: `${SITE_URL}/materia/${slug}` },
        { name: subtopicData.title, url: `${SITE_URL}/materia/${slug}/${subtopic}` },
      ]} />
      <Suspense fallback={<SubtopicSkeleton />}>
        <PracticeEngine
          slug={slug}
          subjectName={subjectData.title}
          subtopicSlug={subtopic}
          subtopicName={subtopicData.title}
        />
      </Suspense>
    </div>
  );
}

function SubtopicSkeleton() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div className="skeleton" style={{ width: '6rem', height: '0.85rem' }} />
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: '4rem', height: '1.4rem', borderRadius: '0.25rem' }} />
          <div className="skeleton" style={{ width: '2rem', height: '0.8rem' }} />
        </div>
      </div>
      <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1.5rem' }}>
        <div className="skeleton" style={{ width: '50%', height: '100%' }} />
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '2rem' }}>
        <div className="skeleton" style={{ width: '75%', height: '1.15rem', marginBottom: '1.5rem' }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
            <div className="skeleton" style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.25rem', flexShrink: 0 }} />
            <div className="skeleton" style={{ flex: 1, height: '0.95rem' }} />
          </div>
        ))}
        <div className="skeleton" style={{ width: '100%', height: '2.75rem', marginTop: '0.5rem', borderRadius: '0.5rem' }} />
      </div>
    </>
  );
}