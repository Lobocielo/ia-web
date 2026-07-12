import { NextResponse } from 'next/server'

export function middleware(request) {
  const response = NextResponse.next()

  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://image.pollinations.ai https://listado.mercadolibre.com.ar; connect-src 'self' https://api.groq.com https://openrouter.ai; frame-ancestors 'none';")

  const url = request.nextUrl.pathname

  if (url.startsWith('/api/')) {
    const contentType = request.headers.get('content-type')
    if (request.method === 'POST' && (!contentType || !contentType.includes('application/json'))) {
      if (!url.includes('/api/search')) {
        return NextResponse.json({ error: 'Content-Type invalido' }, { status: 415 })
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
