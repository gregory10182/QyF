'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './NomenclatureEngine.module.css';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { fuzzyMatch } from '@/lib/match';
import { useScore } from '@/lib/useScore';

export default function NomenclatureEngine({ slug, subjectName, subtopicSlug, subtopicName }) {
  const [exercise, setExercise] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [direction, setDirection] = useState('mixed');
  const { score, streak, bestStreak, accuracy, recordAnswer } = useScore(`qyf-nomen-${slug}-${subtopicSlug}`);
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

  const fetchBatch = async (dir) => {
    const previousQuestions = Array.from(askedRef.current).slice(-25);
    const res = await fetch('/api/nomenclature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: slug,
        subtopic: subtopicSlug,
        direction: dir || direction,
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
      setLoading(true);
      setError(null);
      try {
        const exercises = await fetchBatch(direction);
        if (exercises?.length) {
          setExercise(exercises[0]);
          setQueue(exercises.slice(1));
        }
        initRef.current = false;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };
    init();
  }, [slug, subtopicSlug]);

  const changeDirection = async (newDir) => {
    setDirection(newDir);
    setUserAnswer('');
    setSubmitted(false);
    setCorrect(false);
    setExercise(null);
    setLoading(true);
    setError(null);
    try {
      const exercises = await fetchBatch(newDir);
      if (exercises?.length) {
        setExercise(exercises[0]);
        setQueue(exercises.slice(1));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    if (!userAnswer.trim()) return;
    const ok = fuzzyMatch(userAnswer, exercise.acceptableAnswers);
    setCorrect(ok);
    recordAnswer(ok);
    setSubmitted(true);
  };

  const next = async () => {
    setUserAnswer('');
    setSubmitted(false);
    setCorrect(false);
    if (queue.length > 0) {
      setExercise(queue[0]);
      setQueue(prev => prev.slice(1));
    } else {
      setLoading(true);
      try {
        const exercises = await fetchBatch();
        if (exercises?.length) {
          setExercise(exercises[0]);
          setQueue(exercises.slice(1));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const retry = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  if (!exercise) return null;

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loader} />
        <p className={styles.loadingText}>Generando ejercicio...</p>
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

  if (!exercise) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.topBar}>
        <Link href="/nomenclatura" className={styles.back}>← Nomenclatura</Link>
        <div className={styles.stats}>
          <span className={styles.badge}>{subtopicName}</span>
          <span className={styles.streak}>{streak > 0 ? `🔥 ${streak}` : ''}</span>
          <span className={styles.score}>{score.right}/{score.total}</span>
          {score.total > 0 && <span className={styles.accuracy}>{accuracy}%</span>}
        </div>
      </div>

      <h1 className="sr-only">{subtopicName} — Nomenclatura</h1>

      {score.total > 0 && (
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${accuracy}%` }} />
        </div>
      )}

      <div className={styles.directionRow}>
        {[
          { key: 'mixed', label: 'Mixto' },
          { key: 'name-to-formula', label: 'Nombre → Fórmula' },
          { key: 'formula-to-name', label: 'Fórmula → Nombre' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.dirBtn} ${direction === key ? styles.dirActive : ''}`}
            onClick={() => changeDirection(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <span className={styles.dirLabel}>
          {exercise.direction === 'name-to-formula' ? 'Nombre → Fórmula' : 'Fórmula → Nombre'}
        </span>

        <div className={styles.question}>
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {exercise.question}
          </ReactMarkdown>
        </div>

        <div className={styles.inputRow}>
          <input
            type="text"
            className={`${styles.input} ${submitted ? (correct ? styles.inputOk : styles.inputErr) : ''}`}
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !submitted && userAnswer.trim() && submit()}
            placeholder={exercise.direction === 'name-to-formula' ? 'Escribe la fórmula...' : 'Escribe el nombre...'}
            disabled={submitted}
            autoFocus
          />
          {!submitted ? (
            <button className={styles.submitBtn} onClick={submit} disabled={!userAnswer.trim()}>
              Comprobar
            </button>
          ) : (
            <button className={styles.nextBtn} onClick={next}>Siguiente</button>
          )}
        </div>

        {submitted && (
          <div className={`${styles.feedback} ${correct ? styles.fbOk : styles.fbErr}`}>
            <p className={styles.fbTitle}>{correct ? '¡Correcto!' : 'Incorrecto'}</p>
            {streak > 1 && correct && <p className={styles.streakMsg}>🔥 ¡{streak} seguidas!</p>}
            {!correct && (
              <div className={styles.answerBox}>
                <strong>Respuesta:</strong>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {exercise.displayAnswer}
                </ReactMarkdown>
              </div>
            )}
            <div className={styles.explanation}>
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {exercise.explanation}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}