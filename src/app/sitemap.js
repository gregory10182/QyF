import { SUBJECTS, NOMENCLATURE_TOPICS } from '@/data/subjects';

export default function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qyfpf.cl';
  const now = new Date().toISOString();

  const staticPages = [
    { url: siteUrl, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${siteUrl}/nomenclatura`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
  ];

  const subjectPages = SUBJECTS.map((s) => ({
    url: `${siteUrl}/materia/${s.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const subtopicPages = SUBJECTS.flatMap((s) =>
    s.subtopics.map((sub) => ({
      url: `${siteUrl}/materia/${s.slug}/${sub.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  );

  const nomenclaturePages = NOMENCLATURE_TOPICS.flatMap((g) =>
    g.items.map((i) => ({
      url: `${siteUrl}/nomenclatura/${g.slug}/${i.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  );

  return [...staticPages, ...subjectPages, ...subtopicPages, ...nomenclaturePages];
}