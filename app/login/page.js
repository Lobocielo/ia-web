'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      if (data.user.role === 'admin') { setError('Los administradores usan /admin-login'); setLoading(false); return }
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/')
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
        <div className="auth-badge-user">USUARIO</div>
        <h1>Iniciar Sesion</h1>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" placeholder="Contrasena" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <p className="auth-link">Solicitar cuenta? <a href="/register">Unite a Discord</a></p>
        <p className="auth-link"><a href="/admin-login">Sos admin? Entrar aqui</a></p>
      </div>
    </div>
  )
}
