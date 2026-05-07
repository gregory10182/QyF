import styles from '@/app/page.module.css';

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div style={{ width: '40%', height: '1.75rem', background: 'var(--surface)', borderRadius: '0.5rem' }} />
        <div style={{ width: '60%', height: '1rem', background: 'var(--surface)', borderRadius: '0.25rem', marginTop: '0.5rem' }} />
      </div>
    </div>
  );
}