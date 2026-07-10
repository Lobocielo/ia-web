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
Cuando el usuario quiera buscar, comprar, comparar o ver precios de algo, DEBES responder EXACTAMENTE asi (sin nada mas):
SEARCH:{"query":"termino de busqueda","sort":"price_asc"}
Sort puede ser: price_asc (mas barato), price_desc (mas caro), relevance (por defecto).
Ejemplos:
- "busca auriculares baratos" → SEARCH:{"query":"auriculares","sort":"price_asc"}
- "el celular mas caro de samsung" → SEARCH:{"query":"celular samsung","sort":"price_desc"}
- "silla gamer" → SEARCH:{"query":"silla gamer","sort":"relevance"}
Para TODO LO DEMAS, respondes normal.`
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
        temperature: 0.3,
        max_tokens: 512
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

    const searchMatch = content.match(/^SEARCH:(\{.*\})$/s)
    if (searchMatch) {
      try {
        const searchParams = JSON.parse(searchMatch[1])
        return NextResponse.json({ reply: null, search: searchParams })
      } catch {}
    }

    return NextResponse.json({ reply: content })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}
