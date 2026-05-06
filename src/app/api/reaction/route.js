import Groq from 'groq-sdk';
import { NextResponse } from 'next/server';
import { SUBJECTS } from '@/data/subjects';
import { sanitizeAIResponse } from '@/lib/ai-helpers';

async function callGroq(groq, prompt, model, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await groq.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      });
      return response.choices[0].message.content;
    } catch (err) {
      if ((err.status === 429 || err.message?.includes('429')) && attempt < retries) {
        const delay = Math.pow(2, attempt) * 2000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
}

function validateExercises(data) {
  if (!data?.exercises || !Array.isArray(data.exercises)) return [];
  return data.exercises.filter(ex => {
    if (!ex.question || ex.question.trim().length < 5) return false;
    if (!ex.type || !['identify-type', 'complete-reaction', 'mechanism'].includes(ex.type)) return false;

    if (ex.type === 'identify-type' || ex.type === 'mechanism') {
      if (!ex.options || !Array.isArray(ex.options) || ex.options.length < 2) return false;
      if (!ex.correctOptionId) return false;
      const validIds = ex.options.map(o => o.id);
      if (!validIds.includes(ex.correctOptionId)) return false;
    }

    if (ex.type === 'complete-reaction') {
      if (!ex.acceptableAnswers || !Array.isArray(ex.acceptableAnswers) || ex.acceptableAnswers.length === 0) return false;
      if (!ex.displayAnswer || ex.displayAnswer.trim().length < 2) return false;
    }

    if (!ex.explanation || ex.explanation.trim().length < 15) {
      if (ex.type === 'identify-type' || ex.type === 'mechanism') {
        ex.explanation = `La respuesta correcta es la opción ${ex.correctOptionId}.`;
      } else {
        ex.explanation = `La respuesta correcta es: ${ex.displayAnswer || 'ver displayAnswer'}.`;
      }
    }

    return true;
  });
}

export async function POST(request) {
  try {
    const { subject, subtopic, previousQuestions } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'La API key de Groq no está configurada.' },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const subjectData = SUBJECTS.find(s => s.slug === subject);
    const subtopicData = subjectData?.subtopics.find(s => s.slug === subtopic);
    const subjectName = subjectData ? subjectData.title : subject;
    const subtopicName = subtopicData ? subtopicData.title : subtopic;

    const prompt = `Eres un profesor universitario experto en reacciones químicas de ${subjectName}, específicamente en "${subtopicName}".

Genera 3 ejercicios sobre reacciones químicas para un estudiante de farmacia/química.

Varía los tipos de ejercicio:
1. "identify-type": Muestra una reacción y pregunta qué tipo es (4 opciones, selección múltiple).
2. "complete-reaction": Muestra los reactivos, el estudiante escribe los productos (respuesta libre).
3. "mechanism": Muestra una reacción y pregunta por el mecanismo predominante (4 opciones, selección múltiple).

REGLAS ESTRICTAS:
- Para "identify-type" y "mechanism": "correctOptionId" DEBE ser el ID de la opción que es REALMENTE la respuesta correcta. Verifica mentalmente antes.
- Los distractores deben ser plausibles pero definitivamente incorrectos.
- Para "complete-reaction": "acceptableAnswers" DEBE contener todas las formas válidas de escribir los productos, incluyendo variaciones con/sin estados de agregación, orden, espacios. Sé generoso.
- "explanation" es OBLIGATORIO y debe tener al menos 2 oraciones explicando la reacción y por qué es correcta.
- El campo "reaction" es obligatorio para TODOS los tipos y debe mostrar la reacción o reactivos.

REGLAS DE FORMATO (MUY IMPORTANTE):
- TODA fórmula química, símbolo, subíndice, superíndice o expresión matemática DEBE ir entre signos de dólar $...$ usando sintaxis LaTeX.
- TODA cantidad con unidad DEBE ir entre signos de dólar. Ejemplo INCORRECTO: "250 g" o "250,g". Ejemplo CORRECTO: "$250 \\text{ g}$" o simplemente "$250$ g".
- NUNCA escribas fórmulas químicas en texto plano. Ejemplo INCORRECTO: "el NaOH reacciona". Ejemplo CORRECTO: "el $NaOH$ reacciona".
- NUNCA escribas iones sin LaTeX. Ejemplo INCORRECTO: "ion Na+ y OH-". Ejemplo CORRECTO: "ión $Na^+$ y $OH^-$".
- NUNCA pongas el caracter backtick en ninguna parte del JSON.
- En el JSON, usa UNA sola barra invertida para comandos LaTeX: \\rightarrow no \\\\rightarrow, \\frac no \\\\frac.
- En "acceptableAnswers", usa SOLO texto plano sin LaTeX ni signos de dólar, con subíndices normales: CH3CH2OH, NaBr.

VERIFICACIÓN: Antes de escribir cada ejercicio:
1. ¿La reacción es químicamente correcta? Verifica balanceo y productos.
2. ¿El correctOptionId apunta a la opción realmente correcta? Verifica.
3. ¿Los productos en acceptableAnswers son los correctos? Verifica.
Solo escribe el ejercicio si estás 100% seguro de la respuesta.

${previousQuestions?.length ? `NO repitas estas preguntas (genera sobre conceptos DIFERENTES):\n${previousQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n` : ''}
Responde SOLO con JSON válido, sin markdown ni backticks:
{
  "exercises": [
    {
      "type": "identify-type" | "complete-reaction" | "mechanism",
      "question": "texto de la pregunta",
      "reaction": "$CH_3CH_2Br + NaOH \\rightarrow ?",
      "options": [
        {"id": "A", "text": "opción"},
        {"id": "B", "text": "opción"},
        {"id": "C", "text": "opción"},
        {"id": "D", "text": "opción"}
      ],
      "correctOptionId": "letra correcta",
      "acceptableAnswers": ["CH3CH2OH + NaBr", "CH3CH2OH+NaBr"],
      "displayAnswer": "$CH_3CH_2OH + NaBr$",
      "explanation": "Al menos 2 oraciones explicando la reacción."
    }
  ]
}

Para "identify-type" y "mechanism": "options" y "correctOptionId" son obligatorios.
Para "complete-reaction": "acceptableAnswers" y "displayAnswer" son obligatorios.
"reaction" es obligatorio para todos los tipos.`;

    const rawText = await callGroq(groq, prompt, 'llama-3.3-70b-versatile');
    const data = sanitizeAIResponse(rawText);
    const exercises = validateExercises(data);
    return NextResponse.json({ exercises });

  } catch (error) {
    console.error('Error generating reaction exercise:', error);
    if (error.message?.includes('429') || error.status === 429) {
      return NextResponse.json(
        { error: 'Demasiadas peticiones. Espera unos segundos e intenta de nuevo.' },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: 'Error al generar el ejercicio de reacciones.' },
      { status: 500 }
    );
  }
}