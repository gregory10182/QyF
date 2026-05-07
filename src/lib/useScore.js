'use client';

import { useState, useEffect, useCallback } from 'react';

export function useScore(key) {
  const [score, setScore] = useState({ right: 0, total: 0 });
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const data = JSON.parse(saved);
        setScore({ right: data.right || 0, total: data.total || 0 });
        setBestStreak(data.bestStreak || 0);
      }
    } catch {}
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(key, JSON.stringify({
        right: score.right,
        total: score.total,
        bestStreak,
      }));
    } catch {}
  }, [key, score, bestStreak, loaded]);

  const recordAnswer = useCallback((ok) => {
    setScore(prev => ({ right: prev.right + (ok ? 1 : 0), total: prev.total + 1 }));
    setStreak(prev => {
      const next = ok ? prev + 1 : 0;
      setBestStreak(best => Math.max(best, next));
      return next;
    });
  }, []);

  const clearScore = useCallback(() => {
    setScore({ right: 0, total: 0 });
    setStreak(0);
    setBestStreak(0);
    try { localStorage.removeItem(key); } catch {}
  }, [key]);

  const accuracy = score.total > 0 ? Math.round((score.right / score.total) * 100) : 0;

  return { score, streak, bestStreak, accuracy, recordAnswer, clearScore };
}