'use client'
import { useMutation } from 'convex/react'
import React, { ReactNode, useContext, useEffect, useState } from 'react'
import { api } from '../../convex/_generated/api'
import { useUser } from '@clerk/nextjs'
import { UserDetailContext } from '@/context/UserDetailContext'

function Provider({ children }: { children: ReactNode }) {

    const CreateUser = useMutation(api.user.CreateNewUser)
    const [userDetail, setUserDetail] = useState<any>()
    const {user} = useUser()

    useEffect(() => {
        user&&CreateNewUser();

    }, [user])

    const CreateNewUser = async() => {

        
const result = await CreateUser({
    email: user?.primaryEmailAddress?.emailAddress ?? '',
    imageUrl: user?.imageUrl ?? '',
    name: user?.fullName ?? ''
})
    }
  return (
   <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
     <div>{children}</div>
   </UserDetailContext.Provider>
  )
}

export default Provider

export const useUserDetail = () => {
  return useContext(UserDetailContext)
}