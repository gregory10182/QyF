import styles from '@/app/page.module.css';

export default function Loading() {
  return (
    <div className={styles.page}>
      <div className={styles.backLink}>
        <div className="skeleton" style={{ width: '5rem', height: '0.85rem' }} />
      </div>
      <header className={styles.header}>
        <div className="skeleton" style={{ width: '50%', height: '1.75rem', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ width: '70%', height: '1rem' }} />
      </header>
      <div className={styles.grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={styles.card} style={{ pointerEvents: 'none' }}>
            <div className="skeleton" style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.25rem', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '45%', height: '1rem', marginBottom: '0.4rem' }} />
              <div className="skeleton" style={{ width: '75%', height: '0.75rem' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}