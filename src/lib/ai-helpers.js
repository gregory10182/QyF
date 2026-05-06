const LATEX_COMMANDS = [
  'text', 'mathrm', 'left', 'right', 'frac', 'sqrt',
  'rightarrow', 'leftarrow', 'Rightarrow', 'Leftarrow',
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta',
  'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho',
  'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega',
  'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Phi', 'Psi', 'Omega',
  'infty', 'partial', 'nabla',
  'approx', 'equiv', 'neq', 'leq', 'geq', 'pm',
  'cdot', 'times', 'div',
  'sum', 'prod', 'int',
  'subset', 'subseteq', 'supset', 'supseteq', 'in', 'notin',
  'cup', 'cap', 'emptyset',
  'quad', 'qquad', 'hspace',
  'overline', 'underline', 'hat', 'tilde', 'vec', 'dot', 'ddot',
  'begin', 'end', 'array', 'matrix', 'pmatrix', 'bmatrix',
];

function escapeLatexInJSON(str) {
  let result = str;
  for (const cmd of LATEX_COMMANDS) {
    const regex = new RegExp(`\\\\${cmd}(?![a-zA-Z])`, 'g');
    result = result.replace(regex, `\\\\${cmd}`);
  }
  return result;
}

export function sanitizeAIResponse(text) {
  let cleaned = text.trim();

  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  cleaned = escapeLatexInJSON(cleaned);

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    try {
      const fixed = fixDoubleBackslashes(cleaned);
      parsed = JSON.parse(fixed);
    } catch {
      throw new Error('No se pudo parsear la respuesta de la IA.');
    }
  }

  return walkJSON(parsed);
}

function fixDoubleBackslashes(str) {
  return str.replace(/\\\\([^"\\bfnrtu])/g, '\\$1');
}

function walkJSON(obj) {
  if (typeof obj === 'string') {
    return cleanLatexString(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(walkJSON);
  }
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const key of Object.keys(obj)) {
      result[key] = walkJSON(obj[key]);
    }
    return result;
  }
  return obj;
}

function cleanLatexString(str) {
  str = str.replace(/\$\$\s*([^$]+?)\s*\$\$/g, '$$$1$$');

  str = str.replace(/`/g, '');

  str = str.replace(/(\d+(?:[.,]\d+)?)\s*,?\s*(g|mL|L|kg|mol|mmol|cm³|°C|K|atm|mmHg|torr|Pa|J|kJ|cal|kcal|M|%|ppm|eq)\b/gi, (match, num, unit) => `$${num} \\text{${unit}}$`);

  return str;
}