'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './PracticeEngine.module.css';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function PracticeEngine({ slug, subjectName, subtopicSlug, subtopicName }) {
  const [exercise, setExercise] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [overridden, setOverridden] = useState(false);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const askedRef = useRef(new Set());

  const initRef = useRef(true);
  const fetchingRef = useRef(false);

  const addAsked = (exercises) => {
    const newOnes = [];
    for (const ex of exercises) {
      const key = (ex.question || '').slice(0, 80).toLowerCase();
      if (!askedRef.current.has(key)) {
        newOnes.push(ex);
        askedRef.current.add(key);
      }
    }
    return newOnes;
  };

  const fetchBatch = async () => {
    const previousQuestions = Array.from(askedRef.current).slice(-15);
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
      setLoading(true);
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
        setLoading(false);
        fetchingRef.current = false;
      }
    };
    init();
  }, [slug, subtopicSlug]);

  const submit = () => {
    if (!selected) return;
    const ok = selected === exercise.correctOptionId;
    setCorrect(ok);
    setScore(prev => ({ right: prev.right + (ok ? 1 : 0), total: prev.total + 1 }));
    setSubmitted(true);
  };

  const overrideCorrect = () => {
    setCorrect(true);
    setOverridden(true);
  };

  const next = async () => {
    setSelected(null);
    setSubmitted(false);
    setCorrect(false);
    setOverridden(false);
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
        <Link href={`/materia/${slug}`} className={styles.back}>← {subjectName}</Link>
        <div className={styles.topRight}>
          <span className={styles.badge}>{subtopicName}</span>
          <span className={styles.score}>{score.right}/{score.total}</span>
        </div>
      </div>

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
            <p className={styles.fbTitle}>{correct || overridden ? 'Correcto' : 'Incorrecto'}</p>
            {overridden && !correct && <p className={styles.overrideNote}>Marcado como correcto por el estudiante</p>}
            {!correct && !overridden && (
              <button onClick={overrideCorrect} className={styles.overrideBtn}>
                Yo tenía razón
              </button>
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