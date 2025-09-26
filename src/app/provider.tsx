"use client"
import { useMutation } from 'convex/react'
import React, { ReactNode, useContext, useEffect, useState } from 'react'
import { api } from '../../convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { UserDetailContext } from '@/context/UserDetailContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function Provider({ children }: { children: ReactNode }) {

    const CreateUser = useMutation(api.user.CreateNewUser)
    const [userDetail, setUserDetail] = useState<{ _id?: string; [key: string]: unknown } | null>(null)
    const {user} = useUser()

    useEffect(() => {
        if (user) {
            CreateNewUser();
        }
    }, [user, CreateNewUser])

    const CreateNewUser = async() => {
        const result = await CreateUser({
            email: user?.primaryEmailAddress?.emailAddress ?? '',
            imageUrl: user?.imageUrl ?? '',
            name: user?.fullName ?? ''
        })
        setUserDetail(result)
    }
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        retry: 1,
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
        <div>{children}</div>
      </UserDetailContext.Provider>
    </QueryClientProvider>
  )
}

export default Provider

export const useUserDetail = () => {
  return useContext(UserDetailContext)
}