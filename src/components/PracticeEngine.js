'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './PracticeEngine.module.css';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useScore } from '@/lib/useScore';

export default function PracticeEngine({ slug, subjectName, subtopicSlug, subtopicName }) {
  const [exercise, setExercise] = useState(null);
  const [queue, setQueue] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const { score, streak, bestStreak, accuracy, recordAnswer } = useScore(`qyf-practice-${slug}-${subtopicSlug}`);
  const askedRef = useRef(new Set());

  const initRef = useRef(true);
  const fetchingRef = useRef(false);

  const addAsked = (exercises) => {
    const newOnes = [];
    for (const ex of exercises) {
      const key = (ex.question || '').slice(0, 120).toLowerCase();
      if (!askedRef.current.has(key)) {
        newOnes.push(ex);
        askedRef.current.add(key);
      }
    }
    return newOnes;
  };

  const fetchBatch = async () => {
    const previousQuestions = Array.from(askedRef.current).slice(-25);
    const res = await fetch('/api/exercise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: slug,
        subtopic: subtopicSlug,
        previousQuestions,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al cargar ejercicio');
    return addAsked(data.exercises || []);
  };

  useEffect(() => {
    if (!initRef.current || fetchingRef.current) return;
    const init = async () => {
      fetchingRef.current = true;
      setFetching(true);
      setError(null);
      try {
        const exercises = await fetchBatch();
        if (exercises?.length) {
          setExercise(exercises[0]);
          setQueue(exercises.slice(1));
        }
        initRef.current = false;
      } catch (err) {
        setError(err.message);
      } finally {
        setFetching(false);
        fetchingRef.current = false;
      }
    };
    init();
  }, [slug, subtopicSlug]);

  const submit = () => {
    if (!selected) return;
    const ok = selected === exercise.correctOptionId;
    setCorrect(ok);
    recordAnswer(ok);
    setSubmitted(true);
  };

  const next = async () => {
    setSelected(null);
    setSubmitted(false);
    setCorrect(false);
    if (queue.length > 0) {
      setExercise(queue[0]);
      setQueue(prev => prev.slice(1));
    } else {
      setFetching(true);
      try {
        const exercises = await fetchBatch();
        if (exercises?.length) {
          setExercise(exercises[0]);
          setQueue(exercises.slice(1));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setFetching(false);
      }
    }
  };

  const retry = async () => {
    setFetching(true);
    setError(null);
    try {
      const exercises = await fetchBatch();
      if (exercises?.length) {
        setExercise(exercises[0]);
        setQueue(exercises.slice(1));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const isLoading = !exercise && !error;

  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.skeletonTopBar}>
          <div className="skeleton" style={{ width: '6rem', height: '0.85rem' }} />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div className="skeleton" style={{ width: '4rem', height: '1.4rem', borderRadius: '0.25rem' }} />
            <div className="skeleton" style={{ width: '2rem', height: '0.8rem' }} />
          </div>
        </div>
        <div className={styles.skeletonCard}>
          <div className="skeleton" style={{ width: '75%', height: '1.15rem', marginBottom: '1.5rem' }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonOption}>
              <div className="skeleton" style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.25rem', flexShrink: 0 }} />
              <div className="skeleton" style={{ flex: 1, height: '0.95rem' }} />
            </div>
          ))}
          <div className="skeleton" style={{ width: '100%', height: '2.75rem', marginTop: '0.5rem', borderRadius: '0.5rem' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.errorBox}>
          <p>{error}</p>
          <button onClick={retry} className={styles.retryBtn}>Reintentar</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h1 className="sr-only">{subtopicName} — {subjectName}</h1>
      <div className={styles.topBar}>
        <Link href={`/materia/${slug}`} className={styles.back}>← {subjectName}</Link>
        <div className={styles.stats}>
          <span className={styles.badge}>{subtopicName}</span>
          <span className={styles.streak}>{streak > 0 ? `🔥 ${streak}` : ''}</span>
          <span className={styles.score}>{score.right}/{score.total}</span>
          {score.total > 0 && <span className={styles.accuracy}>{accuracy}%</span>}
        </div>
      </div>

      {score.total > 0 && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${accuracy}%` }} />
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.question}>
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {exercise.question}
          </ReactMarkdown>
        </div>

        <div className={styles.options}>
          {exercise.options.map((opt) => {
            let cls = styles.option;
            if (selected === opt.id) cls += ` ${styles.selected}`;
            if (submitted && opt.id === exercise.correctOptionId) cls += ` ${styles.correct}`;
            if (submitted && selected === opt.id && !correct) cls += ` ${styles.incorrect}`;

            return (
              <button
                key={opt.id}
                className={cls}
                onClick={() => !submitted && setSelected(opt.id)}
                disabled={submitted}
              >
                <span className={styles.letter}>{opt.id}</span>
                <span className={styles.optText}>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {opt.text}
                  </ReactMarkdown>
                </span>
              </button>
            );
          })}
        </div>

        {!submitted ? (
          <button className={styles.submitBtn} onClick={submit} disabled={!selected}>
            Comprobar
          </button>
        ) : (
          <div className={`${styles.feedback} ${correct ? styles.fbOk : styles.fbErr}`}>
            <p className={styles.fbTitle}>{correct ? '¡Correcto!' : 'Incorrecto'}</p>
            {streak > 1 && correct && <p className={styles.streakMsg}>🔥 ¡{streak} seguidas!</p>}
            {!correct && (
              <div className={styles.answerBox}>
                <strong>Respuesta correcta:</strong>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {exercise.options.find(o => o.id === exercise.correctOptionId)?.text}
                </ReactMarkdown>
              </div>
            )}
            <div className={styles.explanation}>
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {exercise.explanation}
              </ReactMarkdown>
            </div>
            <button onClick={next} className={styles.nextBtn}>Siguiente</button>
          </div>
        )}
      </div>
    </div>
  );
}