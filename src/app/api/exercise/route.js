import { SUBJECTS } from '@/data/subjects';
import { callGroq, sanitizeAIResponse } from '@/lib/ai-helpers';

function validateExercises(data) {
  if (!data?.exercises || !Array.isArray(data.exercises)) return [];
  return data.exercises.filter(ex => {
    if (!ex.question || ex.question.trim().length < 5) return false;
    if (!ex.options || !Array.isArray(ex.options) || ex.options.length < 2) return false;
    if (!ex.correctOptionId) return false;
    const validIds = ex.options.map(o => o.id);
    if (!validIds.includes(ex.correctOptionId)) return false;
    if (!ex.explanation || ex.explanation.trim().length < 15) {
      ex.explanation = `La respuesta correcta es la opción ${ex.correctOptionId}: ${ex.options.find(o => o.id === ex.correctOptionId)?.text || ''}.`;
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

    const { subject, subtopic, previousQuestions } = body;
    if (!subject || typeof subject !== 'string' || !subtopic || typeof subtopic !== 'string') {
      return Response.json({ error: 'Los campos "subject" y "subtopic" son obligatorios.' }, { status: 400 });
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

    const subjectData = SUBJECTS.find(s => s.slug === subject);
    const subtopicData = subjectData?.subtopics.find(s => s.slug === subtopic);
    const subjectName = subjectData ? subjectData.title : subject;
    const subtopicName = subtopicData ? subtopicData.title : subtopic;

    const prompt = `Eres un profesor universitario experto en ${subjectName}, específicamente en el tema "${subtopicName}".

Genera 3 ejercicios de práctica de selección múltiple (4 opciones cada uno) para un estudiante de farmacia/química.

REGLAS ESTRICTAS:
- Cada ejercicio DEBE tener exactamente 4 opciones (A, B, C, D) con IDs "A", "B", "C", "D".
- El campo "correctOptionId" DEBE ser exactamente uno de los IDs de las opciones y DEBE ser la respuesta correcta SIN DUDA.
- Las opciones incorrectas deben ser plausibles (errores comunes, conceptos confundibles).
- El campo "explanation" es OBLIGATORIO y debe tener al menos 2 oraciones explicando por qué la respuesta es correcta y por qué las demás no.

REGLAS DE FORMATO (MUY IMPORTANTE):
- TODA fórmula química, símbolo, subíndice, superíndice o expresión matemática DEBE ir entre signos de dólar $...$ usando sintaxis LaTeX.
- TODA cantidad con unidad DEBE ir entre signos de dólar. Ejemplo INCORRECTO: "250 g" o "250,g". Ejemplo CORRECTO: "$250 \\text{ g}$" o simplemente "$250$ g".
- NUNCA escribas fórmulas químicas en texto plano. Ejemplo INCORRECTO: "el compuesto NaOH se disocia". Ejemplo CORRECTO: "el compuesto $NaOH$ se disocia".
- NUNCA escribas iones sin LaTeX. Ejemplo INCORRECTO: "cation Na+ y anion OH-". Ejemplo CORRECTO: "catión $Na^+$ y anión $OH^-$".
- NUNCA pongas el caracter backtick en ninguna parte del JSON.
- En el JSON, usa UNA sola barra invertida para comandos LaTeX: \\rightarrow no \\\\rightarrow, \\frac no \\\\frac.

VERIFICACIÓN: Antes de escribir cada ejercicio, piensa internamente:
1. ¿Cuál es la respuesta correcta a esta pregunta?
2. ¿Esa respuesta está incluida como una de las opciones y coincide exactamente con correctOptionId?
3. ¿Las otras opciones son incorrectas pero plausibles?
Solo escribe el ejercicio si estás 100% seguro de la respuesta correcta.

${previousQuestions?.length ? `PREGUNTAS YA REALIZADAS (NO repitas, genera preguntas sobre conceptos DIFERENTES y enfoques distintos):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nVARIEDAD: Aborda el tema desde ángulos distintos cada vez. Evita preguntas muy similares entre sí o las más obvias del tema. Varía la dificultad y el tipo de razonamiento requerido.` : 'VARIEDAD: No generes las preguntas más obvias del tema. Varía el enfoque, la dificultad y el tipo de razonamiento cada vez.'}
Responde SOLO con JSON válido, sin markdown ni backticks:
{
  "exercises": [
    {
      "question": "texto de la pregunta",
      "options": [
        {"id": "A", "text": "opción"},
        {"id": "B", "text": "opción"},
        {"id": "C", "text": "opción"},
        {"id": "D", "text": "opción"}
      ],
      "correctOptionId": "letra de la opción correcta",
      "explanation": "Explicación de al menos 2 oraciones: por qué es correcta y por qué las demás no."
    }
  ]
}`;

    const rawText = await callGroq(prompt);
    const data = sanitizeAIResponse(rawText);
    const exercises = validateExercises(data);
    return Response.json({ exercises });

  } catch (error) {
    console.error('Error generating exercise:', error);
    if (error.message?.includes('429') || error.status === 429) {
      return Response.json(
        { error: 'Demasiadas peticiones. Espera unos segundos e intenta de nuevo.' },
        { status: 429 }
      );
    }
    return Response.json(
      { error: 'Error al generar el ejercicio.' },
      { status: 500 }
    );
  }
}