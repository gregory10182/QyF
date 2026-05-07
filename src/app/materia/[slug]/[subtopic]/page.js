import { notFound } from 'next/navigation';
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
      <PracticeEngine
        slug={slug}
        subjectName={subjectData.title}
        subtopicSlug={subtopic}
        subtopicName={subtopicData.title}
      />
    </div>
  );
}