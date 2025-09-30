import React, { useMemo, useState } from 'react'
import { 
  Mountain, Camera, Palette, Utensils, PartyPopper, Bed, 
  Waves, TreePine, Music, ShoppingBag, Globe2 
} from 'lucide-react'

export const TravelInterestOptions = [
  { id: 1, title: 'Adventure', Icon: Mountain, bg: 'bg-rose-100', text: 'text-rose-700' },
  { id: 2, title: 'Sightseeing', Icon: Camera, bg: 'bg-sky-100', text: 'text-sky-700' },
  { id: 3, title: 'Cultural', Icon: Palette, bg: 'bg-amber-100', text: 'text-amber-700' },
  { id: 4, title: 'Food', Icon: Utensils, bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { id: 5, title: 'Nightlife', Icon: PartyPopper, bg: 'bg-fuchsia-100', text: 'text-fuchsia-700' },
  { id: 6, title: 'Relaxation', Icon: Bed, bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { id: 7, title: 'Beach', Icon: Waves, bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { id: 8, title: 'Nature', Icon: TreePine, bg: 'bg-green-100', text: 'text-green-700' },
  { id: 9, title: 'Music & Festivals', Icon: Music, bg: 'bg-purple-100', text: 'text-purple-700' },
  { id: 10, title: 'Shopping', Icon: ShoppingBag, bg: 'bg-pink-100', text: 'text-pink-700' },
  { id: 11, title: 'Global Experiences', Icon: Globe2, bg: 'bg-teal-100', text: 'text-teal-700' },
]

type TravelInterestUiProps = { onSelectedOption: (value: string) => void }

function TravelInterestUi({ onSelectedOption }: TravelInterestUiProps) {
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (title: string) => {
    setSelected((prev) => {
      const exists = prev.includes(title)
      if (exists) return prev.filter((t) => t !== title)
      return [...prev, title]
    })
  }

  const canSubmit = selected.length >= 1
  const helperText = useMemo(() => {
    if (selected.length === 0) return 'Choose one or more interests'
    return `${selected.length} selected`
  }, [selected])

  return (
    <div className="mt-4 max-w-lg">
      <div className="text-sm text-neutral-700 mb-3">Pick your travel interests</div>
      <div className="flex flex-wrap gap-3">
        {TravelInterestOptions.map((item) => {
          const isSelected = selected.includes(item.title)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.title)}
              className={`flex items-center gap-2 px-2 py-1 rounded-full border text-sm font-medium shadow-sm transition 
                ${isSelected 
                  ? 'bg-neutral-900 text-white border-neutral-900' 
                  : `${item.bg} ${item.text} border-transparent hover:opacity-90`}`}
            >
              <item.Icon className="w-4 h-4" />
              {item.title}
            </button>
          )
        })}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-neutral-600">{helperText}</div>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => onSelectedOption(`Interests: ${selected.join(', ')}`)}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition 
            ${canSubmit 
              ? 'bg-rose-700 text-white hover:bg-rose-800' 
              : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'}`}
        >
          Submit
        </button>
      </div>
    </div>
  )
}

export default TravelInterestUi
