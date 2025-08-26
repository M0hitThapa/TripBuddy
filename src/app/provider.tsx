// 'use client'
// import { useMutation } from 'convex/react'
// import React from 'react'
// import { api } from '../../convex/_generated/api'
// import { useUser } from '@clerk/nextjs'

// function provider() {

//     const CreateUser = useMutation(api.user.CreateNewUser)
//     const user = useUser()

//     const CreateNewUser = async() => {
// const result = await CreateUser({
//     email:user?.primaryEmailAddress?.emailAddress,
//     imageUrl:user?.imageUrl,
//     name:user?.fullName
// })
//     }
//   return (
//     <div>provider</div>
//   )
// }

// export default provider