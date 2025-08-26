import { SignOutButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import {  Plane } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

async function Navbar() {

  const links = [
    {
      href:"/founders",
      title:"Home"
    },
    {
      href:"/guide",
      title:"Features"
    },
    {
      href:"/pricing",
      title:"Pricing"
    },
    {
      href:"/login",
      title:"How it works"
    }
  ]

  const user = await currentUser()
  return (
    <div className='flex items-center justify-between px-4 py-3'>
      <Link href="/" className='flex gap-2 text-2xl font-bold items-center'>
      <svg className="w-8 h-8 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fillRule="evenodd" d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z" clipRule="evenodd"/>
</svg>

      <h3 className='text-shadow-2xs milonga-regular-title'>TripBuddy</h3>
      </Link>
    <div className='flex items-center gap-6 text-md'>
        {links.map((link, index) => (
        <Link href={link.href} key={index} className='text-neutral-800 font-medium hover:text-neutral-500 transition duration-200'>
        {link.title}</Link>
      ))}
      <div className="h-full flex items-center space-x-4">
                    {user ? <>
                    <SignOutButton>
                        <button className='px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg shadow-md transition-all duration-300 cursor-pointer font-semibold' >
                            SignOut
                        </button>
                    </SignOutButton>
                  
                    </> : (<>
                   
                    <Link href="/sign-in" className='px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg shadow-md transition-all duration-300 cursor-pointer font-semibold' >
                   SignIn
                    </Link>
                
                    </>)}

                </div>
    </div>
    </div>
  
)}

export default Navbar