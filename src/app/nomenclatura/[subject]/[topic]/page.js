import { notFound } from 'next/navigation';
import { Suspense } from 'react';
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
      <Suspense fallback={<NomenclatureTopicSkeleton />}>
        <NomenclatureEngine
          slug={subject}
          subjectName={group.title}
          subtopicSlug={topic}
          subtopicName={topicData.title}
        />
      </Suspense>
    </div>
  );
}

function NomenclatureTopicSkeleton() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div className="skeleton" style={{ width: '7rem', height: '0.85rem' }} />
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: '4rem', height: '1.4rem', borderRadius: '0.25rem' }} />
          <div className="skeleton" style={{ width: '2rem', height: '0.8rem' }} />
        </div>
      </div>
      <div style={{ width: '100%', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1rem' }}>
        <div className="skeleton" style={{ width: '50%', height: '100%' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
        <div className="skeleton" style={{ width: '4rem', height: '2rem', borderRadius: '0.5rem' }} />
        <div className="skeleton" style={{ width: '6.5rem', height: '2rem', borderRadius: '0.5rem' }} />
        <div className="skeleton" style={{ width: '6.5rem', height: '2rem', borderRadius: '0.5rem' }} />
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '2rem' }}>
        <div className="skeleton" style={{ width: '40%', height: '0.8rem', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ width: '70%', height: '1.25rem', marginBottom: '1.5rem' }} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="skeleton" style={{ flex: 1, height: '2.75rem', borderRadius: '0.5rem' }} />
          <div className="skeleton" style={{ width: '6rem', height: '2.75rem', borderRadius: '0.5rem' }} />
        </div>
      </div>
    </>
  );
}