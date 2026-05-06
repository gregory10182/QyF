'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './ReactionEngine.module.css';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { fuzzyMatch } from '@/lib/match';

export default function ReactionEngine({ slug, subjectName, subtopicSlug, subtopicName }) {
  const [exercise, setExercise] = useState(null);
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [overridden, setOverridden] = useState(false);
  const askedRef = useRef(new Set());

  const initRef = useRef(true);
  const fetchingRef = useRef(false);

  const addAsked = (exercises) => {
    const newOnes = [];
    for (const ex of exercises) {
      const key = ((ex.reaction || '') + '|' + (ex.question || '')).slice(0, 80).toLowerCase();
      if (!askedRef.current.has(key)) {
        newOnes.push(ex);
        askedRef.current.add(key);
      }
    }
    return newOnes;
  };

  const fetchBatch = async () => {
    const previousQuestions = Array.from(askedRef.current).slice(-15);
    const res = await fetch('/api/reaction', {
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

  const isChoice = () => exercise && (exercise.type === 'identify-type' || exercise.type === 'mechanism');

  const submit = () => {
    if (isChoice()) {
      if (!selectedOption) return;
      setCorrect(selectedOption === exercise.correctOptionId);
    } else {
      if (!userAnswer.trim()) return;
      setCorrect(fuzzyMatch(userAnswer, exercise.acceptableAnswers));
    }
    setSubmitted(true);
  };

  const overrideCorrect = () => {
    setCorrect(true);
    setOverridden(true);
  };

  const next = async () => {
    setSelectedOption(null);
    setUserAnswer('');
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

  const typeLabel = (type) => {
    switch (type) {
      case 'identify-type': return 'Identificar tipo';
      case 'mechanism': return 'Mecanismo';
      case 'complete-reaction': return 'Completar reacción';
      default: return 'Reacción';
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
        <span className={styles.badge}>{subtopicName}</span>
      </div>

      <div className={styles.card}>
        <span className={styles.typeTag}>{typeLabel(exercise.type)}</span>

        {exercise.reaction && (
          <div className={styles.reactionBox}>
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {exercise.reaction}
            </ReactMarkdown>
          </div>
        )}

        <div className={styles.question}>
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {exercise.question}
          </ReactMarkdown>
        </div>

        {isChoice() ? (
          <div className={styles.options}>
            {exercise.options.map((opt) => {
              let cls = styles.option;
              if (selectedOption === opt.id) cls += ` ${styles.selected}`;
              if (submitted && opt.id === exercise.correctOptionId) cls += ` ${styles.correct}`;
              if (submitted && selectedOption === opt.id && !correct) cls += ` ${styles.incorrect}`;

              return (
                <button
                  key={opt.id}
                  className={cls}
                  onClick={() => !submitted && setSelectedOption(opt.id)}
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
        ) : (
          <div className={styles.inputRow}>
            <input
              type="text"
              className={`${styles.input} ${submitted ? (correct ? styles.inputOk : styles.inputErr) : ''}`}
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !submitted && userAnswer.trim() && submit()}
              placeholder="Escribe los productos..."
              disabled={submitted}
              autoFocus
            />
          </div>
        )}

        {!submitted ? (
          <button
            className={styles.submitBtn}
            onClick={submit}
            disabled={isChoice() ? !selectedOption : !userAnswer.trim()}
          >
            Comprobar
          </button>
        ) : (
          <div className={`${styles.feedback} ${correct ? styles.fbOk : styles.fbErr}`}>
            <p className={styles.fbTitle}>{correct || overridden ? 'Correcto' : 'Incorrecto'}</p>
            {overridden && !correct && <p className={styles.overrideNote}>Marcado como correcto por el estudiante</p>}
            {!correct && !overridden && exercise.displayAnswer && (
              <div className={styles.answerBox}>
                <strong>Respuesta:</strong>
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {exercise.displayAnswer}
                </ReactMarkdown>
              </div>
            )}
            {!correct && !overridden && isChoice() && (
              <button onClick={overrideCorrect} className={styles.overrideBtn}>
                Yo tenía razón
              </button>
            )}
            {!correct && !overridden && !isChoice() && (
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