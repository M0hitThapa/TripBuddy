"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
     
      <SidebarMenu>
        {items.map((item) => (
         
            
              
                <SidebarMenuButton className="p-5 mt-2 hover:bg-gray-200 transition-all duration-300 cursor-pointer " key={item.title} tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span className="font-medium text-lg">{item.title}</span>
                
                </SidebarMenuButton>
 
             
           
          
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
