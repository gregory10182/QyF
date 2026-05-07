import { NOMENCLATURE_TOPICS } from '@/data/subjects';
import { callGroq, sanitizeAIResponse } from '@/lib/ai-helpers';

function validateExercises(data) {
  if (!data?.exercises || !Array.isArray(data.exercises)) return [];
  return data.exercises.filter(ex => {
    if (!ex.question || ex.question.trim().length < 5) return false;
    if (!ex.acceptableAnswers || !Array.isArray(ex.acceptableAnswers) || ex.acceptableAnswers.length === 0) return false;
    if (!ex.displayAnswer || ex.displayAnswer.trim().length < 2) return false;
    if (!ex.direction) ex.direction = 'name-to-formula';
    if (!ex.explanation || ex.explanation.trim().length < 15) {
      ex.explanation = `La respuesta correcta es: ${ex.displayAnswer}.`;
    }
    return true;
  });
}

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Cuerpo de la petición inválido.' }, { status: 400 });
    }

    const { subject, subtopic, direction, previousQuestions } = body;
    if (!subject || typeof subject !== 'string' || !subtopic || typeof subtopic !== 'string') {
      return Response.json({ error: 'Los campos "subject" y "subtopic" son obligatorios.' }, { status: 400 });
    }
    if (direction && !['name-to-formula', 'formula-to-name', 'mixed'].includes(direction)) {
      return Response.json({ error: '"direction" debe ser "name-to-formula", "formula-to-name" o "mixed".' }, { status: 400 });
    }
    if (previousQuestions && !Array.isArray(previousQuestions)) {
      return Response.json({ error: '"previousQuestions" debe ser un arreglo.' }, { status: 400 });
    }
    if (!process.env.GROQ_API_KEY) {
      return Response.json(
        { error: 'La API key de Groq no está configurada.' },
        { status: 500 }
      );
    }

    const group = NOMENCLATURE_TOPICS.find(g => g.slug === subject);
    const topicData = group?.items.find(i => i.slug === subtopic);
    const subjectName = group ? group.title : subject;
    const subtopicName = topicData ? topicData.title : subtopic;

    const directionInstruction = direction === 'name-to-formula'
      ? 'Todas las preguntas dan el nombre del compuesto y el estudiante escribe la fórmula química.'
      : direction === 'formula-to-name'
      ? 'Todas las preguntas dan la fórmula química y el estudiante escribe el nombre del compuesto.'
      : 'Alterna: algunas preguntas dan el nombre y piden la fórmula, otras dan la fórmula y piden el nombre.';

    const prompt = `Eres un profesor universitario experto en nomenclatura química de ${subjectName}, específicamente en "${subtopicName}".

Genera 3 ejercicios de nomenclatura para un estudiante de farmacia/química.
${directionInstruction}

REGLAS ESTRICTAS:
- El campo "acceptableAnswers" DEBE contener TODAS las formas válidas de escribir la respuesta: con/sin tildes, convenios Stock, IUPAC, tradicional, variaciones de espacios y mayúsculas. Sé generoso.
- El primer elemento de "acceptableAnswers" debe ser la respuesta más estándar/canónica.
- El campo "explanation" es OBLIGATORIO y debe tener al menos 2 oraciones explicando la nomenclatura aplicada.

REGLAS DE FORMATO (MUY IMPORTANTE):
- TODA fórmula química, símbolo, subíndice, superíndice o expresión matemática DEBE ir entre signos de dólar $...$ usando sintaxis LaTeX.
- TODA cantidad con unidad DEBE ir entre signos de dólar. Ejemplo INCORRECTO: "250 g" o "250,g". Ejemplo CORRECTO: "$250 \\text{ g}$" o simplemente "$250$ g".
- NUNCA escribas fórmulas químicas en texto plano. Ejemplo INCORRECTO: "el compuesto NaOH". Ejemplo CORRECTO: "el compuesto $NaOH$".
- NUNCA escribas iones sin LaTeX. Ejemplo INCORRECTO: "cation Na+ y anion OH-". Ejemplo CORRECTO: "catión $Na^+$ y anión $OH^-$".
- NUNCA pongas el caracter backtick en ninguna parte del JSON.
- En el JSON, usa UNA sola barra invertida para comandos LaTeX: \\rightarrow no \\\\rightarrow.
- En "acceptableAnswers", usa SOLO texto plano sin LaTeX, con subíndices normales: H2SO4, Fe2O3, NaCl.

VERIFICACIÓN: Para cada ejercicio, antes de escribirlo:
1. ¿Cuál es la fórmula química correcta de este compuesto? Verifica mentalmente.
2. ¿Cuál es el nombre IUPAC correcto? Verifica mentalmente.
3. ¿Las respuestas en "acceptableAnswers" cubren las formas comunes de escribirlo?
Solo escribe el ejercicio si estás 100% seguro del nombre y la fórmula.

${previousQuestions?.length ? `NO repitas estos compuestos (usa compuestos DIFERENTES):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n` : ''}
Responde SOLO con JSON válido, sin markdown ni backticks:
{
  "exercises": [
    {
      "direction": "name-to-formula" o "formula-to-name",
      "question": "Escribe la fórmula del compuesto: ácido sulfúrico",
      "acceptableAnswers": ["H2SO4", "H2SO4", "acido sulfurico", "ácido sulfúrico"],
      "displayAnswer": "$H_2SO_4$ — Ácido sulfúrico",
      "explanation": "Explicación de al menos 2 oraciones sobre la nomenclatura y reglas aplicadas."
    }
  ]
}`;

    const rawText = await callGroq(prompt);
    const data = sanitizeAIResponse(rawText);
    const exercises = validateExercises(data);
    return Response.json({ exercises });

  } catch (error) {
    console.error('Error generating nomenclature exercise:', error);
    if (error.message?.includes('429') || error.status === 429) {
      return Response.json(
        { error: 'Demasiadas peticiones. Espera unos segundos e intenta de nuevo.' },
        { status: 429 }
      );
    }
    return Response.json(
      { error: 'Error al generar el ejercicio de nomenclatura.' },
      { status: 500 }
    );
  }
}