import { notFound } from 'next/navigation';
import { SUBJECTS } from '@/data/subjects';
import PracticeEngine from '@/components/PracticeEngine';
import styles from '../../../page.module.css';

export default async function SubtopicPage({ params }) {
  const resolvedParams = await params;
  const { slug, subtopic } = resolvedParams;

  const subjectData = SUBJECTS.find(s => s.slug === slug);
  if (!subjectData) notFound();

  const subtopicData = subjectData.subtopics.find(s => s.slug === subtopic);
  if (!subtopicData) notFound();

  return (
    <div className={styles.page}>
      <PracticeEngine
        slug={slug}
        subjectName={subjectData.title}
        subtopicSlug={subtopic}
        subtopicName={subtopicData.title}
      />
    </div>
  );
}