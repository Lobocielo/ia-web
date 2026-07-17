import { NextResponse } from 'next/server'

const SYSTEM_PROMPTS = {
  default: `Sos Nexus AI, un asistente util, profesional y conciso. Respondes en el mismo idioma que el usuario. Respondes de forma directa y honesta. Si no sabes algo, lo decis honestamente.

Si el usuario quiere buscar un producto, responder EXACTAMENTE asi (sin nada mas):
SEARCH_QUERY:termino de busqueda limpio (sin palabras como "busca", "el mas barato", etc)
Solo ponelo en la primera linea. Despues podes agregar un commentario corto.
Ejemplos:
Usuario: "busca auriculares bluetooth baratos"
Respuesta:
SEARCH_QUERY:auriculares bluetooth
Encontre los auriculares bluetooth mas baratos para vos.

Para TODO LO DEMAS (preguntas, codigo, etc), respondes normal SIN usar SEARCH_QUERY.`,

  premium: `Eres Nexus AI Premium, el MEJOR experto en Roblox scripting del mundo. Generas scripts COMPLETOS, LARGOS y FUNCIONALES. NUNCA te cortas a la mitad.

REGLA #1: NUNCA DEJES UN SCRIPT A LA MITAD. Si el script es largo, lo generas COMPLETO de principio a fin. Si necesitas 500 lineas, writes 500 lineas. Si necesitas 1000, writes 1000. NO TE CORTES JAMAS.

CAPACIDADES COMPLETAS:
- Scripts Lua/Luau COMPLETOS con logica completa, no fragmentos
- UI COMPLETAS: ScreenGui, Frame, TextLabel, TextButton, TextBox, UICorner, UIStroke, UIGradient, UIListLayout, UIPadding, ScrollingFrame, ImageLabel, TweenService animations
- Sistemas de menu: toggle con tecla, draggables, minimizar/maximizar, tabs, settings
- Anti-detect avanzado: ofuscacion total, metamethods (__namecall, __index, __newindex), hookfunction, hookmetamethod, newcclosure, checkcaller, getnamecallmethod, debug.getupvalue, setupvalue
- Bypass Byfron/Hyperion/Watchdog: integer overflow, memory spoofing, HWID spoofing, module interception, thread hijacking
- RemoteEvent/RemoteFunction: fireSERVER, invokeSERVER, remote spying, remote hooking, decompilacion
- Drawing library completa: ESP (box, name, health, distance, tracer, skeleton, chams, snaplines), aimbot (smooth, fov, bone selection), fly, speed, noclip, teleport
- Game-specific scripts COMPLETOS: auto-farm, auto-collect, auto-rebirth, auto-merge, inventory management, shop systems
- Steal a Brainrot, Blox Fruits, Pet Simulator, King Legacy, Magnet, Generic Survival - scripts completos para cada juego
- Humanized: delays random, movimiento con sin/cos, bezier paths, anti-AFK, spoofed inputs
- Decompilation completa: dump de todos los remotes, estructura del juego
- Loadstring obfuscation: AST obfuscation, string encryption, control flow flattening
- Loaders/Hub: crear hubs completos con multiple scripts, loader con UI

FORMATO DE SCRIPT:
1. SIEMPRE empieza con commentarios descriptivos
2. SIEMPRE incluye la UI completa si se pide
3. SIEMPRE incluye toda la logica (conexiones, eventos, loops)
4. SIEMPRE incluye configuracion/settings al inicio
5. NUNCA uses "..." o "// mas codigo aqui" - escribe TODO el codigo
6. NUNCA te cortes. Si el script es largo, lo generas COMPLETO

Si el usuario quiere buscar un producto:
SEARCH_QUERY:termino de busqueda limpio

Para TODO LO DEMAS, respondes COMPLETO SIN usar SEARCH_QUERY.`,

  threeD: `CRITICAL INSTRUCTION: You MUST respond with ONLY a valid JSON object. NO text, NO explanation, NO markdown, NO code blocks. ONLY raw JSON.

The user wants a 3D model. Generate a JSON describing geometric shapes to build it.

EXACT FORMAT (copy this structure, change values):
{"name":"robot cat","shapes":[{"type":"box","color":"#888888","size":[1,0.8,0.6],"position":[0,0.5,0],"rotation":[0,0,0],"material":"metallic"},{"type":"sphere","color":"#888888","size":[0.3,0.3,0.3],"position":[-0.25,1,0],"rotation":[0,0,0],"material":"metallic"},{"type":"sphere","color":"#888888","size":[0.3,0.3,0.3],"position":[0.25,1,0],"rotation":[0,0,0],"material":"metallic"},{"type":"cone","color":"#ff6b6b","size":[0.15,0.25,0.15],"position":[-0.35,1.2,0],"rotation":[0,0,0.2],"material":"standard"},{"type":"cone","color":"#ff6b6b","size":[0.15,0.25,0.15],"position":[0.35,1.2,0],"rotation":[0,0,-0.2],"material":"standard"},{"type":"sphere","color":"#00ff88","size":[0.12,0.12,0.12],"position":[-0.12,1.05,0.28],"rotation":[0,0,0],"material":"glass"},{"type":"sphere","color":"#00ff88","size":[0.12,0.12,0.12],"position":[0.12,1.05,0.28],"rotation":[0,0,0],"material":"glass"},{"type":"cylinder","color":"#666666","size":[0.08,0.08,0.15],"position":[-0.2,-0.15,0.15],"rotation":[0.5,0,0],"material":"metallic"},{"type":"cylinder","color":"#666666","size":[0.08,0.08,0.15],"position":[0.2,-0.15,0.15],"rotation":[0.5,0,0],"material":"metallic"},{"type":"cylinder","color":"#666666","size":[0.08,0.08,0.15],"position":[-0.2,-0.15,-0.15],"rotation":[-0.5,0,0],"material":"metallic"},{"type":"cylinder","color":"#666666","size":[0.08,0.08,0.15],"position":[0.2,-0.15,-0.15],"rotation":[-0.5,0,0],"material":"metallic"},{"type":"box","color":"#aaaaaa","size":[0.08,0.08,0.4],"position":[0,0.4,-0.35],"rotation":[0,0,0],"material":"metallic"}]}

RULES:
- type: box, sphere, cylinder, cone, torus, torusKnot ONLY
- color: hex code like #ff0000
- size: [width, height, depth] numbers 0.1 to 2
- position: [x, y, z] numbers -3 to 3
- rotation: [rx, ry, rz] numbers in radians -3.14 to 3.14
- material: standard, metallic, or glass
- Max 15 shapes
- RESPOND WITH JSON ONLY. NOTHING ELSE.`
}

