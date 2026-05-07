import styles from '@/app/page.module.css';

export default function NomenclaturaLoading() {
  return (
    <div className={styles.page}>
      <div className={styles.backLink}>
        <div className="skeleton" style={{ width: '5rem', height: '0.85rem' }} />
      </div>
      <header className={styles.header}>
        <div className="skeleton" style={{ width: '40%', height: '1.75rem', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ width: '65%', height: '1rem' }} />
      </header>
      {Array.from({ length: 2 }).map((_, g) => (
        <div key={g} style={{ marginBottom: '1.5rem' }}>
          <div className="skeleton" style={{ width: '6rem', height: '0.75rem', marginBottom: '0.75rem' }} />
          <div className={styles.grid}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.card} style={{ pointerEvents: 'none' }}>
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '50%', height: '1rem' }} />
                </div>
                <div className="skeleton" style={{ width: '0.9rem', height: '0.9rem' }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}