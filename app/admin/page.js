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
  const [secStats, setSecStats] = useState(null)
  const [secLogs, setSecLogs] = useState([])
  const [showSecurity, setShowSecurity] = useState(false)

  const loadUsers = async () => {
    if (!adminKey) return
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list-users', adminKey })
      })
      const data = await res.json()
      if (data.users) { setUsers(data.users); setAuthenticated(true) }
      else if (data.error) { setError(data.error) }
    } catch { setError('Error de conexion') }
  }

  const loadSecurity = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'security-stats', adminKey }) }),
        fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'security-logs', adminKey }) })
      ])
      const statsData = await statsRes.json()
      const logsData = await logsRes.json()
      if (statsData.totalUsers !== undefined) setSecStats(statsData)
      if (logsData.logs) setSecLogs(logsData.logs.reverse())
    } catch {}
  }

  useEffect(() => { if (authenticated) loadSecurity() }, [authenticated])

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
    setError('')
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
        <p className="admin-subtitle">Gestiona cuentas y seguridad</p>

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

            <div className="admin-tabs">
              <button className={`admin-tab ${!showSecurity ? 'active' : ''}`} onClick={() => setShowSecurity(false)}>Usuarios</button>
              <button className={`admin-tab ${showSecurity ? 'active' : ''}`} onClick={() => { setShowSecurity(true); loadSecurity() }}>Seguridad</button>
            </div>

            {!showSecurity ? (
              <>
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
                          {u.premium && <span className="admin-badge premium">PRO</span>}
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
              </>
            ) : (
              <>
                <div className="admin-section">
                  <h3>Estadisticas de Seguridad</h3>
                  {secStats ? (
                    <div className="sec-stats-grid">
                      <div className="sec-stat-card">
                        <span className="sec-stat-icon">🔒</span>
                        <span className="sec-stat-val">{secStats.totalUsers}</span>
                        <span className="sec-stat-lbl">Usuarios Totales</span>
                      </div>
                      <div className="sec-stat-card">
                        <span className="sec-stat-icon">⭐</span>
                        <span className="sec-stat-val">{secStats.premiumUsers}</span>
                        <span className="sec-stat-lbl">Cuentas Premium</span>
                      </div>
                      <div className="sec-stat-card">
                        <span className="sec-stat-icon">🚫</span>
                        <span className="sec-stat-val">{secStats.failedLogins.length}</span>
                        <span className="sec-stat-lbl">IPs Bloqueadas</span>
                      </div>
                      <div className="sec-stat-card">
                        <span className="sec-stat-icon">⚡</span>
                        <span className="sec-stat-val">{secStats.rateLimits.length}</span>
                        <span className="sec-stat-lbl">Rate Limited</span>
                      </div>
                    </div>
                  ) : <p className="admin-empty">Cargando...</p>}
                </div>

                <div className="admin-section">
                  <h3>Actividad Reciente</h3>
                  <div className="sec-logs">
                    {secLogs.length === 0 && <p className="admin-empty">No hay logs</p>}
                    {secLogs.slice(0, 50).map((log, i) => (
                      <div key={i} className="sec-log-entry">
                        <span className="sec-log-time">{new Date(log.ts).toLocaleTimeString('es-AR')}</span>
                        <span className={`sec-log-action ${log.action}`}>{log.action}</span>
                        <span className="sec-log-user">{log.user || '-'}</span>
                        <span className="sec-log-ip">{log.ip?.slice(0, 12)}...</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-section">
                  <h3>Capas de Proteccion</h3>
                  <div className="sec-layers">
                    <div className="sec-layer active">
                      <span className="sec-layer-dot"></span>
                      <span>Rate Limiting (15 req/min)</span>
                    </div>
                    <div className="sec-layer active">
                      <span className="sec-layer-dot"></span>
                      <span>Brute Force Protection (5 intentos)</span>
                    </div>
                    <div className="sec-layer active">
                      <span className="sec-layer-dot"></span>
                      <span>XSS Protection Headers</span>
                    </div>
                    <div className="sec-layer active">
                      <span className="sec-layer-dot"></span>
                      <span>CSP (Content Security Policy)</span>
                    </div>
                    <div className="sec-layer active">
                      <span className="sec-layer-dot"></span>
                      <span>CORS Validation</span>
                    </div>
                    <div className="sec-layer active">
                      <span className="sec-layer-dot"></span>
                      <span>Input Sanitization</span>
                    </div>
                    <div className="sec-layer active">
                      <span className="sec-layer-dot"></span>
                      <span>HSTS (HTTPS Only)</span>
                    </div>
                    <div className="sec-layer active">
                      <span className="sec-layer-dot"></span>
                      <span>Frame Deny (Clickjacking)</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <a href="/" className="admin-back">Volver al chat</a>
          </>
        )}
      </div>
    </div>
  )
}
