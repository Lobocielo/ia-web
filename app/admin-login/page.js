'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
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
      if (data.user.role !== 'admin') { setError('Esta cuenta no es de administrador'); setLoading(false); return }
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/admin')
    } catch {
      setError('Error de conexion')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">iA Chat</div>
        <div className="auth-badge-admin">ADMIN</div>
        <h1>Panel de Administrador</h1>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Usuario admin" value={username} onChange={e => setUsername(e.target.value)} required />
          <input type="password" placeholder="Contrasena" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar al panel'}</button>
        </form>
        <p className="auth-link"><a href="/login">Ir a login de usuario</a></p>
      </div>
    </div>
  )
}
