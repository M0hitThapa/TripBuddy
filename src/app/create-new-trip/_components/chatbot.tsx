'use client'

import SignOutButtons from '@/components/signoutbutton'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, PlaneTakeoff, ShoppingBag, Sun } from 'lucide-react'
import { LoaderOne } from '@/components/ui/loaderOne'
import axios, { type AxiosResponse } from "axios"
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
// removed useUser (unused)
import { useUserDetail } from '@/app/provider'
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import EmptyBoxState from './EmptyBoxState'
import GroupSizeUi from './GroupSizeUi'
import BudgetUi from './BudgetUi'
import DateRangeUi from './DateRangeUi'
import TravelInterestUi from './TravelInterestUi'

type Message = {
  id: string,
  role: string,
  content: string,
  ui?: string
}

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
}

type DayCostBreakdown = {
  day: number
  total: number
  hotels?: { name: string; price: number }[]
  activities?: { name: string; price: number }[]
}

type AiResponse = {
  resp: string
  ui?: string
  itinerary?: ItineraryItem[]
  budget?: {
    currency?: string
    total?: number
    breakdown?: DayCostBreakdown[]
  }
}

type ChatbotProps = {
  onFinal?: (payload: AiResponse) => void
  editTripId?: string | null
}

const Chatbot = ({ onFinal, editTripId }: ChatbotProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [hasSelectedDateRange, setHasSelectedDateRange] = useState(false)
  const [tripGenerated, setTripGenerated] = useState(false)
  const [showPlanningDuringLoading, setShowPlanningDuringLoading] = useState(false)
  const [pendingRequest, setPendingRequest] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [desiredDays, setDesiredDays] = useState<number | null>(null)
  const MAX_TRIP_DAYS = 5
  const [showDayLimitModal, setShowDayLimitModal] = useState(false)
  
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const lastSendAtRef = useRef<number>(0)
  const createTrip = useMutation(api.tripDetail.CreateTripDetail)
  const updateTrip = useMutation(api.tripDetail.UpdateTripDetail)
  // no current user usage needed here
  const { userDetail } = useUserDetail() as { userDetail?: { _id?: string } }

  // Enhanced starter prompts covering different travel types and budgets (memoized)
  const starterPrompts = useMemo(() => ([
    { label: 'Plan a trip', Icon: PlaneTakeoff, bg: 'bg-blue-100', text: 'text-blue-700' },
    { label: 'Plan a weekend getaway', Icon: Sun, bg: 'bg-orange-100', text: 'text-orange-700' },
    { label: 'Plan a budget-friendly trip', Icon: ShoppingBag, bg: 'bg-pink-100', text: 'text-pink-700' },
  ]), [])

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  const onSend = useCallback(async (overrideContent?: string) => {
    const contentToSend = (overrideContent ?? userInput ?? '').trim()
    if (!contentToSend) return

    const now = Date.now()
    // Prevent rapid duplicate sends
    if (now - lastSendAtRef.current < 500) return
    lastSendAtRef.current = now

    // Prevent duplicate requests with same content
    if (pendingRequest === contentToSend) return
    
    if (loading) return

    // Enhanced prediction for final step
    try {
      const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant' && m.ui)
      const lastUi = lastAssistant?.ui as string | undefined
      const conversationContent = messages.map(m => m.content?.toLowerCase() || '').join(' ')
      
      const expectFinal = lastUi === 'travelInterest' || 
                         messages.length > 10 ||
                         (conversationContent.includes('budget') && 
                          conversationContent.includes('destination') &&
                          conversationContent.includes('group'))
      
      setShowPlanningDuringLoading(expectFinal)
    } catch {}

    // Try to capture desired trip length from user content
    let overLimit = false
    try {
      // From date range message: "Travel dates: from YYYY-MM-DD to YYYY-MM-DD"
      const dateMatch = contentToSend.match(/Travel dates: from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})/i)
      if (dateMatch) {
        const from = new Date(dateMatch[1] as string)
        const to = new Date(dateMatch[2] as string)
        from.setHours(0,0,0,0); to.setHours(0,0,0,0)
        const ms = Math.max(0, to.getTime() - from.getTime())
        const days = Math.floor(ms / (24 * 60 * 60 * 1000)) + 1
        if (Number.isFinite(days) && days > 0) {
          if (days > MAX_TRIP_DAYS) {
            setDesiredDays(MAX_TRIP_DAYS)
            setShowDayLimitModal(true)
            overLimit = true
          } else {
            setDesiredDays(days)
          }
        }
      } else {
        // From free text like "10 days", "for 7-day", "a 5 day trip"
        const numMatch = contentToSend.match(/\b(\d{1,3})\s*-?\s*day(s)?\b/i)
        if (numMatch) {
          const n = parseInt(numMatch[1] as string, 10)
          if (Number.isFinite(n) && n > 0) {
            if (n > MAX_TRIP_DAYS) {
              setDesiredDays(MAX_TRIP_DAYS)
              setShowDayLimitModal(true)
              overLimit = true
            } else {
              setDesiredDays(n)
            }
          }
        }
      }
    } catch {}

    // If the user requested more than the allowed days, stop here (do not send to API or add chat messages)
    if (overLimit) {
      return
    }

    setLoading(true)
    setPendingRequest(contentToSend)

    if (!overrideContent) setUserInput('')

    // Add explicit trip duration context if we know it
    let enrichedContent = contentToSend
    if (desiredDays && desiredDays > 0 && contentToSend.toLowerCase().includes('travel dates:')) {
      enrichedContent = `${contentToSend}\n\nIMPORTANT: This is a ${desiredDays}-day trip. Please generate a complete ${desiredDays}-day itinerary with all details for each day.`
    }

    const newMsg: Message = {
      id: `${Date.now()}-${Math.random()}`,
      role: 'user',
      content: enrichedContent
    }

    setMessages((prev: Message[]) => [...prev, newMsg])

    try {
      // Cancel any in-flight request
      if (abortRef.current) {
        abortRef.current.abort()
      }
      abortRef.current = new AbortController()

      const maxAttempts = 2
      let attempt = 0
      let lastError: unknown = null
      let result: AxiosResponse<AiResponse> | null = null

      while (attempt < maxAttempts) {
        try {
          console.log(`Attempt ${attempt + 1}/${maxAttempts} for:`, contentToSend.slice(0, 50))
          
          result = await axios.post('/api/aimodel', {
            messages: [...messages, newMsg]
          }, { 
            timeout: 90000, 
            signal: abortRef.current.signal,
            headers: {
              'Content-Type': 'application/json'
            }
          })
          
          if (result) {
            console.log('API Response:', result.data)
          }
          break

        } catch (err: unknown) {
          lastError = err
          attempt++
          
          // Don't retry on user cancellation
          if (axios.isCancel?.(err as never) || (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === 'ERR_CANCELED')) {
            throw err
          }

          // Don't retry on certain errors
          const errorMsg = (typeof err === 'object' && err !== null && 'response' in err && (err as { response?: { data?: { error?: string } } }).response?.data?.error) || (err instanceof Error ? err.message : '')
          if (errorMsg.includes('Missing OPENROUTER_API_KEY') || 
              errorMsg.includes('Invalid request') ||
              (typeof err === 'object' && err !== null && 'response' in err && (((err as { response?: { status?: number } }).response?.status === 401) || ((err as { response?: { status?: number } }).response?.status === 403)))) {
            throw err
          }

          if (attempt >= maxAttempts) break

          // Exponential backoff with jitter
          const backoffMs = (1000 * Math.pow(2, attempt - 1)) + (Math.random() * 1000)
          console.log(`Retrying in ${backoffMs}ms after error:`, errorMsg)
          await new Promise(res => setTimeout(res, backoffMs))
        }
      }

      if (!result) throw (lastError ?? new Error('Request failed after retries'))

      // Validate response structure
      if (!result.data || typeof result.data !== 'object') {
        throw new Error('Invalid response format from API')
      }

      if (!result.data.resp || typeof result.data.resp !== 'string') {
        throw new Error('Missing response text from API')
      }

      const assistantMessage: Message = {
        id: `${Date.now()}-${Math.random()}`,
        role: 'assistant',
        content: result.data.resp,
        ui: result.data.ui
      }

      setMessages((prev: Message[]) => [...prev, assistantMessage])

      if (result.data?.ui === 'Final') {
        // Enforce itinerary length to match desiredDays if set
        try {
          if (desiredDays && Array.isArray(result.data.itinerary)) {
            const current = result.data.itinerary as ItineraryItem[]
            let adjusted: ItineraryItem[] = current
            if (current.length > desiredDays) {
              adjusted = current.slice(0, desiredDays)
            } else if (current.length < desiredDays) {
              // Generate varied placeholder days (lightweight, diverse templates)
              const templates: Omit<ItineraryItem, 'day'>[] = [
                {
                  title: 'Leisure & Local Discovery',
                  morning: 'Start with a relaxed breakfast, stroll a nearby market or old town lanes.',
                  afternoon: 'Visit a well-rated museum or green park; enjoy a local cafe.',
                  evening: 'Dinner at a recommended bistro and a riverside or promenade walk.',
                },
                {
                  title: 'Hidden Gems & Culture',
                  morning: 'Free walking tour or explore a street-art district with coffee stops.',
                  afternoon: 'Cultural center or lesser-known attraction; sample a regional snack.',
                  evening: 'Catch sunset from a viewpoint; consider live music or a local event.',
                },
                {
                  title: 'Foodie Trail',
                  morning: 'Cafe hop; try a signature local pastry or brunch special.',
                  afternoon: 'Visit a popular lunch spot; browse a specialty food market.',
                  evening: 'Book dinner at a recommended restaurant; explore a night market.',
                },
                {
                  title: 'Nature & Relaxation',
                  morning: 'Take a scenic walk, short hike, or botanical garden visit.',
                  afternoon: 'Relax at a garden/beach/riverfront; optional spa or tea stop.',
                  evening: 'Casual dinner and quiet neighborhood stroll for dessert.',
                },
              ]
              adjusted = [...current]
              for (let d = current.length + 1; d <= desiredDays; d++) {
                const t = templates[(d - 1) % templates.length]
                adjusted.push({
                  day: d,
                  title: t.title,
                  morning: t.morning,
                  afternoon: t.afternoon,
                  evening: t.evening,
                })
              }
            }
            result.data.itinerary = adjusted.map((it: ItineraryItem, idx: number) => ({ ...it, day: idx + 1 }))
          }
        } catch {}

        onFinal?.(result.data)
        
        try {
          if (userDetail?._id) {
            if (editTripId) {
              await updateTrip({ id: (editTripId as unknown as Id<'TripDetailTable'>), tripDetail: result.data })
              console.log('Trip updated successfully')
            } else {
              await createTrip({
                tripId: `${Date.now()}`,
                uid: (userDetail._id as unknown as Id<'userTable'>),
                tripDetail: result.data,
              })
              console.log('Trip saved successfully')
            }
          }
        } catch (e) {
          console.error('Failed to save trip:', e)
          // Don't throw here, trip generation was successful
        }
        
        setTripGenerated(true)
        setTimeout(() => setTripGenerated(false), 4000)
      }

      // Reset retry count on success
      setRetryCount(0)

    } catch (error: unknown) {
      console.error('Chat error:', error)
      
      if (axios.isCancel?.(error as never) || (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'ERR_CANCELED')) {
        return // Ignore canceled requests
      }

      const errMsg = (typeof error === 'object' && error !== null && 'response' in error && (error as { response?: { data?: { error?: string } } }).response?.data?.error) || (error instanceof Error ? error.message : 'Server error')
      const isTimeout = /timeout|ECONNABORTED/i.test(errMsg)
      const isNetworkError = /network|fetch/i.test(errMsg.toLowerCase())
      
      let friendly: string
      if (isTimeout) {
        friendly = 'The AI took too long to respond. Please try again with a shorter message.'
      } else if (isNetworkError) {
        friendly = 'Network connection issue. Please check your internet and try again.'
      } else if (errMsg.includes('Missing OPENROUTER_API_KEY')) {
        friendly = 'API configuration error. Please contact support.'
      } else if (errMsg.includes('All model fallbacks failed')) {
        friendly = 'I\'m having trouble connecting to our AI services. Please try again in a moment.'
      } else {
        friendly = `Sorry, I encountered an error: ${errMsg}. Please try again.`
      }

      const errorMessage: Message = {
        id: `${Date.now()}-${Math.random()}`,
        role: 'assistant',
        content: friendly,
      }

      setMessages((prev: Message[]) => [...prev, errorMessage])
      setRetryCount(prev => prev + 1)

    } finally {
      setLoading(false)
      setShowPlanningDuringLoading(false)
      setPendingRequest(null)
    }
  }, [messages, userInput, loading, pendingRequest, userDetail, onFinal, createTrip, updateTrip, editTripId, desiredDays])

  const RenderGenerativeUi = useCallback((ui: string, autoOpen: boolean) => {
    if (ui === 'budget') {
      return <BudgetUi onSelectedOption={(v: string) => { onSend(v); }} />
    } else if (ui === 'groupSize') {
      return <GroupSizeUi onSelectedOption={(v: string) => { onSend(v); }} />
    } else if (ui === 'dateRange') {
      return (
        <DateRangeUi 
          autoOpen={autoOpen && !hasSelectedDateRange} 
          maxDays={5}
          onSelectedRange={(v: string) => { 
            setHasSelectedDateRange(true)
            onSend(v)
          }} 
        />
      )
    } else if (ui === 'travelInterest') {
      return <TravelInterestUi onSelectedOption={(v: string) => { onSend(v); }} />
    }
    return null
  }, [onSend, hasSelectedDateRange])

  const lastAssistantUiIndex = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i] as Message
      if (m.role === 'assistant' && m.ui) return i
    }
    return -1
  }, [messages])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }, [onSend])

  // Group starter prompts for better display
  const groupedPrompts = useMemo(() => {
    const shuffled = [...starterPrompts].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 6) // Show 6 random prompts
  }, [starterPrompts])

  const renderStarterPrompts = useCallback(() => (
    <div className='mb-3'>
      <div className='text-xs font-medium text-neutral-600 mb-2 px-1'>
        click to start
      </div>
      <div className='grid gap-2 max-h-64 overflow-y-auto'>
        {groupedPrompts.map((p, i) => (
          <button
            key={i}
            type='button'
            disabled={loading}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer text-left ${
              loading 
                ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed' 
                : 'hover:bg-gray-100 text-neutral-900'
            }`}
            onClick={() => onSend(p.label)}
            title={p.label}
          >
            <span className={`inline-flex items-center justify-center size-7 rounded-md ${p.bg} ${p.text}`}>
              {React.createElement(p.Icon, { className: 'w-4 h-4' })}
            </span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  ), [groupedPrompts, loading, onSend])

  return (
    <div className='border-r border-gray-200 h-full min-h-0 flex flex-col'>
      <section className='border-b-2 border-gray-200 bg-neutral-50 p-2'>
        <div className="z-10 flex justify-between">
          <SidebarTrigger className="bg-white border-2 border-neutral-300 rounded-md shadow p-5" />
          <div className='flex items-center gap-2'>
            <button
              type='button'
              className='px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-sm shadow-md transition-all duration-300 cursor-pointer font-semibold'
              onClick={() => {
                const params = new URLSearchParams(searchParams?.toString?.() || '')
                params.delete('edit')
                params.set('new', '1')
                router.push(`/create-new-trip?${params.toString()}`)
              }}
            >
              New Trip
            </button>
            <SignOutButtons />
          </div>
        </div>
      </section>

      {messages?.length === 0 && <EmptyBoxState />}
      
      {tripGenerated && (
        <div className='px-4 py-2 bg-emerald-50 text-emerald-800 text-sm border-b border-emerald-100'>
          {editTripId ? 'Trip updated!' : 'Trip generated!'} Scroll to view your itinerary.
        </div>
      )}

      {retryCount > 2 && (
        <div className='px-4 py-2 bg-amber-50 text-amber-800 text-sm border-b border-amber-100'>
          Having trouble connecting. Try refreshing the page if issues persist.
        </div>
      )}

      <section className='p-4 flex-1 min-h-0 overflow-y-auto'>
        {messages.map((msg: Message, index: number) => (
          msg.role === 'user' ? (
            <div className='flex justify-end mt-2' key={msg.id}>
              <div className='max-w-md bg-gray-200 text-neutral-900 font-medium px-3 py-2 rounded-lg text-sm'>
                {msg.content}
              </div>
            </div>
          ) : (
            <div className='flex justify-start mt-2' key={msg.id}>
              <div className='max-w-lg text-neutral-900 font-medium px-3 py-2 text-sm'>
                {msg.content}
                {msg.ui && RenderGenerativeUi(msg.ui, index === lastAssistantUiIndex)}
              </div>
            </div>
          )
        ))}

        {loading && (
          <div className='flex justify-start mt-2'>
            <div className='max-w-lg px-3 py-2'>
              <div className='flex items-center gap-3'>
                <LoaderOne />
                {showPlanningDuringLoading ? (
                  <span className='text-sm text-neutral-600'>Creating your personalized itinerary...</span>
                ) : (
                  <span className='text-sm text-neutral-600'>Thinking...</span>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div ref={endOfMessagesRef} />
      </section>

      <section className='mx-5'>
        {/* Enhanced starter prompts (only before chat starts) */}
        {messages.length === 0 && renderStarterPrompts()}

        <div className='relative mb-6'>
          <Textarea 
            placeholder='Plan Your Trip...' 
            className='w-full h-32 resize-none py-2 px-3 rounded-xl shadow-input bg-white focus-visible:border-2 border-2'
            onChange={(event) => setUserInput(event.target.value)} 
            value={userInput}
            disabled={loading}
            aria-busy={loading}
            onKeyDown={handleKeyDown}
          />
          <Button 
            size="icon" 
            className='absolute bottom-4 right-4 cursor-pointer rounded-sm shadow-md p-1 bg-rose-700 hover:bg-rose-800' 
            onClick={() => onSend()} 
            disabled={loading || !userInput.trim()} 
            title={loading ? 'Waiting for AI...' : 'Send'}
          >
            {loading ? (
              <Loader2 className='size-5 text-neutral-200 animate-spin' />
            ) : (
              <Send className='size-5 text-neutral-200' />
            )}
          </Button>
        </div>
      </section>

      {showDayLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDayLimitModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white shadow-xl border border-neutral-200 p-5 mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Trip length limit</h3>
            <p className="text-sm text-neutral-700 mb-4">
              You can only generate up to {MAX_TRIP_DAYS} days trip for now. Unlimited-day trips are coming soon!
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowDayLimitModal(false)}
                className="px-4 py-2 rounded-md bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;