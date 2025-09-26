'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { useUserDetail } from '../provider'
import React from 'react'

export default function TripsPage() {
  const { user } = useUser()
  const { userDetail } = useUserDetail() as any
  const trips = useQuery(
    api.tripDetail.ListTripsByUser,
    userDetail?._id ? { uid: userDetail._id } : 'skip'
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Your Trips</h1>
          {!user ? (
            <div className="text-neutral-600">Sign in to view your trips.</div>
          ) : !trips ? (
            <div className="text-neutral-600">Loading...</div>
          ) : trips.length === 0 ? (
            <div className="text-neutral-600">No trips yet. Generate one to get started!</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trips.map((t: any) => {
                const allPhotos: string[] =
                  t.tripDetail?.itinerary?.flatMap((d: any) => d?.photos || []) || []
                const firstPhoto: string | undefined = allPhotos[0]
                return (
                  <a key={t._id} href={`/trips/${t._id}`} className="mx-auto w-full max-w-xs">
                    <div className="group relative h-full overflow-hidden rounded-2xl border-2 border-zinc-100 bg-white transition duration-200 hover:shadow-xl">
                      <div className="relative aspect-[16/12] w-full overflow-hidden rounded-tl-lg rounded-tr-lg bg-gray-100">
                        {firstPhoto ? (
                          <img
                            src={`/api/google/places/photo?photo_reference=${encodeURIComponent(firstPhoto)}&maxwidth=640`}
                            alt="thumbnail"
                            className="h-full w-full transform transition duration-200 group-hover:scale-95 rounded-3xl p-3 object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center p-3">
                            <div className="w-full h-full rounded-3xl bg-white flex items-center justify-center">
                              <svg className="w-14 h-14 text-neutral-700" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="currentColor" viewBox="0 0 24 24">
                                <path fill-rule="evenodd" d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z" clip-rule="evenodd"/>
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h2 className="my-1 text-base font-bold text-zinc-700 line-clamp-2">
                          {t.tripDetail?.resp || 'Saved Trip'}
                        </h2>
                        <div className="mt-6 flex flex-row items-center justify-between">
                          <span className="text-sm text-gray-500">TripBuddy</span>
                          <span className="rounded-sm bg-neutral-950 px-5 py-2 text-sm font-bold text-white">View</span>
                        </div>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
