import { NextResponse } from 'next/server'
import db from '../../../lib/db'

const ADMIN_USER = 'zt'
const ADMIN_PASS = 'ZT#Secure2026!'
const ADMIN_KEY = 'ZT#Secure2026!'

function sanitizeInput(str) {
  if (!str || typeof str !== 'string') return ''
  return str.trim().slice(0, 50)
}

function sanitizeDisplay(str) {
  if (!str || typeof str !== 'string') return ''
  return str.replace(/[<>"'&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' }[c])).trim().slice(0, 50)
}

let initialized = false

async function ensureDB() {
  if (initialized) return
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      premium INTEGER DEFAULT 1,
      created TEXT
    )
  `)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT,
      ip TEXT,
      action TEXT,
      username TEXT
    )
  `)
  const existing = await db.execute({ sql: 'SELECT id FROM users WHERE username = ?', args: [ADMIN_USER] })
  if (existing.rows.length === 0) {
    await db.execute({ sql: 'INSERT INTO users (username, password, role, premium, created) VALUES (?, ?, ?, ?, ?)', args: [ADMIN_USER, ADMIN_PASS, 'admin', 1, '2026-01-01'] })
  }
  initialized = true
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const ts = new Date().toISOString()

  try {
    await ensureDB()

    const body = await request.json()
    const { action, username, password, adminKey } = body

    if (!action || typeof action !== 'string') {
      return NextResponse.json({ error: 'Accion invalida' }, { status: 400 })
    }

    await db.execute({ sql: 'INSERT INTO logs (ts, ip, action, username) VALUES (?, ?, ?, ?)', args: [ts, ip, action, username || ''] })

    if (action === 'login') {
      const safeUser = sanitizeInput(username)
      const safePass = sanitizeInput(password)
      const result = await db.execute({ sql: 'SELECT * FROM users WHERE username = ? AND password = ?', args: [safeUser, safePass] })
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Usuario o contrasena incorrecta' }, { status: 401 })
      }
      const user = result.rows[0]
      return NextResponse.json({ user: { id: user.id, username: user.username, role: user.role, premium: !!user.premium } })
    }

    const safeUser = sanitizeDisplay(username)
    const safePass = sanitizeInput(password)
    const adminKeySafe = sanitizeInput(adminKey)

    if (action === 'register') {
      if (adminKeySafe !== ADMIN_KEY) return NextResponse.json({ error: 'Clave de admin invalida' }, { status: 403 })
      if (!safeUser || safeUser.length < 3) return NextResponse.json({ error: 'Usuario minimo 3 caracteres' }, { status: 400 })
      if (!safePass || safePass.length < 6) return NextResponse.json({ error: 'Contrasena minimo 6 caracteres' }, { status: 400 })
      const countResult = await db.execute('SELECT COUNT(*) as cnt FROM users')
      if (countResult.rows[0].cnt > 100) return NextResponse.json({ error: 'Limite de usuarios alcanzado' }, { status: 400 })
      const existing = await db.execute({ sql: 'SELECT id FROM users WHERE username = ?', args: [safeUser] })
      if (existing.rows.length > 0) return NextResponse.json({ error: 'Usuario ya existe' }, { status: 400 })
      const created = new Date().toISOString().split('T')[0]
      await db.execute({ sql: 'INSERT INTO users (username, password, role, premium, created) VALUES (?, ?, ?, ?, ?)', args: [safeUser, safePass, 'user', 1, created] })
      const newUser = await db.execute({ sql: 'SELECT * FROM users WHERE username = ?', args: [safeUser] })
      const u = newUser.rows[0]
      return NextResponse.json({ user: { id: u.id, username: u.username, role: u.role, premium: !!u.premium } })
    }

    if (action === 'list-users') {
      if (adminKeySafe !== ADMIN_KEY) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      const result = await db.execute('SELECT * FROM users ORDER BY id')
      return NextResponse.json({ users: result.rows.map(u => ({ id: u.id, username: u.username, role: u.role, premium: !!u.premium, created: u.created })) })
    }

    if (action === 'delete-user') {
      if (adminKeySafe !== ADMIN_KEY) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      const targetId = parseInt(username)
      if (!targetId || targetId === 1) return NextResponse.json({ error: 'No se puede eliminar al admin' }, { status: 400 })
      await db.execute({ sql: 'DELETE FROM users WHERE id = ? AND id != 1', args: [targetId] })
      return NextResponse.json({ ok: true })
    }

    if (action === 'toggle-premium') {
      if (adminKeySafe !== ADMIN_KEY) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      const targetId = parseInt(username)
      await db.execute({ sql: 'UPDATE users SET premium = CASE WHEN premium = 1 THEN 0 ELSE 1 END WHERE id = ?', args: [targetId] })
      const updated = await db.execute({ sql: 'SELECT premium FROM users WHERE id = ?', args: [targetId] })
      return NextResponse.json({ ok: true, premium: !!updated.rows[0]?.premium })
    }

    if (action === 'security-logs') {
      if (adminKeySafe !== ADMIN_KEY) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      const result = await db.execute('SELECT * FROM logs ORDER BY id DESC LIMIT 100')
      return NextResponse.json({ logs: result.rows })
    }

    if (action === 'security-stats') {
      if (adminKeySafe !== ADMIN_KEY) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      const total = await db.execute('SELECT COUNT(*) as cnt FROM users')
      const premium = await db.execute('SELECT COUNT(*) as cnt FROM users WHERE premium = 1')
      return NextResponse.json({
        totalUsers: total.rows[0].cnt,
        premiumUsers: premium.rows[0].cnt,
        failedLogins: [],
        rateLimits: []
      })
    }

    return NextResponse.json({ error: 'Accion invalida' }, { status: 400 })
  } catch (e) {
    console.error('Auth error:', e)
    return NextResponse.json({ error: 'Error en la peticion' }, { status: 400 })
  }
}
