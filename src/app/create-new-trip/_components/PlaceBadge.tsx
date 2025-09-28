"use client"

import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'


type Props = {
  name: string
  query?: string
}

export default function PlaceBadge({ name, query }: Props) {
  const [photoRef, setPhotoRef] = useState<string | null>(null)
  const [placeUrl, setPlaceUrl] = useState<string | null>(null)

  // Removed no-op effect with unused variables

  const searchKey = ['places-search', query || name]
  const { data } = useQuery({
    queryKey: searchKey,
    queryFn: async () => {
      const q = query || name
      const res = await fetch(`/api/google/places/search?query=${encodeURIComponent(q)}`)
      if (!res.ok) throw new Error('Search failed')
      return res.json()
    },
    enabled: !!(query || name),
  })

  useEffect(() => {
    const top = data?.results?.[0]
    const ref = top?.photos?.[0]?.photo_reference || null
    setPhotoRef(ref)
    setPlaceUrl(top?.url || (top?.place_id ? `https://www.google.com/maps/place/?q=place_id:${top.place_id}` : null))
  }, [data])

  return (
    <div className="flex items-center gap-2">
      <div className="size-20 rounded-md overflow-hidden bg-neutral-200">
        {photoRef ? (
          <img
            src={`/api/google/places/photo?photo_reference=${encodeURIComponent(photoRef)}&maxwidth=640`}
            alt={name}
            className="w-full h-full object-cover"
            
          />
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-800 font-medium">{name}</span>
        {placeUrl ? (
          <a
            href={placeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-sm bg-rose-700 px-2 py-1 text-[11px] font-semibold text-white shadow hover:bg-rose-800 transition"
            title="Open in Google Maps"
          >
            Open in Maps
          </a>
        ) : null}
      </div>
    </div>
  )
}


