'use client'

import { useState, useRef, useEffect } from 'react'

const MODELS = [
  // === CHAT GRATIS (Groq - con censura) ===
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', desc: 'Gratis - con censura', vision: false, cat: 'Gratis (Groq)', type: 'llm' },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', desc: 'Gratis - ultra rapido', vision: false, cat: 'Gratis (Groq)', type: 'llm' },
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout', desc: 'Gratis - vision + chat', vision: true, cat: 'Gratis (Groq)', type: 'llm' },

  // === CHAT PREMIUM (OpenRouter - SIN CENSURA) ===
  { id: 'nousresearch/hermes-4-70b', name: 'Hermes 4 70B', desc: 'Sin censura - roleplay, cualquier tema', vision: false, cat: 'Premium (OpenRouter)', type: 'llm', premium: true },
  { id: 'nousresearch/hermes-3-llama-3.1-405b', name: 'Hermes 3 405B', desc: 'Sin censura - el mas grande', vision: false, cat: 'Premium (OpenRouter)', type: 'llm', premium: true },
  { id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition', name: 'Dolphin Venice', desc: 'Sin censura - 100% libre', vision: false, cat: 'Premium (OpenRouter)', type: 'llm', premium: true },
  { id: 'deepseek/deepseek-v4-flash', name: 'DeepSeek V4 Flash', desc: 'Sin censura - rapido y potente', vision: false, cat: 'Premium (OpenRouter)', type: 'llm', premium: true },
  { id: 'mistralai/mistral-large-2512', name: 'Mistral Large 3', desc: 'Sin censura - Mistral oficial', vision: false, cat: 'Premium (OpenRouter)', type: 'llm', premium: true },

  // === AGENTES (Groq - gratis) ===
  { id: 'groq/compound', name: 'Compound', desc: 'Agente: busca + ejecuta codigo', vision: false, cat: 'Agentes', type: 'agent' },
  { id: 'groq/compound-mini', name: 'Compound Mini', desc: 'Agente rapido', vision: false, cat: 'Agentes', type: 'agent' },

  // === SEGURIDAD (Groq - gratis) ===
  { id: 'openai/gpt-oss-safeguard-20b', name: 'GPT Safeguard 20B', desc: 'Filtra contenido peligroso', vision: false, cat: 'Seguridad', type: 'safety' },
  { id: 'meta-llama/llama-prompt-guard-2-22m', name: 'Prompt Guard 22M', desc: 'Detecta prompt injection', vision: false, cat: 'Seguridad', type: 'safety' },
  { id: 'meta-llama/llama-prompt-guard-2-86m', name: 'Prompt Guard 86M', desc: 'Detecta inyeccion de prompts', vision: false, cat: 'Seguridad', type: 'safety' },

  // === AUDIO (Groq - gratis) ===
  { id: 'whisper-large-v3', name: 'Whisper V3', desc: 'Transcribe audio a texto', vision: false, cat: 'Audio', type: 'stt' },
  { id: 'whisper-large-v3-turbo', name: 'Whisper Turbo', desc: 'Transcribe audio rapido', vision: false, cat: 'Audio', type: 'stt' },
  { id: 'canopylabs/orpheus-v1-english', name: 'Orpheus English', desc: 'Texto a voz en ingles', vision: false, cat: 'Audio', type: 'tts' },
  { id: 'canopylabs/orpheus-arabic-saudi', name: 'Orpheus Arabic', desc: 'Texto a voz en arabe', vision: false, cat: 'Audio', type: 'tts' },
]

function SearchCard({ query, url }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="search-card">
      <div className="search-card-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <div className="search-card-info">
        <div className="search-card-title">MercadoLibre</div>
        <div className="search-card-query">{query}</div>
      </div>
      <div className="search-card-arrow">→</div>
    </a>
  )
}

