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
        <div className="auth-logo">iA Chat</div>
        <h1>Iniciar Sesion</h1>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" placeholder="Contrasena" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </form>
        <p className="auth-link">No tenes cuenta? <a href="/register">Registrate</a></p>
      </div>
    </div>
  )
}
