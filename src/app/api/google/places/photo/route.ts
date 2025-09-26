import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const photo_reference = searchParams.get('photo_reference')
    const maxwidth = searchParams.get('maxwidth') || '800'
    if (!photo_reference) return NextResponse.json({ error: 'Missing photo_reference' }, { status: 400 })
    const key = process.env.GOOGLE_MAPS_API_KEY
    if (!key) return NextResponse.json({ error: 'Missing GOOGLE_MAPS_API_KEY' }, { status: 500 })

    const url = `https://maps.googleapis.com/maps/api/place/photo?photo_reference=${encodeURIComponent(photo_reference)}&maxwidth=${encodeURIComponent(maxwidth)}&key=${key}`
    const res = await fetch(url)
    const contentType = res.headers.get('content-type') || ''
    if (!res.ok || !/^image\//i.test(contentType)) {
      let message: any = undefined
      try {
        message = await res.json()
      } catch {
        try {
          message = await res.text()
        } catch {}
      }
      console.error('Places photo fetch failed', {
        status: res.status,
        contentType,
        message,
      })
      return NextResponse.json(
        { error: 'Google Places photo failed', status: res.status, message },
        { status: 502 }
      )
    }

    const buf = await res.arrayBuffer()
    return new NextResponse(Buffer.from(buf), {
      headers: {
        'Content-Type': contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (e: any) {
    console.error('Places photo route error', e)
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 })
  }
}


