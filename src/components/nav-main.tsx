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
         
            
              
                <SidebarMenuButton className="p-5 mt-2  hover:bg-gray-100 transition-all duration-300 cursor-pointer text-md" key={item.title} tooltip={item.title}>
                  <div>
                    {item.icon && <item.icon />}
                  </div>
                  <span className="font-medium text-md">{item.title}</span>
                
                </SidebarMenuButton>
 
             
           
          
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
