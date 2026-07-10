import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'Falta el parametro q' }, { status: 400 })
    }

    const res = await fetch(
      `https://api.mercadolibre.com/sites/MLA/search?q=${encodeURIComponent(query)}&limit=12`,
      { headers: { 'Accept': 'application/json' } }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Error de MercadoLibre' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
