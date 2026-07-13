import { NextResponse } from 'next/server'

const BLOCKED_IPS = new Set()
const BRUTE_FORCE = new Map()
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_MS = 300000

function checkBruteForce(ip) {
  const now = Date.now()
  const data = BRUTE_FORCE.get(ip)
  if (!data || now - data.start > LOCKOUT_MS) {
    BRUTE_FORCE.set(ip, { start: now, count: 1 })
    return true
  }
  data.count++
  if (data.count > MAX_LOGIN_ATTEMPTS) {
    BLOCKED_IPS.add(ip)
    return false
  }
  return true
}

function isBlocked(ip) {
  return BLOCKED_IPS.has(ip)
}

export function middleware(request) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  if (isBlocked(ip)) {
    return NextResponse.json({ error: 'IP bloqueada temporalmente.' }, { status: 429 })
  }

  const response = NextResponse.next()

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://image.pollinations.ai https://listado.mercadolibre.com.ar; connect-src 'self' https://api.groq.com https://openrouter.ai; frame-ancestors 'none'; base-uri 'self'; form-action 'self';")

  const url = request.nextUrl.pathname
  const method = request.method

  if (url.startsWith('/api/')) {
    if (method === 'POST') {
      if (!checkBruteForce(ip)) {
        return NextResponse.json({ error: 'Demasiados intentos. Espera 5 minutos.' }, { status: 429 })
      }
      const contentType = request.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return NextResponse.json({ error: 'Content-Type invalido' }, { status: 415 })
      }
      const origin = request.headers.get('origin')
      const host = request.headers.get('host')
      if (origin && host && !origin.includes(host)) {
        return NextResponse.json({ error: 'Origen no valido' }, { status: 403 })
      }
    }

    if (method === 'GET' && url.includes('/api/')) {
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
    }
  }

  if (url === '/' || url === '/login' || url === '/register') {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
