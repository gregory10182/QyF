export function normalize(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s]+/g, ' ')
    .replace(/[().,\[\]{};:!?¡¿]/g, '')
    .trim();
}

export function fuzzyMatch(userInput, acceptableAnswers) {
  const norm = normalize(userInput);
  if (!norm) return false;

  for (const answer of acceptableAnswers) {
    const normAnswer = normalize(answer);
    if (norm === normAnswer) return true;
  }

  const sortedAnswers = [...acceptableAnswers].sort((a, b) => b.length - a.length);
  for (const answer of sortedAnswers) {
    const normAnswer = normalize(answer);
    if (!normAnswer) continue;
    if (norm === normAnswer) return true;
    if (normAnswer.length >= 4 && norm.includes(normAnswer)) return true;
    if (norm.length >= 4 && normAnswer.includes(norm)) return true;
  }

  for (const answer of acceptableAnswers) {
    const normAnswer = normalize(answer);
    if (Math.abs(norm.length - normAnswer.length) <= 1 && normAnswer.length >= 3) {
      let diff = 0;
      const maxLen = Math.max(norm.length, normAnswer.length);
      for (let i = 0; i < maxLen; i++) {
        if (norm[i] !== normAnswer[i]) diff++;
        if (diff > 1) break;
      }
      if (diff <= 1) return true;
    }
  }

  return false;
}