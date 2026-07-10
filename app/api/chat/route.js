import { NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_mercadolibre',
      description: 'Busca productos en MercadoLibre Argentina. Usa esta funcion cuando el usuario quiera buscar, comprar, comparar o ver precios de productos.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Termino de busqueda. Ejemplo: "auriculares bluetooth", "notebook gamer"'
          },
          sort: {
            type: 'string',
            enum: ['price_asc', 'price_desc', 'relevance'],
            description: 'price_asc = mas barato, price_desc = mas caro, relevance = por defecto'
          }
        },
        required: ['query']
      }
    }
  }
]

async function searchML(query, sort = 'relevance') {
  const s = sort === 'price_asc' ? '&sort=price_asc' : sort === 'price_desc' ? '&sort=price_desc' : ''
  const res = await fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}${s}&limit=8`)
  if (!res.ok) return []
  const data = await res.json()
  return (data.results || []).map(i => ({
    id: i.id,
    title: i.title,
    price: i.price,
    currency: i.currency_id,
    thumbnail: i.thumbnail?.replace('http://', 'https://'),
    permalink: i.permalink,
    free_shipping: i.shipping?.free_shipping || false,
    condition: i.condition
  }))
}

export async function POST(request) {
  try {
    const { messages, model } = await request.json()

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
    }

    const systemMsg = {
      role: 'system',
      content: `Sos un asistente util y conciso. Respondes en el mismo idioma que el usuario.
Tenes una funcion search_mercadolibre para buscar productos en Argentina.
USALA cuando el usuario quiera buscar, comprar, comparar o ver precios de algo.
Interpreta "el mas barato" → sort price_asc, "el mas caro" → sort price_desc.
Si es codigo, lo formateas bien.`
    }

    const groqUrl = 'https://api.groq.com/openai/v1/chat/completions'
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    }

    const r1 = await fetch(groqUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages: [systemMsg, ...messages],
        tools: TOOLS,
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 2048
      })
    })

    if (!r1.ok) {
      const err = await r1.text().catch(() => '')
      console.error('Groq r1 error:', r1.status, err)
      return NextResponse.json({ error: `Error Groq: ${err.slice(0, 200)}` }, { status: r1.status })
    }

    const d1 = await r1.json()
    const msg = d1.choices?.[0]?.message

    if (!msg) {
      return NextResponse.json({ reply: 'No obtuve respuesta.' })
    }

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      const toolMessages = []

      for (const tc of msg.tool_calls) {
        if (tc.function.name === 'search_mercadolibre') {
          let args = {}
          try { args = JSON.parse(tc.function.arguments) } catch { args = { query: tc.function.arguments } }
          const items = await searchML(args.query, args.sort)
          toolMessages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify({ items })
          })
        }
      }

      const r2 = await fetch(groqUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: model || 'llama-3.3-70b-versatile',
          messages: [systemMsg, ...messages, msg, ...toolMessages],
          temperature: 0.7,
          max_tokens: 2048
        })
      })

      if (!r2.ok) {
        const err = await r2.text().catch(() => '')
        console.error('Groq r2 error:', r2.status, err)
        const allItems = toolMessages.flatMap(tm => {
          try { return JSON.parse(tm.content).items } catch { return [] }
        })
        return NextResponse.json({ reply: 'Encontre estos productos:', products: allItems })
      }

      const d2 = await r2.json()
      const finalContent = d2.choices?.[0]?.message?.content
      const allItems = toolMessages.flatMap(tm => {
        try { return JSON.parse(tm.content).items } catch { return [] }
      })

      return NextResponse.json({
        reply: finalContent || 'Encontre estos productos:',
        products: allItems
      })
    }

    return NextResponse.json({ reply: msg.content || 'No obtuve respuesta.' })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}
