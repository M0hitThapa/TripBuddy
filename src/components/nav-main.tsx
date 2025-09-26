"use client"

import { type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

 
import {
  SidebarGroup,
  
  SidebarMenu,
  SidebarMenuButton,
  
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
  const pathname = usePathname()
  return (
    <SidebarGroup>
     
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname?.startsWith(item.url)
          const base = "p-5 mt-2 hover:bg-slate-200 transition-all duration-300 cursor-pointer text-md"
          const active = isActive ? " bg-slate-200" : ""
          return (
            <Link key={item.title} href={item.url} className="w-full">
              <SidebarMenuButton className={base + active} tooltip={item.title} aria-current={isActive ? "page" : undefined}>
              <div>
                {item.icon && <item.icon />}
              </div>
              <span className="font-medium text-md">{item.title}</span>
              </SidebarMenuButton>
            </Link>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
