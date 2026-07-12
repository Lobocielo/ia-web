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

  const loadUsers = async () => {
    if (!adminKey) return
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list-users', adminKey })
      })
      const data = await res.json()
      if (data.users) setUsers(data.users)
    } catch {}
  }

  useEffect(() => { if (adminKey) loadUsers() }, [adminKey])

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
      setSuccess(`Usuario "${newUser}" creado!`)
      setNewUser(''); setNewPass('')
      loadUsers()
      setLoading(false)
    } catch { setError('Error'); setLoading(false) }
  }

  const deleteUser = async (id) => {
    if (!confirm('Eliminar este usuario?')) return
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

  return (
    <div className="auth-page">
      <div className="auth-card" style={{maxWidth: 500}}>
        <div className="auth-logo">iA Chat</div>
        <h1>Panel de Admin</h1>

        <div className="admin-section">
          <label>Clave de administrador:</label>
          <input type="password" placeholder="Clave admin" value={adminKey} onChange={e => setAdminKey(e.target.value)} />
        </div>

        {adminKey && (
          <>
            <div className="admin-section">
              <h3>Crear usuario</h3>
              <form onSubmit={createUser} className="admin-form">
                <input type="text" placeholder="Nuevo usuario" value={newUser} onChange={e => setNewUser(e.target.value)} required />
                <input type="password" placeholder="Contrasena" value={newPass} onChange={e => setNewPass(e.target.value)} required />
                <button type="submit" disabled={loading}>{loading ? 'Creando...' : 'Crear'}</button>
              </form>
              {error && <div className="auth-error">{error}</div>}
              {success && <div className="auth-success">{success}</div>}
            </div>

            <div className="admin-section">
              <h3>Usuarios ({users.length})</h3>
              <div className="admin-users">
                {users.map(u => (
                  <div key={u.id} className="admin-user">
                    <div className="admin-user-info">
                      <strong>{u.username}</strong>
                      <span className={`admin-badge ${u.role}`}>{u.role}</span>
                      {u.premium && <span className="admin-badge premium">PREMIUM</span>}
                    </div>
                    <div className="admin-user-actions">
                      <button onClick={() => togglePremium(u.id)} className="admin-btn-sm">{u.premium ? 'Quitar Premium' : 'Dar Premium'}</button>
                      {u.role !== 'admin' && <button onClick={() => deleteUser(u.id)} className="admin-btn-sm danger">Eliminar</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
