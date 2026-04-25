import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { SUBJECTS } from '@/data/subjects';

export async function POST(request) {
  try {
    const { subject, subtopic } = await request.json();
    
    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'La API key de Gemini no está configurada.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const subjectData = SUBJECTS.find(s => s.slug === subject);
    const subtopicData = subjectData?.subtopics.find(s => s.slug === subtopic);

    const subjectName = subjectData ? subjectData.title : subject;
    const subtopicName = subtopicData ? subtopicData.title : subtopic;

    const prompt = `Eres un profesor universitario experto en ${subjectName}, específicamente en el tema de ${subtopicName}. 
Genera un ejercicio práctico de selección múltiple (4 opciones) para un estudiante de ciencias (farmacia/química). 
El ejercicio debe estar enfocado única y exclusivamente en el subtema de "${subtopicName}".
La dificultad debe ser de nivel universitario. Asegúrate de que las opciones sean plausibles para que el estudiante tenga que pensar.
No repitas preguntas comunes, sé creativo con los conceptos.

Devuelve la respuesta estrictamente en formato JSON con la siguiente estructura, sin markdown ni backticks extra:
{
  "question": "texto de la pregunta",
  "options": [
    { "id": "A", "text": "opción 1" },
    { "id": "B", "text": "opción 2" },
    { "id": "C", "text": "opción 3" },
    { "id": "D", "text": "opción 4" }
  ],
  "correctOptionId": "A", // la letra de la opción correcta
  "explanation": "Explicación detallada de por qué esta es la respuesta correcta y por qué las otras no lo son."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const data = JSON.parse(response.text);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error generating exercise:', error);
    return NextResponse.json(
      { error: 'Error al generar el ejercicio con la IA' },
      { status: 500 }
    );
  }
}
