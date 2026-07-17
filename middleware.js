import { NextResponse } from 'next/server'

export function middleware(request) {
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()')
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://image.pollinations.ai https://*.mercadolibre.com.ar https://*.mercadolibre.com https://*.mstatic.com https://http2.mlstatic.com https://*.cloudfront.net; connect-src 'self' https://*.turso.io https://api.groq.com https://openrouter.ai https://image.pollinations.ai; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none';")
  
  // CORS for API routes
  const url = request.nextUrl
  if (url.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}