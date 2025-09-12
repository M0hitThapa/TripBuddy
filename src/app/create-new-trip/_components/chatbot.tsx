'use client'

import SignOutButtons from '@/components/signoutbutton'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import React from 'react'

const Chatbot = () => {

  function onSend() {

  }
  return (
    <div className='border-r border-gray-200 h-[100vh] flex flex-col'>
        <section className='border-b-2 border-gray-200 bg-neutral-50 p-2 '>
            <div className=" z-10 flex justify-between  ">
    <SidebarTrigger className=" bg-white border-2 border-neutral-300 rounded-md shadow p-5" />
    <div>
      <SignOutButtons />
    </div>
  </div> 
        </section>
        <section className='p-4 flex-1 overflow-y-auto'>
          <div className='flex justify-end mt-2'>
            <div className='max-w-lg bg-gray-200 text-neutral-900 font-medium px-2 py-2 rounded-md text-lg'>
              user msg
            </div>

          </div>
          <div className='flex justify-start mt-2'>
            <div className='max-w-lg text-neutral-900 font-medium px-2 py-2 text-lg '>
              Ai message
            </div>

          </div>
        </section>
        <section className='mx-5'>
          
            <div className='relative mb-6 '>
              <Textarea placeholder='create a trip from newyork to australia' className='w-full h-32   resize-none p-4  rounded-2xl shadow-input border-2 border-neutral-300 bg-white ' />
              <Button size="icon" className='absolute bottom-6 right-6 bg-teal-600' onClick={() => onSend()}>
                <Send className='h-4 w-4'/>
              </Button>
            </div>

        
        </section>
        </div>
  )
}

export default Chatbot