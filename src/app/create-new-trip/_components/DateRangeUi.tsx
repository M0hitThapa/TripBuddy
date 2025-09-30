'use client'

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { DateRange } from 'react-day-picker'

type Props = {
  onSelectedRange: (value: string) => void
  autoOpen?: boolean
  maxDays?: number
}

const DateRangeUi = ({ onSelectedRange, autoOpen = false, maxDays }: Props) => {
  const [open, setOpen] = useState(autoOpen)
  const [range, setRange] = useState<DateRange | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

  const isValid = Boolean(range?.from && range?.to)

  const formatted = useMemo(() => {
    if (!range?.from || !range?.to) return null
    const toISO = (d: Date) => d.toISOString().slice(0, 10)
    return `Travel dates: from ${toISO(range.from)} to ${toISO(range.to)}`
  }, [range])

  function submit() {
    if (!isValid || !formatted) return
    // Validate maxDays if provided
    if (maxDays && range?.from && range?.to) {
      const from = new Date(range.from)
      const to = new Date(range.to)
      from.setHours(0,0,0,0); to.setHours(0,0,0,0)
      const ms = Math.max(0, to.getTime() - from.getTime())
      const days = Math.floor(ms / (24 * 60 * 60 * 1000)) + 1
      if (days > maxDays) {
        setError(`You can only generate up to ${maxDays} days. Please choose a shorter range.`)
        return
      }
    }
    setError(null)
    onSelectedRange(formatted)
    setOpen(false)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select your travel dates</DialogTitle>
          <DialogDescription>Choose a start and end date for your trip.</DialogDescription>
        </DialogHeader>
        <div className='flex justify-center'>
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={range}
            onSelect={setRange}
            disabled={{ before: today }}
          />
        </div>
        {error && (
          <div className="mt-3 text-sm text-red-600">{error}</div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!isValid} onClick={submit}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default DateRangeUi


