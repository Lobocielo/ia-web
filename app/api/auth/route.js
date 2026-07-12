import { NextResponse } from 'next/server'

const ADMIN_KEY = 'admin123'

let users = [
  { id: 1, username: 'admin', password: ADMIN_KEY, role: 'admin', premium: true, created: '2026-01-01' }
]

export async function POST(request) {
  const { action, username, password, adminKey } = await request.json()

  if (action === 'login') {
    const user = users.find(u => u.username === username && u.password === password)
    if (!user) return NextResponse.json({ error: 'Usuario o contrasena incorrecta' }, { status: 401 })
    return NextResponse.json({ user: { id: user.id, username: user.username, role: user.role, premium: user.premium } })
  }

  if (action === 'register') {
    if (adminKey !== ADMIN_KEY) return NextResponse.json({ error: 'Clave de admin invalida' }, { status: 403 })
    if (users.find(u => u.username === username)) return NextResponse.json({ error: 'Usuario ya existe' }, { status: 400 })
    const newUser = { id: users.length + 1, username, password, role: 'user', premium: true, created: new Date().toISOString().split('T')[0] }
    users.push(newUser)
    return NextResponse.json({ user: { id: newUser.id, username: newUser.username, role: newUser.role, premium: newUser.premium } })
  }

  if (action === 'list-users') {
    if (adminKey !== ADMIN_KEY) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    return NextResponse.json({ users: users.map(u => ({ id: u.id, username: u.username, role: u.role, premium: u.premium, created: u.created })) })
  }

  if (action === 'delete-user') {
    if (adminKey !== ADMIN_KEY) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    users = users.filter(u => u.id !== parseInt(username))
    return NextResponse.json({ ok: true })
  }

  if (action === 'toggle-premium') {
    if (adminKey !== ADMIN_KEY) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    const user = users.find(u => u.id === parseInt(username))
    if (user) user.premium = !user.premium
    return NextResponse.json({ ok: true, premium: user?.premium })
  }

  return NextResponse.json({ error: 'Accion invalida' }, { status: 400 })
}
