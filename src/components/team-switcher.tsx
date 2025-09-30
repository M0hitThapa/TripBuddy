"use client"

import * as React from "react"



import {
  SidebarMenu,
  SidebarMenuButton,
  
} from "@/components/ui/sidebar"
 
import Link from "next/link"

export function TeamSwitcher({
  teams: _teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  
  

  return (
    <SidebarMenu className="  ">
     
   
          
            <SidebarMenuButton
              size="lg"
              className="  transition-all duration-300 rounded-sm h-10  w-45  mb-1  "
            >
              <div className=" flex aspect-square size-8 text-neutral-950 items-center justify-center ">
               <svg className="w-8 h-8 text-neutral-950" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fillRule="evenodd" d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z" clipRule="evenodd"/>
</svg>
              </div>
              <div className="">
                <Link href="/" className="truncate text-2xl font-bold text-shadow-2xs text-neutral-950 hover:text-neutral-700 transition-colors">TripFriend</Link>
             
              </div>
              
            
            </SidebarMenuButton>
         
         
       
      
    </SidebarMenu>
  )
}
