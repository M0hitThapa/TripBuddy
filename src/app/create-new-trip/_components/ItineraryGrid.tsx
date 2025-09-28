"use client"

import React, { useEffect, useState } from 'react'
import { Sun, SunMedium, Moon, Star, StickyNote, CloudSun, Coffee, Hotel, Mountain } from 'lucide-react'
import PlaceBadge from './PlaceBadge'


type ItineraryItem = {
  day: number
  title?: string
  morning?: string
  afternoon?: string
  evening?: string
  notes?: string
  weather?: { summary?: string; tips?: string }
  cafes?: string[]
  hotels?: string[]
  adventures?: string[]
  cafeDetails?: { name: string; description?: string }[]
  hotelDetails?: { name: string; description?: string }[]
  adventureDetails?: { name: string; description?: string }[]
  photos?: string[]
}

type DayCostBreakdown = {
  day: number
  total: number
  hotels?: { name: string; price: number }[]
  activities?: { name: string; price: number }[]
}

type Props = {
  itinerary: ItineraryItem[]
  costs?: DayCostBreakdown[]
}

const ItineraryGrid = ({ itinerary, costs }: Props) => {
  const costByDay = new Map<number, DayCostBreakdown>((costs ?? []).map(c => [c.day, c]))

  // Cache photo references per day if AI didn't provide photos
  const [photoRefsByDay, setPhotoRefsByDay] = useState<Record<number, string[]>>({})

  // Extract a place-like term from free text (very light heuristic)
  const extractPlaceFromText = (t?: string) => {
    if (!t) return ''
    // try "in <Place>" or "to <Place>"
    const inMatch = t.match(/\b(?:in|to)\s+([A-Z][\w\s,'-]{2,})/)
    if (inMatch?.[1]) return inMatch[1].trim()
    // otherwise pick first Capitalized word sequence  (e.g., "Central Park")
    const capSeq = t.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/)
    return capSeq?.[1] || ''
  }

  // Build a best-effort search query for a day's image
  const buildQuery = (item: ItineraryItem) => {
    const direct = item.title || item.hotels?.[0] || item.cafes?.[0] || item.adventures?.[0]
    if (direct) return direct
    const fromText = extractPlaceFromText(item.morning) || extractPlaceFromText(item.afternoon) || extractPlaceFromText(item.evening)
    return fromText || 'landmark'
  }

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      const tasks = itinerary.map(async (it) => {
        // Skip if photos already exist
        if (Array.isArray(it.photos) && it.photos.length > 0) return
        if (photoRefsByDay[it.day]?.length) return
        const q = buildQuery(it)
        if (!q) return
        try {
          console.debug('[ItineraryGrid] fetching photo for day', it.day, 'query =', q)
          const res = await fetch(`/api/google/places/search?query=${encodeURIComponent(q)}`)
          if (!res.ok) return
          const data = await res.json()
          const ref: string | undefined = data?.results?.[0]?.photos?.[0]?.photo_reference
          console.debug('[ItineraryGrid] day', it.day, 'photo ref found =', !!ref)
          if (!cancelled && ref) {
            setPhotoRefsByDay((prev) => ({ ...prev, [it.day]: [ref] }))
          }
        } catch {
          // ignore fetch errors
        }
      })
      await Promise.all(tasks)
    }
    run()
    return () => { cancelled = true }
    // We intentionally don't include photoRefsByDay to avoid re-running on state change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itinerary])

  if (!itinerary?.length) return null
  return (
    <div className="p-6 h-full overflow-y-auto">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">Trip Itinerary</h2>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-neutral-200" />
        <div className="space-y-8">
          {itinerary.map((item) => (
            <section key={item.day} className="relative pl-10">
              <div className="absolute left-2 top-1 size-4 rounded-full bg-rose-500 shadow" />
              <h3 className="text-xl font-bold">Day {item.day}{item.title ? `: ${item.title}` : ''}</h3>
              <div className="mt-3 space-y-3">
                {/* Optional photos grid if provided */}
                {(() => {
                  const aiPhotos = Array.isArray(item.photos) && item.photos.length > 0 ? item.photos : []
                  const fallbackPhotos = photoRefsByDay[item.day] || []
                  const hasText = Boolean(item.title || item.morning || item.afternoon || item.evening || item.notes)

                  // Prefer AI-provided photos any time
                  if (aiPhotos.length > 0) {
                    return (
                      <div className="grid grid-cols-2 gap-2">
                        {aiPhotos.slice(0, 4).map((ref, idx) => (
                          <div key={`${ref}-${idx}`} className="aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100">
                            <img
                              src={`/api/google/places/photo?photo_reference=${encodeURIComponent(ref)}&maxwidth=640`}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )
                  }

                  // Only show fallback photos if there is at least some text content for the day
                  if (hasText && fallbackPhotos.length > 0) {
                    return (
                      <div className="grid grid-cols-2 gap-2">
                        {fallbackPhotos.slice(0, 4).map((ref, idx) => (
                          <div key={`${ref}-${idx}`} className="aspect-[4/3] overflow-hidden rounded-lg bg-neutral-100">
                            <img
                              src={`/api/google/places/photo?photo_reference=${encodeURIComponent(ref)}&maxwidth=640`}
                              alt={`Photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )
                  }

                  // Otherwise, don't render a photo grid at all for empty days
                  return null
                })()}
                {item.morning && (
                  <div className="flex items-start gap-2">
                    <Sun className="size-4.5 mt-1 text-amber-600" />
                    <div>
                      <div className="text-md font-semibold text-neutral-800">Morning</div>
                      <p className="text-md text-neutral-700 leading-relaxed">{item.morning}</p>
                    </div>
                  </div>
                )}
                {item.afternoon && (
                  <div className="flex items-start gap-2">
                    <SunMedium className="size-4.5 mt-1 text-sky-600" />
                    <div>
                      <div className="text-md font-semibold text-neutral-800">Afternoon</div>
                      <p className="text-md text-neutral-700 leading-relaxed">{item.afternoon}</p>
                    </div>
                  </div>
                )}
                {item.evening && (
                  <div className="flex items-start gap-2">
                    <Moon className="size-4.5 mt-1 text-indigo-600" />
                    <div>
                      <div className="text-md font-semibold text-neutral-800">Evening</div>
                      <p className="text-md text-neutral-700 leading-relaxed">{item.evening}</p>
                    </div>
                  </div>
                )}
                {item.notes && (
                  <div className="flex items-start gap-2">
                    <StickyNote className="size-4.5 mt-1 text-neutral-500" />
                    <p className="text-md text-neutral-600 leading-relaxed">{item.notes}</p>
                  </div>
                )}
                {(item.weather?.summary || item.weather?.tips) && (
                  <div className="flex items-start gap-2">
                    <CloudSun className="size-4.5 mt-1 text-orange-600" />
                    <div className="text-md text-neutral-700 leading-relaxed">
                      {item.weather?.summary && <div>Weather: {item.weather.summary}</div>}
                      {item.weather?.tips && <div className="text-sm text-neutral-500">Tip: {item.weather.tips}</div>}
                    </div>
                  </div>
                )}
                {item.cafeDetails?.length ? (
                  <div className="flex items-start gap-2">
                    <Coffee className="size-4.5 mt-1 text-rose-600" />
                    <div className="text-md text-neutral-700 leading-relaxed">
                      <div className="font-semibold text-neutral-800">Cafes</div>
                      <div className="ml-1 space-y-1">
                        {item.cafeDetails.map((c, idx) => (
                          <PlaceBadge key={`cafe-${c.name}-${idx}`} name={c.name} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : item.cafes?.length ? (
                  <div className="flex items-start gap-2">
                    <Coffee className="size-4.5 mt-1 text-rose-600" />
                    <div className="text-md text-neutral-700 leading-relaxed">
                      <div className="font-semibold text-neutral-800">Cafes</div>
                      <div className="ml-1 space-y-1">
                        {item.cafes.map((c, idx) => (
                          <PlaceBadge key={`cafe-${c}-${idx}`} name={c} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
                {item.hotelDetails?.length ? (
                  <div className="flex items-start gap-2">
                    <Hotel className="size-4.5 mt-1 text-indigo-600" />
                    <div className="text-md text-neutral-700 leading-relaxed">
                      <div className="font-semibold text-neutral-800">Hotels</div>
                      <div className="ml-1 space-y-1">
                        {item.hotelDetails.map((h, idx) => (
                          <PlaceBadge key={`hotel-${h.name}-${idx}`} name={h.name} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : item.hotels?.length ? (
                  <div className="flex items-start gap-2">
                    <Hotel className="size-4.5 mt-1 text-indigo-600" />
                    <div className="text-md text-neutral-700 leading-relaxed">
                      <div className="font-semibold text-neutral-800">Hotels</div>
                      <div className="ml-1 space-y-1">
                        {item.hotels.map((h, idx) => (
                          <PlaceBadge key={`hotel-${h}-${idx}`} name={h} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
                {item.adventureDetails?.length ? (
                  <div className="flex items-start gap-2">
                    <Mountain className="size-4.5 mt-1 text-emerald-600" />
                    <div className="text-md text-neutral-700 leading-relaxed">
                      <div className="font-semibold text-neutral-800">Adventures</div>
                      <div className="ml-1 space-y-1">
                        {item.adventureDetails.map((a, idx) => (
                          <PlaceBadge key={`adv-${a.name}-${idx}`} name={a.name} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : item.adventures?.length ? (
                  <div className="flex items-start gap-2">
                    <Mountain className="size-4.5 mt-1 text-emerald-600" />
                    <div className="text-md text-neutral-700 leading-relaxed">
                      <div className="font-semibold text-neutral-800">Adventures</div>
                      <div className="ml-1 space-y-1">
                        {item.adventures.map((a, idx) => (
                          <PlaceBadge key={`adv-${a}-${idx}`} name={a} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {costByDay.get(item.day) ? (
                  <div className="mt-2 space-y-1">
                    <div className="text-md font-semibold text-neutral-900">Costs (USD)</div>
                    {costByDay.get(item.day)?.hotels?.length ? (
                      <div className="text-md text-neutral-700">
                        Hotels: {costByDay.get(item.day)!.hotels!.map(h => `${h.name} ($${h.price})`).join(', ')}
                      </div>
                    ) : null}
                    {costByDay.get(item.day)?.activities?.length ? (
                      <div className="text-md text-neutral-700">
                        Activities: {costByDay.get(item.day)!.activities!.map(a => `${a.name} ($${a.price})`).join(', ')}
                      </div>
                    ) : null}
                    <div className="text-md text-neutral-800">Day total: ${costByDay.get(item.day)?.total?.toFixed?.(2) ?? costByDay.get(item.day)?.total}</div>
                  </div>
                ) : null}
                <div className="flex items-center gap-1 text-sm text-neutral-500">
                  <Star className="size-4" />
                  Highlights
                </div>
                <hr className="border-neutral-200 mt-2" />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ItineraryGrid


