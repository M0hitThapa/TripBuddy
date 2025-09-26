import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query')
    if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 })
    const key = process.env.GOOGLE_MAPS_API_KEY
    if (!key) return NextResponse.json({ error: 'Missing GOOGLE_MAPS_API_KEY' }, { status: 500 })

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${key}`
    const res = await fetch(url, { next: { revalidate: 120 } })
    const data = await res.json()
    if (!res.ok || data?.status && data.status !== 'OK') {
      console.error('Places search failed', { status: res.status, gStatus: data?.status, message: data?.error_message })
      return NextResponse.json({ error: 'Google Places search failed', status: data?.status, message: data?.error_message }, { status: 502 })
    }
    return NextResponse.json(data)
  } catch (e: any) {
    console.error('Places search route error', e)
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}