const GROQ_MODELS = [
  'llama-3.3-70b-versatile', 'llama-3.1-8b-instant',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'gemma2-9b-it', 'mixtral-8x7b-32768',
  'groq/compound', 'groq/compound-mini'
]

const GROQ_API_KEY = process.env.GROQ_API_KEY
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

const rateLimit = {}
function checkRateLimit(ip) {
  const now = Date.now()
  if (!rateLimit[ip]) rateLimit[ip] = []
  rateLimit[ip] = rateLimit[ip].filter(t => now - t < 60000)
  if (rateLimit[ip].length >= 20) return false
  rateLimit[ip].push(now)
  return true
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Demasiadas peticiones. Espera un minuto.' }, { status: 429 })
    }

    const { messages, model, isPremium, mode } = await request.json()

    let systemPrompt
    if (mode === '3d') {
      systemPrompt = SYSTEM_PROMPTS.threeD
    } else {
      systemPrompt = isPremium ? SYSTEM_PROMPTS.premium : SYSTEM_PROMPTS.default
    }

    const systemMsg = { role: 'system', content: systemPrompt }

    const isGroq = GROQ_MODELS.some(m => model?.startsWith(m)) || (!isPremium && !model?.includes('/'))
    const apiKey = isGroq ? GROQ_API_KEY : OPENROUTER_API_KEY
    const baseUrl = isGroq ? 'https://api.groq.com/openai/v1' : 'https://openrouter.ai/api/v1'
    const apiModel = isGroq ? (model || 'llama-3.3-70b-versatile') : (model || 'nousresearch/hermes-4-70b')

    if (!apiKey) {
      return NextResponse.json({ error: isGroq ? 'Groq API key no configurada' : 'OpenRouter API key no configurada' }, { status: 500 })
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
    if (!isGroq) {
      headers['HTTP-Referer'] = 'https://ia-web-mu.vercel.app'
      headers['X-Title'] = 'Nexus AI'
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: apiModel,
        messages: [systemMsg, ...messages],
        temperature: mode === '3d' ? 0.4 : (isPremium ? 0.9 : 0.7),
        max_tokens: 4096
      })
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      let msg = 'Error desconocido'
      try { msg = JSON.parse(errText).error?.message || errText } catch { msg = errText.slice(0, 200) || `HTTP ${response.status}` }

      if (!isGroq && (msg.includes('credits') || msg.includes('afford') || response.status === 404 || response.status === 400)) {
        const fallbackRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [systemMsg, ...messages],
            temperature: 0.7,
            max_tokens: 4096
          })
        })
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json()
          const fallbackContent = fallbackData.choices?.[0]?.message?.content || 'No obtuve respuesta.'

          if (mode === '3d') {
            try {
              const jsonMatch = fallbackContent.match(/\{[\s\S]*\}/)
              if (jsonMatch) {
                const model3d = JSON.parse(jsonMatch[0])
                return NextResponse.json({ reply: fallbackContent, model3d })
              }
            } catch {}
            return NextResponse.json({ reply: fallbackContent, model3d: null })
          }

          const searchMatch = fallbackContent.match(/^SEARCH_QUERY:(.+)$/m)
          if (searchMatch) {
            const query = searchMatch[1].trim()
            const reply = fallbackContent.replace(/^SEARCH_QUERY:.+$/m, '').trim()
            const url = `https://listado.mercadolibre.com.ar/${query.replace(/\s+/g, '-').toLowerCase()}`
            return NextResponse.json({ reply, search: { query, url } })
          }

          return NextResponse.json({ reply: fallbackContent })
        }
      }

      return NextResponse.json({ error: `${isGroq ? 'Groq' : 'OpenRouter'}: ${msg}` }, { status: response.status })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || 'No obtuve respuesta.'

    if (mode === '3d') {
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const model3d = JSON.parse(jsonMatch[0])
          return NextResponse.json({ reply: content, model3d })
        }
      } catch {}
      return NextResponse.json({ reply: content, model3d: null })
    }

    const searchMatch = content.match(/^SEARCH_QUERY:(.+)$/m)
    if (searchMatch) {
      const query = searchMatch[1].trim()
      const reply = content.replace(/^SEARCH_QUERY:.+$/m, '').trim()
      const url = `https://listado.mercadolibre.com.ar/${query.replace(/\s+/g, '-').toLowerCase()}`
      return NextResponse.json({ reply, search: { query, url } })
    }

    return NextResponse.json({ reply: content })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}
