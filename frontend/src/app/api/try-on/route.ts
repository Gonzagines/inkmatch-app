import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log("¡Llegó un pedido a la API!"); // Esto lo vas a ver en la terminal negra
  
  try {
    const body = await request.json();
    const webhookUrl = "https://gonzagines.app.n8n.cloud/webhook-test/tattoo-try-on";

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error: any) {
    console.error('ERROR EN API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}