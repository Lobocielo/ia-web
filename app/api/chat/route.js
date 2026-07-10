import { NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_mercadolibre',
      description: 'Busca productos en MercadoLibre Argentina. Usa esta funcion cuando el usuario quiera buscar, comprar, comparar o ver precios de productos. Ejemplos: "busca auriculares", "quiero un celular barato", "cuanto sale una silla gamer", "el mas barato de X".',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Termino de busqueda. Ejemplo: "auriculares bluetooth", "notebook gamer", "silla ergonomica"'
          },
          sort: {
            type: 'string',
            enum: ['price_asc', 'price_desc', 'relevance'],
            description: 'Orden: price_asc = mas barato primero, price_desc = mas caro primero, relevance = relevance'
          }
        },
        required: ['query']
      }
    }
  }
]

async function searchMercadoLibre(query, sort = 'relevance') {
  const sortParam = sort === 'price_asc' ? '&sort=price_asc' : sort === 'price_desc' ? '&sort=price_desc' : ''
  const res = await fetch(
    `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}${sortParam}&limit=8`
  )
  if (!res.ok) return { items: [] }
  const data = await res.json()
  return { items: (data.results || []).map(item => ({
    id: item.id,
    title: item.title,
    price: item.price,
    currency: item.currency_id,
    thumbnail: item.thumbnail?.replace('http://', 'https://'),
    permalink: item.permalink,
    free_shipping: item.shipping?.free_shipping || false,
    condition: item.condition
  }))} 
}

async function callGroq(messages, model) {
  const systemMessage = {
    role: 'system',
    content: `Sos un asistente util, amigable y conciso. Respondes en el mismo idioma que el usuario.
Tenes acceso a una funcion para buscar productos en MercadoLibre Argentina.
Cuando el usuario pida buscar, comprar, comparar o ver precios de algo, USA la funcion search_mercadolibre.
Interpreta frases como "el mas barato", "el mas carato", "baratos", "economicos", "decente" para decidir el orden.
Si el usuario dice "busca auriculares el mas barato" → busca "auriculares" con sort price_asc.
Si el usuario dice "el mas caro" → sort price_desc.
Si no dice nada de precio → relevance.
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
      messages: [systemMessage, ...messages],
      tools: TOOLS,
      tool_choice: 'auto',
      temperature: 0.7,
      max_tokens: 2048,
      stream: false
    })
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    let msg = 'Error desconocido'
    try { msg = JSON.parse(errText).error?.message || errText } catch { msg = errText.slice(0, 200) || `HTTP ${response.status}` }
    throw new Error(`Groq: ${msg}`)
  }

  return await response.json()
}

export async function POST(request) {
  try {
    const { messages, model } = await request.json()

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
    }

    const data = await callGroq(messages, model)
    const choice = data.choices?.[0]

    if (!choice) {
      return NextResponse.json({ reply: 'No obtuve respuesta.' })
    }

    const message = choice.message

    if (message.tool_calls && message.tool_calls.length > 0) {
      const allMessages = [...messages, message]
      const searchResults = []

      for (const toolCall of message.tool_calls) {
        const fn = toolCall.function
        if (fn.name === 'search_mercadolibre') {
          let args = {}
          try { args = JSON.parse(fn.arguments) } catch { args = { query: fn.arguments } }
          const results = await searchMercadoLibre(args.query, args.sort)
          searchResults.push(results)
          allMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(results)
          })
        }
      }

      const finalData = await callGroq(allMessages, model)
      const finalReply = finalData.choices?.[0]?.message?.content || 'No obtuve respuesta.'

      return NextResponse.json({
        reply: finalReply,
        products: searchResults.flatMap(r => r.items)
      })
    }

    return NextResponse.json({ reply: message.content || 'No obtuve respuesta.' })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
