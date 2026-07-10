'use client'

import { useState, useRef, useEffect } from 'react'

const MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', desc: 'Potente y equilibrado', vision: false },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', desc: 'Ultra rapido', vision: false },
  { id: 'meta-llama/llama-4-scout-17b-16e-instruct', name: 'Llama 4 Scout', desc: 'Vision + texto', vision: true },
  { id: 'qwen/qwen3.6-27b', name: 'Qwen 3.6 27B', desc: 'Vision + texto', vision: true },
  { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B', desc: 'Maximo potencia', vision: false },
  { id: 'groq/compound', name: 'Compound', desc: 'Herramientas + busqueda', vision: false },
]

function formatPrice(amount, currency) {
  const symbols = { ARS: '$', USD: 'U$S', BRL: 'R$', COP: '$', MXN: '$', CLP: '$', PEN: 'S/' }
  return `${symbols[currency] || '$'} ${Math.round(amount).toLocaleString('es-AR')}`
}

function ProductCard({ item }) {
  const img = item.thumbnail?.replace('http://', 'https://').replace('-O.', '-V.') || ''
  return (
    <a href={item.permalink} target="_blank" rel="noopener noreferrer" className="product-card">
      <img src={img} alt={item.title} className="product-img" loading="lazy" />
      <div className="product-info">
        <div className="product-title">{item.title}</div>
        <div className="product-price">{formatPrice(item.price, item.currency_id)}</div>
        {item.shipping?.free_shipping && <span className="product-free">Envio gratis</span>}
        {item.condition === 'used' && <span className="product-used">Usado</span>}
      </div>
    </a>
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
  const [searchMode, setSearchMode] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const galleryInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const currentModel = MODELS.find(m => m.id === model)
  const supportsVision = currentModel?.vision

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, searchResults])

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
          let w = img.width
          let h = img.height
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round((h * MAX) / w); w = MAX }
            else { w = Math.round((w * MAX) / h); h = MAX }
          }
          canvas.width = w
          canvas.height = h
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

  const searchMercadoLibre = async (query) => {
    setSearching(true)
    setSearchResults(null)
    setError(null)
    try {
      const res = await fetch(`https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}&limit=12`)
      if (!res.ok) throw new Error('Error al buscar')
      const data = await res.json()
      setSearchResults({ query, items: data.results || [] })
    } catch (err) {
      setError(err.message)
    } finally {
      setSearching(false)
    }
  }

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    if (searchMode) {
      setInput('')
      searchMercadoLibre(msg)
      return
    }
    if (image && !supportsVision) {
      setError('Este modelo no soporta imagenes. Elegi Llama 4 Scout o Qwen 3.6.')
      return
    }

    setError(null)
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
        body: JSON.stringify({ messages: apiMessages, model })
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Error al conectar con la IA')
      }
      const data = await res.json()
      setMessages([...newMessages, { role: 'assistant', content: data.reply }])
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

  const clearChat = () => { setMessages([]); setError(null); setSearchResults(null) }

  const toggleSearch = () => {
    setSearchMode(!searchMode)
    setSearchResults(null)
    setError(null)
  }

  const suggestions = [
    'Explica que es la programacion',
    'Escribe un poema corto',
    'Ideas para un proyecto web',
    'Resuelve: 2x + 5 = 15'
  ]

  return (
    <div className="chat-container">
      <div className="header">
        <h1>iA Chat</h1>
        <div className="header-actions">
          <button
            className={`search-toggle ${searchMode ? 'active' : ''}`}
            onClick={toggleSearch}
            title={searchMode ? 'Volver al chat' : 'Buscar en MercadoLibre'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              {searchMode ? (
                <>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </>
              ) : (
                <>
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </>
              )}
            </svg>
          </button>
          <div className="model-selector">
            <button className="model-badge" onClick={() => setShowModelPicker(!showModelPicker)}>
              {currentModel?.name} ▾
            </button>
            {showModelPicker && (
              <>
                <div className="model-overlay" onClick={() => setShowModelPicker(false)} />
                <div className="model-dropdown">
                  {MODELS.map(m => (
                    <button
                      key={m.id}
                      className={`model-option ${m.id === model ? 'active' : ''}`}
                      onClick={() => { setModel(m.id); setShowModelPicker(false); removeImage() }}
                    >
                      <span className="model-name">{m.name}</span>
                      <span className="model-desc">{m.desc}</span>
                      {m.vision && <span className="model-tag">VISION</span>}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {messages.length > 0 && (
            <button className="new-chat-btn" onClick={clearChat}>+ Nuevo</button>
          )}
        </div>
      </div>

      <div className="messages">
        {messages.length === 0 && !loading && !searchResults && (
          <div className="welcome">
            <div className="welcome-icon">{searchMode ? '🛒' : '💬'}</div>
            <h2>{searchMode ? 'Busca en MercadoLibre' : 'Hola, como puedo ayudarte?'}</h2>
            <p>{searchMode
              ? 'Escribe lo que queras buscar y te muestro los productos con precio e imagen.'
              : 'Escribime cualquier cosa, o subi/toma una foto si usas un modelo con vision.'
            }</p>
            {searchMode && (
              <div className="suggestions">
                {['auriculares bluetooth', 'notebook gamer', 'iphone 15', 'silla gamer'].map((s, i) => (
                  <button key={i} className="suggestion" onClick={() => { setInput(''); searchMercadoLibre(s) }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
            {!searchMode && (
              <div className="suggestions">
                {suggestions.map((s, i) => (
                  <button key={i} className="suggestion" onClick={() => sendMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {searchResults && (
          <div className="search-section">
            <div className="search-header-bar">
              <span className="search-query">"{searchResults.query}"</span>
              <span className="search-count">{searchResults.items.length} resultados</span>
            </div>
            {searchResults.items.length === 0 && (
              <div className="no-results">No se encontraron productos para "{searchResults.query}"</div>
            )}
            <div className="products-grid">
              {searchResults.items.map(item => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="avatar">{msg.role === 'user' ? '👤' : '✨'}</div>
            <div className="bubble">
              {msg.hasImage && msg.role === 'user' && typeof msg.content === 'object' && (
                <img
                  src={msg.content.find(c => c.type === 'image_url')?.image_url?.url}
                  alt="imagen subida"
                  className="message-image"
                />
              )}
              {typeof msg.content === 'string' ? msg.content : msg.content.find(c => c.type === 'text')?.text || ''}
            </div>
          </div>
        ))}

        {(loading || searching) && (
          <div className="message assistant">
            <div className="avatar">{searching ? '🛒' : '✨'}</div>
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
        <div className={`input-wrapper ${searchMode ? 'search-mode' : ''}`}>
          {!searchMode && supportsVision && (
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
          {searchMode && (
            <div className="search-icon-input">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={searchMode ? "Buscar producto..." : (supportsVision ? "Escribi o subi una imagen..." : "Escribi tu mensaje...")}
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
