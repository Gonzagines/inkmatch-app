import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { description, zonaBase64, zonaType, disenoBase64, disenoType } = body;

  const parts: any[] = [];

  if (zonaBase64) {
    parts.push({ inline_data: { mime_type: zonaType, data: zonaBase64 } });
  }
  if (disenoBase64) {
    parts.push({ inline_data: { mime_type: disenoType, data: disenoBase64 } });
  }

  let prompt = `Eres el simulador de tatuajes de InkMatch. El usuario quiere ver cómo quedaría un tatuaje.`;
  if (description) prompt += `\n\nDescripción: ${description}`;
  if (zonaBase64) prompt += `\n\nSe adjunta foto de la zona del cuerpo.`;
  if (disenoBase64) prompt += `\n\nSe adjunta imagen del diseño.`;
  prompt += `\n\nPor favor:
1. Describí visualmente cómo quedaría el tatuaje en esa zona.
2. Dá recomendaciones sobre estilo, tamaño y consideraciones técnicas.
3. Sugerí 2-3 tatuadores de InkMatch compatibles con este estilo (inventá nombres creativos de tatuadores argentinos).
4. Calificá del 1 al 10 qué tan viable y bonito quedaría.

Respondé en español, con entusiasmo pero profesionalismo.`;

  parts.push({ text: prompt });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] }),
    }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    const msg = data.error?.message || `Gemini error ${response.status}`;
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return NextResponse.json({ text });
}
