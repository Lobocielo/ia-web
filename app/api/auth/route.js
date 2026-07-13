import { NextResponse } from 'next/server'

const ADMIN_USER = 'zt'
const ADMIN_PASS = 'ZT#Secure2026!'
const ADMIN_KEY = 'ZT#AdminKey2026!'

const rateLimit = new Map()
const MAX_REQUESTS = 15
const WINDOW_MS = 60000

function checkRateLimit(ip) {
  const now = Date.now()
  const data = rateLimit.get(ip)
  if (!data || now - data.start > WINDOW_MS) {
    rateLimit.set(ip, { start: now, count: 1 })
    return true
  }
  data.count++
  if (data.count > MAX_REQUESTS) return false
  return true
}

function sanitizeInput(str) {
  if (!str || typeof str !== 'string') return ''
  return str.trim().slice(0, 50)
}

function sanitizeDisplay(str) {
  if (!str || typeof str !== 'string') return ''
  return str.replace(/[<>"'&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;' }[c])).trim().slice(0, 50)
}

let users = [
  { id: 1, username: ADMIN_USER, password: ADMIN_PASS, role: 'admin', premium: true, created: '2026-01-01' }
]

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Demasiadas peticiones. Espera un momento.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const { action, username, password, adminKey } = body

    if (action === 'login') {
      const user = users.find(u => u.username === sanitizeInput(username) && u.password === sanitizeInput(password))
      if (!user) return NextResponse.json({ error: 'Usuario o contrasena incorrecta' }, { status: 401 })
      return NextResponse.json({ user: { id: user.id, username: user.username, role: user.role, premium: user.premium } })
    }

    const safeUser = sanitizeDisplay(username)
    const safePass = sanitizeInput(password)

    if (action === 'register') {
      if (adminKey !== ADMIN_KEY) return NextResponse.json({ error: 'Clave de admin invalida' }, { status: 403 })
      if (!safeUser || safeUser.length < 3) return NextResponse.json({ error: 'Usuario minimo 3 caracteres' }, { status: 400 })
      if (!safePass || safePass.length < 6) return NextResponse.json({ error: 'Contrasena minimo 6 caracteres' }, { status: 400 })
      if (users.find(u => u.username === safeUser)) return NextResponse.json({ error: 'Usuario ya existe' }, { status: 400 })
      const newUser = { id: users.length + 1, username: safeUser, password: safePass, role: 'user', premium: true, created: new Date().toISOString().split('T')[0] }
      users.push(newUser)
      return NextResponse.json({ user: { id: newUser.id, username: newUser.username, role: newUser.role, premium: newUser.premium } })
    }

    const adminKeySafe = sanitizeInput(adminKey)

    if (action === 'list-users') {
      if (adminKeySafe !== ADMIN_KEY) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      return NextResponse.json({ users: users.map(u => ({ id: u.id, username: u.username, role: u.role, premium: u.premium, created: u.created })) })
    }

    if (action === 'delete-user') {
      if (adminKeySafe !== ADMIN_KEY) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      users = users.filter(u => u.id !== parseInt(username))
      return NextResponse.json({ ok: true })
    }

    if (action === 'toggle-premium') {
      if (adminKeySafe !== ADMIN_KEY) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
      const user = users.find(u => u.id === parseInt(username))
      if (user) user.premium = !user.premium
      return NextResponse.json({ ok: true, premium: user?.premium })
    }

    return NextResponse.json({ error: 'Accion invalida' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Error en la peticion' }, { status: 400 })
  }
}
