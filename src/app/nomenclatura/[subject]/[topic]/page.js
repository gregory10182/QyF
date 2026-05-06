import { notFound } from 'next/navigation';
import { NOMENCLATURE_TOPICS } from '@/data/subjects';
import NomenclatureEngine from '@/components/NomenclatureEngine';
import styles from '../../../page.module.css';

export default async function NomenclatureTopicPage({ params }) {
  const resolvedParams = await params;
  const { subject, topic } = resolvedParams;

  const group = NOMENCLATURE_TOPICS.find(g => g.slug === subject);
  if (!group) notFound();

  const topicData = group.items.find(i => i.slug === topic);
  if (!topicData) notFound();

  return (
    <div className={styles.page}>
      <NomenclatureEngine
        slug={subject}
        subjectName={group.title}
        subtopicSlug={topic}
        subtopicName={topicData.title}
      />
    </div>
  );
}