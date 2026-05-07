import { notFound } from 'next/navigation';
import { NOMENCLATURE_TOPICS } from '@/data/subjects';
import NomenclatureEngine from '@/components/NomenclatureEngine';
import BreadcrumbJsonLd from '@/components/BreadcrumbJsonLd';
import styles from '../../../page.module.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://qyfpf.cl';

export async function generateMetadata({ params }) {
  const { subject, topic } = await params;
  const group = NOMENCLATURE_TOPICS.find(g => g.slug === subject);
  if (!group) return { title: 'Tema no encontrado' };
  const topicData = group.items.find(i => i.slug === topic);
  if (!topicData) return { title: 'Tema no encontrado' };
  const title = `${topicData.title} — ${group.title} — QyF PF`;
  const description = `Practica nomenclatura de ${topicData.title.toLowerCase()}.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/nomenclatura/${subject}/${topic}` },
    openGraph: { title, description, url: `${SITE_URL}/nomenclatura/${subject}/${topic}` },
  };
}

export default async function NomenclatureTopicPage({ params }) {
  const resolvedParams = await params;
  const { subject, topic } = resolvedParams;

  const group = NOMENCLATURE_TOPICS.find(g => g.slug === subject);
  if (!group) notFound();

  const topicData = group.items.find(i => i.slug === topic);
  if (!topicData) notFound();

  return (
    <div className={styles.page}>
      <BreadcrumbJsonLd items={[
        { name: 'Inicio', url: `${SITE_URL}` },
        { name: 'Nomenclatura', url: `${SITE_URL}/nomenclatura` },
        { name: topicData.title, url: `${SITE_URL}/nomenclatura/${subject}/${topic}` },
      ]} />
      <NomenclatureEngine
        slug={subject}
        subjectName={group.title}
        subtopicSlug={topic}
        subtopicName={topicData.title}
      />
    </div>
  );
}