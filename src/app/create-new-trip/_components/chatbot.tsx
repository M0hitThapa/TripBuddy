'use client'

import SignOutButtons from '@/components/signoutbutton'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send } from 'lucide-react'
import axios from "axios"
import React, { useState } from 'react'
import EmptyBoxState from './EmptyBoxState'

type Message ={
  role:string,
  content:string
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState<string>()
  const [loading, setLoading] = useState(false)

  async function onSend() {
    if(!userInput?.trim()) return;
    setLoading(true)

    setUserInput('')

    const newMsg:Message={
      role:'user',
      content:userInput
    }

    setMessages((prev:Message[]) =>[...prev, newMsg] )
    const result  = await axios.post('/api/aimodel', {
      messages:[...messages, newMsg]
    });

    setMessages((prev:Message[]) => [...prev, {
      role:'assistant',
      content:result.data?.resp
    }]);

    console.log(result.data)
    setLoading(false)

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

        {messages?.length==0 && 
        <EmptyBoxState />}
        <section className='p-4 flex-1 overflow-y-auto'>
         {messages.map((msg:Message, index) => (
          msg.role=='user'?
           <div className='flex justify-end mt-2' key={index}>
            <div className='max-w-lg bg-gray-200 text-neutral-900 font-medium px-2 py-2 rounded-md text-lg'>
              {msg.content}
            </div>

          </div>: <div className='flex justify-start mt-2' key={index}>
            <div className='max-w-lg text-neutral-900 font-medium px-2 py-2 text-lg '>
              {msg.content}
            </div>

          </div>
         ))}

         {loading && <div className='flex justify-start mt-2' >
            <div className='max-w-lg text-neutral-900 font-medium px-2 py-2 text-lg '>
              <Loader2 className='animate-spin' />
            </div>

          </div>}
         
        </section>
        <section className='mx-5'>
          
            <div className='relative mb-6 '>
              <Textarea placeholder='Plan Your Trip...' className='w-full h-32   resize-none py-2 px-3  rounded-xl shadow-md  bg-white '
              onChange={(event) => setUserInput(event.target.value)} value={userInput} />
              <Button size="icon" className='absolute bottom-3 right-3  cursor-pointer rounded-sm' onClick={() => onSend()}>
                <Send className='h-4 w-4'/>
              </Button>
            </div>

        
        </section>
        </div>
  )
}

export default Chatbot