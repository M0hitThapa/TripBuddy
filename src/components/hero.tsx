'use client'

import { Play } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { ShinyButton } from './shiny-button'

import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

function Hero() {
  const {isLoaded, isSignedIn} = useUser()
  const router = useRouter()

  function onSend() {
    if(!isLoaded) return;
    if(!isSignedIn) {
      router.push("/sign-in")
      return;
    }
    router.push("/create-new-trip")
  }
  return (
    <div className='px-4 py-2 flex flex-col items-center gap-4 my-20'>
        <button className='border rounded-full text-xs px-4 py-1 border-neutral-200 bg-emerald-50/20 text-neutral-900 font-semibold hover:bg-neutral-50 cursor-pointer transition-all duration-300'>
            Best Place to travel in this season
            {/*https://i.pinimg.com/736x/21/61/9d/21619df361a80e989ac536cfab5d4ab0.jpg */}

        </button>
        <div>
            <h1 className='font-medium mt-3 lg:text-8xl md:text-6xl sm:text-4xl text-3xl text-shadow-lg/10 text-black text-center tracking-tighter'>
              <div className='flex gap-2 items-center '>
                <Image src="/arrow.png" alt='arrow-image' height={150} width={150} className='hidden md:flex' />
               <span className='bg-gradient-to-r from-neutral-900 to-neutral-500 bg-clip-text text-transparent domine outfit-title '>
                Plan Your Trip in Seconds <br /> Powered by <span className='text-teal-600 text-center bg-teal-100/40  rounded-full lg:text-7xl md:text-4xl sm:text-3xl text-3xl  md:px-7 md:py-2 px-2 py-1 border-2 border-neutral-100 shadow-inner shadow-neutral-100'>TripBuddy</span>
               </span>
               <Image src="/travel.png" alt='travel-image' height={150} width={150} className='hidden md:flex' />
          </div>
            </h1>
            <p className='max-w-2xl text-center mt-4 mx-auto text-md text-neutral-800'>Share your preferences, get a day-by-day plan with local tips.</p>
        </div>
        <div className='flex items-center gap-4 text-sm'>
            
             <ShinyButton onClick={() => onSend()}  className="relative z-10 h-12 w-full px-6 py-2 text-base shadow-lg transition-shadow duration-300 hover:shadow-xl cursor-pointer">
            Plan your trip
          </ShinyButton>
             <button className='cursor-pointer px-4 py-1 text-black backdrop-blur-sm border border-gray-400 rounded-md hover:shadow-[0px_0px_4px_4px_rgba(0,0,0,0.1)] bg-white/[0.2] text-sm transition duration-200'>
                <div className='flex gap-2 items-center px-4 py-2 '>
                  <Play className='h-5 w-5' />
                Demo
                </div>
               
             </button>
             
        </div>
    </div>
  )
}

export default Hero