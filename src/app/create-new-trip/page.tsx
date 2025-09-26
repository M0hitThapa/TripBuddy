'use client'

import { AppSidebar } from "@/components/app-sidebar"
import SignOutButtons from "@/components/signoutbutton"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import React, { useEffect, useMemo, useState } from "react"
import { useSearchParams } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import Chatbot from "./_components/chatbot"
import ItineraryGrid from "./_components/ItineraryGrid"
import TrendingTrips from "./_components/TrendingTrips"

export default function Page() {
  const [itinerary, setItinerary] = useState<any[]>([])
  const [budget, setBudget] = useState<any | null>(null)
  const [chatKey, setChatKey] = useState<number>(0)
  const search = useSearchParams()
  const editId = search?.get('edit')
  const existingTrip = useQuery(api.tripDetail.GetTrip, editId ? { id: editId as any } : 'skip') as any
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    if (url.searchParams.get('new') === '1') {
      setItinerary([])
      setBudget(null)
      setChatKey((k) => k + 1)
      url.searchParams.delete('new')
      window.history.replaceState({}, '', url.toString())
    }
  }, [search?.get('new')])
  const handleFinal = (payload: any) => {
    if (Array.isArray(payload?.itinerary)) setItinerary(payload.itinerary)
    if (payload?.budget) setBudget(payload.budget)
  }
  const dailyCosts = useMemo(() => budget?.breakdown ?? [], [budget])
  return (
    <SidebarProvider>
      <AppSidebar />
     
        
     
<div
  className="relative h-screen w-full border border-neutral-200 shadow-2xs overflow-hidden"
  style={{
    background: "#f5f5f5", // neutral-200 background
    backgroundImage:
      "radial-gradient(circle at 1px 1px, #e5e5e5 1px, transparent 0)", // white dots
    backgroundSize: "20px 20px",
  }}
>
  {/* Background div with absolute positioning */}
  <div
    className="absolute inset-0 z-0"
    style={{
      background: "#f5f5f5", // neutral-200 background
      backgroundImage:
        "radial-gradient(circle at 1px 1px, #e5e5e5 1px, transparent 0)", // white dots
      backgroundSize: "20px 20px",
    }}
  />




  
  {/* Content with z-10 to ensure it appears on top */}
  {/* <div className="relative z-10 flex justify-between mx-4 mt-2">
    <SidebarTrigger className="-ml-1 bg-white border-2 border-neutral-300 rounded-md shadow p-5" />
    <div>
      <SignOutButtons />
    </div>
  </div> */}


  <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2 w-full h-full overflow-hidden">
    <div className="h-full min-h-0 overflow-hidden flex flex-col">
      <Chatbot key={chatKey} onFinal={handleFinal} editTripId={editId} />
    </div>
    <div className="bg-white/60 h-full overflow-hidden flex flex-col">
      {(itinerary?.length || existingTrip?.tripDetail?.itinerary?.length) ? (
        <>
          <div className="px-6 pt-4 pb-2 flex items-center justify-between">
            <button
              className="px-3 py-1.5 rounded-md text-sm font-medium border border-neutral-300 bg-white hover:bg-neutral-100"
              onClick={() => { setItinerary([]); setBudget(null) }}
            >
              ← Back
            </button>
            {budget ? (
              <div className="w-64 shrink-0 sticky top-2">
                <div className="rounded-lg border border-neutral-200 bg-white shadow p-4">
                  <div className="text-xs text-neutral-600">Estimated total budget</div>
                  <div className="mt-1 text-2xl font-bold text-neutral-900">${(budget?.total ?? 0).toFixed ? (budget.total).toFixed(2) : budget?.total} <span className="text-xs font-medium text-neutral-500">{budget?.currency || 'USD'}</span></div>
                </div>
              </div>
            ) : <div />}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ItineraryGrid itinerary={itinerary?.length ? itinerary : (existingTrip?.tripDetail?.itinerary ?? [])} costs={dailyCosts?.length ? dailyCosts : (existingTrip?.tripDetail?.budget?.breakdown ?? [])} />
          </div>
        </>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">
          <TrendingTrips onSelectTrip={(payload) => { setItinerary(payload.itinerary); setBudget(payload.budget ?? null) }} />
        </div>
      )}
    </div>
  </div>
</div>

      
   
    </SidebarProvider>
  )
}
