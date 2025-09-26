'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useQuery } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'
import { useParams, useRouter } from 'next/navigation'
import React, { useMemo } from 'react'
import ItineraryGrid from '../../create-new-trip/_components/ItineraryGrid'

export default function TripDetailPage() {
  const params = useParams() as { id?: string }
  const router = useRouter()
  const id = params?.id as Id<"TripDetailTable">
  const trip = useQuery(api.tripDetail.GetTrip, id ? { id } : 'skip') as { tripDetail?: { itinerary?: unknown[]; budget?: { breakdown?: unknown[] } } } | null

  const itinerary = useMemo(() => trip?.tripDetail?.itinerary ?? [], [trip])
  const budget = useMemo(() => trip?.tripDetail?.budget ?? null, [trip])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6">
          {!trip ? (
            <div className="text-neutral-600">Loading...</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.back()}
                    className="rounded-sm border px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                  >
                    Back
                  </button>
                  <h1 className="text-2xl font-bold">Trip Itinerary</h1>
                </div>
                <button
                  onClick={() => router.push(`/trips/${encodeURIComponent(id)}/edit`)}
                  className="rounded-sm bg-neutral-950 px-4 py-2 text-sm font-bold text-white hover:bg-neutral-800"
                >
                  Edit with AI
                </button>
              </div>
              <ItineraryGrid itinerary={itinerary as any} costs={budget?.breakdown as any} />
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


