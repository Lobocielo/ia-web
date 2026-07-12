'use client'

import { useState } from 'react'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', username, password, adminKey })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setSuccess(true)
      setLoading(false)
      setTimeout(() => { window.location.href = 'https://discord.gg/KmpPP4SGxm' }, 2000)
    } catch {
      setError('Error de conexion')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <svg viewBox="0 0 32 32" fill="none" width="32" height="32">
            <defs>
              <linearGradient id="authGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4ff"/>
                <stop offset="50%" stopColor="#6366f1"/>
                <stop offset="100%" stopColor="#a855f7"/>
              </linearGradient>
            </defs>
            <circle cx="16" cy="16" r="15" fill="url(#authGrad)"/>
            <path d="M10 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
            <circle cx="12" cy="13" r="2" fill="white"/>
            <circle cx="20" cy="13" r="2" fill="white"/>
          </svg>
          <span>Nexus AI</span>
        </div>
        <h1>Crear Cuenta</h1>
        {success ? (
          <>
            <div className="auth-success">Cuenta creada! Redirigiendo a Discord...</div>
            <a href="https://discord.gg/KmpPP4SGxm" className="discord-btn" target="_blank" rel="noopener noreferrer">
              Unirte al Discord
            </a>
          </>
        ) : (
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} maxLength={20} />
            <input type="password" placeholder="Contrasena (minimo 6)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            <input type="password" placeholder="Clave de administrador" value={adminKey} onChange={e => setAdminKey(e.target.value)} required />
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear Cuenta'}</button>
          </form>
        )}
        <p className="auth-link">Ya tenes cuenta? <a href="/login">Inicia sesion</a></p>
      </div>
    </div>
  )
}
