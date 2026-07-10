import { NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY

export async function POST(request) {
  try {
    const { messages } = await request.json()

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
    }

    const systemMessage = {
      role: 'system',
      content: 'Sos un asistente util, amigable y conciso. Respondes en el mismo idioma que el usuario. Si es codigo, lo formateas bien.'
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 2048,
        stream: false
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Groq error:', err)
      return NextResponse.json(
        { error: 'Error al comunicarse con Groq' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || 'No obtuve respuesta.'

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
