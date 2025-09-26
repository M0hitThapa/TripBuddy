import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const place_id = searchParams.get('place_id')
    if (!place_id) return NextResponse.json({ error: 'Missing place_id' }, { status: 400 })
    const key = process.env.GOOGLE_MAPS_API_KEY
    if (!key) return NextResponse.json({ error: 'Missing GOOGLE_MAPS_API_KEY' }, { status: 500 })

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(place_id)}&key=${key}&fields=name,formatted_address,international_phone_number,opening_hours,photos,rating,website,url,price_level,geometry,editorial_summary` 
    const res = await fetch(url, { next: { revalidate: 120 } })
    const data = await res.json()
    if (!res.ok || data?.status && data.status !== 'OK') {
      console.error('Places details failed', { status: res.status, gStatus: data?.status, message: data?.error_message })
      return NextResponse.json({ error: 'Google Places details failed', status: data?.status, message: data?.error_message }, { status: 502 })
    }
    return NextResponse.json(data)
  } catch (e: any) {
    console.error('Places details route error', e)
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}


