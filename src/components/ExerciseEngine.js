'use client';

import { useState, useEffect } from 'react';
import styles from './ExerciseEngine.module.css';
import Link from 'next/link';

export default function ExerciseEngine({ slug, subjectName, subtopicSlug, subtopicName }) {
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const fetchExercise = async () => {
    setLoading(true);
    setError(null);
    setSelectedOption(null);
    setIsSubmitted(false);
    
    try {
      const response = await fetch('/api/exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: slug, subtopic: subtopicSlug }),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Error al cargar el ejercicio');
      
      setExercise(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercise();
  }, [slug, subtopicSlug]);

  const handleSubmit = () => {
    if (selectedOption) {
      setIsSubmitted(true);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}></div>
        <p style={{textAlign: 'center', color: '#94a3b8'}}>Generando un nuevo ejercicio con IA...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <h3>Algo salió mal</h3>
          <p>{error}</p>
          <button onClick={fetchExercise} className={styles.button}>Reintentar</button>
        </div>
      </div>
    );
  }

  if (!exercise) return null;

  const isCorrect = selectedOption === exercise.correctOptionId;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href={`/materia/${slug}`} className={styles.backButton}>← Volver a subtemas</Link>
        <span className={styles.badge}>{subjectName}: {subtopicName}</span>
      </div>
      
      <div className={styles.card}>
        <h2 className={styles.question}>{exercise.question}</h2>
        
        <div className={styles.optionsGrid}>
          {exercise.options.map((option) => {
            let optionClass = styles.option;
            if (selectedOption === option.id) {
              optionClass += ` ${styles.selected}`;
            }
            if (isSubmitted) {
              if (option.id === exercise.correctOptionId) {
                optionClass += ` ${styles.correct}`;
              } else if (selectedOption === option.id && !isCorrect) {
                optionClass += ` ${styles.incorrect}`;
              }
            }
            
            return (
              <button
                key={option.id}
                className={optionClass}
                onClick={() => !isSubmitted && setSelectedOption(option.id)}
                disabled={isSubmitted}
              >
                <span className={styles.optionLetter}>{option.id}</span>
                <span className={styles.optionText}>{option.text}</span>
              </button>
            );
          })}
        </div>

        {!isSubmitted ? (
          <button 
            className={styles.submitButton} 
            onClick={handleSubmit}
            disabled={!selectedOption}
          >
            Comprobar Respuesta
          </button>
        ) : (
          <div className={`${styles.feedback} ${isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect}`}>
            <h3>{isCorrect ? '¡Correcto! 🎉' : 'Incorrecto'}</h3>
            <p className={styles.explanation}>{exercise.explanation}</p>
            <button onClick={fetchExercise} className={styles.nextButton}>
              Siguiente Ejercicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
