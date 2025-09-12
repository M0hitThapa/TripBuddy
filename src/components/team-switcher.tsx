"use client"

import * as React from "react"



import {
  SidebarMenu,
  SidebarMenuButton,
  
} from "@/components/ui/sidebar"
import { LogOut } from "lucide-react"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  
  

  return (
    <SidebarMenu className=" pr-2">
     
   
          
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground   "
            >
              <div className=" flex aspect-square size-9 items-center justify-center ">
               <svg className="w-8 h-8 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
  <path fillRule="evenodd" d="M12 2a1 1 0 0 1 .932.638l7 18a1 1 0 0 1-1.326 1.281L13 19.517V13a1 1 0 1 0-2 0v6.517l-5.606 2.402a1 1 0 0 1-1.326-1.281l7-18A1 1 0 0 1 12 2Z" clipRule="evenodd"/>
</svg>
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-2xl font-semibold text-shadow-2xs">TripBuddy</span>
             
              </div>
              
            
            </SidebarMenuButton>
         
         
       
      
    </SidebarMenu>
  )
}