function GeneratedImage({ prompt, url }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const downloadImage = () => {
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.download = `imagen-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="gen-image-container">
      {!loaded && !error && <div className="gen-image-loading">Generando imagen...</div>}
      {error && <div className="gen-image-loading" style={{color:'var(--error)'}}>Error al generar. Intenta de nuevo.</div>}
      <img
        src={url}
        alt={prompt}
        className="gen-image"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{display: error ? 'none' : 'block'}}
      />
      {loaded && (
        <div className="gen-image-actions">
          <button onClick={downloadImage} className="gen-image-download">Descargar</button>
        </div>
      )}
      <div className="gen-image-prompt">{prompt}</div>
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [model, setModel] = useState(MODELS[0].id)
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [imgModel, setImgModel] = useState('flux-realism')
  const [user, setUser] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const galleryInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem('user')
    if (saved) setUser(JSON.parse(saved))
  }, [])

  const currentModel = MODELS.find(m => m.id === model)
  const supportsVision = currentModel?.vision

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages, loading])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX = 800
          let w = img.width, h = img.height
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round((h * MAX) / w); w = MAX }
            else { w = Math.round((w * MAX) / h); h = MAX }
          }
          canvas.width = w; canvas.height = h
          canvas.getContext('2d').drawImage(img, 0, 0, w, h)
          resolve(canvas.toDataURL('image/jpeg', 0.7))
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const handleImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) { setError('Maximo 20MB'); return }
    const compressed = await compressImage(file)
    setImage(compressed)
    setImagePreview(compressed)
    e.target.value = ''
  }

  const removeImage = () => { setImage(null); setImagePreview(null) }

  const generateImage = (prompt) => {
    const seed = Math.floor(Math.random() * 999999)
    const enhancedPrompt = `high quality, detailed, sharp, 4k, professional photography, masterpiece: ${prompt}`
    const encoded = encodeURIComponent(enhancedPrompt)
    return `https://image.pollinations.ai/prompt/${encoded}?width=1536&height=1024&nologo=true&seed=${seed}&model=${imgModel}`
  }

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    if (image && !supportsVision) {
      setError('Este modelo no soporta imagenes. Elegi Llama 4 Scout o Qwen 3.6.')
      return
    }

    setError(null)

    const isImageGen = msg.toLowerCase().startsWith('/img ') || msg.toLowerCase().startsWith('/imagen ')

    if (isImageGen) {
      const prompt = msg.replace(/^\/(img|imagen)\s+/i, '')
      const userMessage = { role: 'user', content: msg, text: msg }
      const newMessages = [...messages, userMessage]
      setMessages(newMessages)
      setInput('')
      setLoading(true)

      const imageUrl = generateImage(prompt)
      setMessages([...newMessages, {
        role: 'assistant',
        content: `Imagen generada: "${prompt}"`,
        generatedImage: { prompt, url: imageUrl }
      }])
      setLoading(false)
      return
    }

    let userContent
    if (image && supportsVision) {
      userContent = [
        { type: 'text', text: msg || 'Que ves en esta imagen?' },
        { type: 'image_url', image_url: { url: image } }
      ]
    } else {
      userContent = msg
    }

    const userMessage = { role: 'user', content: userContent, text: msg, hasImage: !!image }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    removeImage()
    setLoading(true)

    const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, model, isPremium: user?.premium || false })
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Error al conectar con la IA')
      }
      const data = await res.json()
      setMessages([...newMessages, {
        role: 'assistant',
        content: data.reply,
        search: data.search || null
      }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => { setMessages([]); setError(null) }

  const suggestions = [
    'Busca auriculares bluetooth baratos',
    'El celular mas barato de Samsung',
    'Explica que es la programacion',
    'Sillas gamer con envio gratis'
  ]

  return (
    <div className="chat-container">
      <div className="header">
        <h1>iA Chat</h1>
        <div className="header-actions">
          <div className="model-selector">
            <button className="model-badge" onClick={() => setShowModelPicker(!showModelPicker)}>
              {currentModel?.name} ▾
            </button>
            {showModelPicker && (
              <>
                <div className="model-overlay" onClick={() => setShowModelPicker(false)} />
                <div className="model-dropdown">
                  {['Gratis (Groq)', 'Premium (OpenRouter)', 'Agentes', 'Seguridad', 'Audio'].map(cat => (
                    <div key={cat}>
                      <div className="model-cat-header">{cat}</div>
                      {MODELS.filter(m => m.cat === cat).map(m => (
                        <button
                          key={m.id}
                          className={`model-option ${m.id === model ? 'active' : ''} ${m.premium && !user ? 'premium-locked' : ''}`}
                          onClick={() => {
                            if (m.premium && !user) { window.location.href = '/login'; return }
                            setModel(m.id); setShowModelPicker(false); removeImage()
                          }}
                        >
                          <span className="model-name">{m.name}</span>
                          <span className="model-desc">{m.desc}</span>
                          {m.vision && <span className="model-tag">VISION</span>}
                          {m.type === 'stt' && <span className="model-tag tag-stt">STT</span>}
                          {m.type === 'tts' && <span className="model-tag tag-tts">TTS</span>}
                          {m.type === 'agent' && <span className="model-tag tag-agent">AGENT</span>}
                          {m.premium && <span className="model-tag tag-premium">PREMIUM</span>}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          {user ? (
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              {user.premium && <span className="user-premium">PREMIUM</span>}
              {user.role === 'admin' && <a href="/admin" className="admin-link">Panel Admin</a>}
              <button className="logout-btn" onClick={() => { localStorage.removeItem('user'); setUser(null) }}>Salir</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <a href="/login" className="login-btn">Iniciar sesion</a>
              <a href="/admin-login" className="admin-link">Admin</a>
            </div>
          )}
          {messages.length > 0 && (
            <button className="new-chat-btn" onClick={clearChat}>+ Nuevo</button>
          )}
        </div>
      </div>

      <div className="messages">
        {messages.length === 0 && !loading && (
          <div className="welcome">
            <div className="welcome-icon">💬</div>
            <h2>Hola, como puedo ayudarte?</h2>
            <p>Puedo buscar productos, generar imagenes, responder preguntas y mas.</p>
            <div className="tips-grid">
              <div className="tip-card">
                <span className="tip-icon">🔍</span>
                <span className="tip-text">Busca auriculares bluetooth</span>
              </div>
              <div className="tip-card">
                <span className="tip-icon">🎨</span>
                <span className="tip-text">/img un gato astronauta</span>
              </div>
              <div className="tip-card">
                <span className="tip-icon">📸</span>
                <span className="tip-text">Subi una foto y preguntame</span>
              </div>
              <div className="tip-card">
                <span className="tip-icon">💻</span>
                <span className="tip-text">Escribi codigo en Python</span>
              </div>
            </div>
            <div className="img-model-selector">
              <label>Modelo de imagen:</label>
              <select value={imgModel} onChange={(e) => setImgModel(e.target.value)}>
                <option value="flux-realism">Flux Realism</option>
                <option value="flux">Flux</option>
                <option value="flux-anime">Flux Anime</option>
                <option value="flux-3d">Flux 3D</option>
                <option value="turbo">Turbo</option>
              </select>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="avatar">{msg.role === 'user' ? '👤' : '✨'}</div>
            <div className="bubble-wrapper">
              <div className="bubble">
                {msg.hasImage && msg.role === 'user' && typeof msg.content === 'object' && (
                  <img
                    src={msg.content.find(c => c.type === 'image_url')?.image_url?.url}
                    alt="imagen"
                    className="message-image"
                  />
                )}
                {typeof msg.content === 'string' ? msg.content : msg.content.find(c => c.type === 'text')?.text || ''}
              </div>
              {msg.search && <SearchCard query={msg.search.query} url={msg.search.url} />}
              {msg.generatedImage && <GeneratedImage prompt={msg.generatedImage.prompt} url={msg.generatedImage.url} />}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="avatar">✨</div>
            <div className="bubble">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="preview" />
            <button className="remove-image" onClick={removeImage}>✕</button>
          </div>
        )}
        <div className="input-wrapper">
          {supportsVision && (
            <>
              <input ref={galleryInputRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImage} style={{ display: 'none' }} />
              <div className="attach-group">
                <button className="attach-btn" onClick={() => galleryInputRef.current?.click()} title="Subir imagen">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </button>
                <button className="attach-btn camera-btn" onClick={() => cameraInputRef.current?.click()} title="Sacar foto">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </button>
              </div>
            </>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Escribi tu mensaje... (/img para generar imagen)'
            rows={1}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={(!input.trim() && !image) || loading}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
