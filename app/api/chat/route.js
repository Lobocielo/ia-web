import { NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY

export async function POST(request) {
  try {
    const { messages, model } = await request.json()

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
    }

    const systemMsg = {
      role: 'system',
      content: `Sos un asistente util y conciso. Respondes en el mismo idioma que el usuario.
Si el usuario quiere buscar productos, decile que podes buscar con el boton de busqueda o abri MercadoLibre para el.
Si es codigo, lo formateas bien.`
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages: [systemMsg, ...messages],
        temperature: 0.7,
        max_tokens: 2048
      })
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      let msg = 'Error desconocido'
      try { msg = JSON.parse(errText).error?.message || errText } catch { msg = errText.slice(0, 200) || `HTTP ${response.status}` }
      return NextResponse.json({ error: `Groq: ${msg}` }, { status: response.status })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || 'No obtuve respuesta.'

    return NextResponse.json({ reply: content })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}
