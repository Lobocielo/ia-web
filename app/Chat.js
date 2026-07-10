'use client'

import { useState, useRef, useEffect } from 'react'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    setError(null)
    const userMessage = { role: 'user', content: msg }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
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

  const clearChat = () => {
    setMessages([])
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
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="model-badge">Llama 3</span>
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
            <p>Escribime cualquier cosa y te respondo con la potencia de Groq + Llama 3.</p>
            <div className="suggestions">
              {suggestions.map((s, i) => (
                <button key={i} className="suggestion" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <div className="avatar">
              {msg.role === 'user' ? '👤' : '✨'}
            </div>
            <div className="bubble">{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="avatar">✨</div>
            <div className="bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribi tu mensaje..."
            rows={1}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
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
