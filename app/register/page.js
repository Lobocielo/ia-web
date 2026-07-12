'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

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
      setTimeout(() => router.push('/login'), 2000)
    } catch {
      setError('Error de conexion')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">iA Chat</div>
        <h1>Crear Cuenta</h1>
        {success ? (
          <div className="auth-success">Cuenta creada! Redirigiendo al login...</div>
        ) : (
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)} required />
            <input type="password" placeholder="Contrasena" value={password} onChange={e => setPassword(e.target.value)} required />
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
