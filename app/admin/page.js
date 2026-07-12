'use client'

import { useState, useEffect } from 'react'

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [newUser, setNewUser] = useState('')
  const [newPass, setNewPass] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  const loadUsers = async () => {
    if (!adminKey) return
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list-users', adminKey })
      })
      const data = await res.json()
      if (data.users) { setUsers(data.users); setAuthenticated(true) }
    } catch {}
  }

  useEffect(() => { if (adminKey && adminKey.length >= 6) loadUsers() }, [adminKey])

  const createUser = async (e) => {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', username: newUser, password: newPass, adminKey })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); setLoading(false); return }
      setSuccess(`Usuario "${newUser}" creado exitosamente!`)
      setNewUser(''); setNewPass('')
      loadUsers()
      setLoading(false)
    } catch { setError('Error de conexion'); setLoading(false) }
  }

  const deleteUser = async (id, name) => {
    if (!confirm(`Eliminar usuario "${name}"?`)) return
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete-user', username: String(id), adminKey })
    })
    loadUsers()
  }

  const togglePremium = async (id) => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle-premium', username: String(id), adminKey })
    })
    loadUsers()
  }

  const handleAuth = (e) => {
    e.preventDefault()
    loadUsers()
  }

  return (
    <div className="auth-page">
      <div className="admin-panel">
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
        <h1>Panel de Administracion</h1>
        <p className="admin-subtitle">Gestiona cuentas de usuarios premium</p>

        {!authenticated ? (
          <form onSubmit={handleAuth} className="admin-auth-form">
            <div className="admin-auth-input">
              <label>Clave de administrador:</label>
              <input type="password" placeholder="Ingresa la clave admin" value={adminKey} onChange={e => setAdminKey(e.target.value)} />
            </div>
            <button type="submit" className="admin-auth-btn">Acceder</button>
            {error && <div className="auth-error">{error}</div>}
          </form>
        ) : (
          <>
            <div className="admin-stats">
              <div className="admin-stat">
                <span className="admin-stat-number">{users.length}</span>
                <span className="admin-stat-label">Usuarios</span>
              </div>
              <div className="admin-stat">
                <span className="admin-stat-number">{users.filter(u => u.premium).length}</span>
                <span className="admin-stat-label">Premium</span>
              </div>
              <div className="admin-stat">
                <span className="admin-stat-number">{users.filter(u => u.role === 'admin').length}</span>
                <span className="admin-stat-label">Admins</span>
              </div>
            </div>

            <div className="admin-section">
              <h3>Crear nuevo usuario</h3>
              <form onSubmit={createUser} className="admin-form">
                <input type="text" placeholder="Nombre de usuario" value={newUser} onChange={e => setNewUser(e.target.value)} required minLength={3} maxLength={20} />
                <input type="password" placeholder="Contrasena (minimo 6)" value={newPass} onChange={e => setNewPass(e.target.value)} required minLength={6} />
                <button type="submit" disabled={loading} className="admin-create-btn">
                  {loading ? 'Creando...' : '+ Crear usuario'}
                </button>
              </form>
              {error && <div className="auth-error">{error}</div>}
              {success && <div className="auth-success">{success}</div>}
            </div>

            <div className="admin-section">
              <h3>Usuarios registrados</h3>
              <div className="admin-users">
                {users.length === 0 && <p className="admin-empty">No hay usuarios aun</p>}
                {users.map(u => (
                  <div key={u.id} className="admin-user">
                    <div className="admin-user-info">
                      <span className="admin-user-avatar">{u.username[0].toUpperCase()}</span>
                      <div className="admin-user-details">
                        <strong>{u.username}</strong>
                        <span className="admin-user-date">Creado: {u.created || 'N/A'}</span>
                      </div>
                      <span className={`admin-badge ${u.role}`}>{u.role}</span>
                      {u.premium && <span className="admin-badge premium">PREMIUM</span>}
                    </div>
                    <div className="admin-user-actions">
                      <button onClick={() => togglePremium(u.id)} className="admin-btn-sm">
                        {u.premium ? 'Quitar Premium' : 'Dar Premium'}
                      </button>
                      {u.role !== 'admin' && (
                        <button onClick={() => deleteUser(u.id, u.username)} className="admin-btn-sm danger">Eliminar</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <a href="/" className="admin-back">Volver al chat</a>
          </>
        )}
      </div>
    </div>
  )
}
