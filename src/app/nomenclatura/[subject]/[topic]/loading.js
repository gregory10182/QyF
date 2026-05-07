import styles from '@/app/page.module.css';

export default function NomenclatureTopicLoading() {
  return (
    <div className={styles.page}>
      <p style={{ color: 'var(--text-dim)', textAlign: 'center' }}>Cargando ejercicio...</p>
    </div>
  );
}