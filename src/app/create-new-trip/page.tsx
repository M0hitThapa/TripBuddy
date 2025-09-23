import { AppSidebar } from "@/components/app-sidebar"
import SignOutButtons from "@/components/signoutbutton"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Chatbot from "./_components/chatbot"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
     
        
     
<div
  className="relative h-screen w-full border border-neutral-200 shadow-2xs"
  style={{
    background: "#f5f5f5", // neutral-200 background
    backgroundImage:
      "radial-gradient(circle at 1px 1px, #e5e5e5 1px, transparent 0)", // white dots
    backgroundSize: "20px 20px",
  }}
>
  {/* Background div with absolute positioning */}
  <div
    className="absolute inset-0 z-0"
    style={{
      background: "#f5f5f5", // neutral-200 background
      backgroundImage:
        "radial-gradient(circle at 1px 1px, #e5e5e5 1px, transparent 0)", // white dots
      backgroundSize: "20px 20px",
    }}
  />




  
  {/* Content with z-10 to ensure it appears on top */}
  {/* <div className="relative z-10 flex justify-between mx-4 mt-2">
    <SidebarTrigger className="-ml-1 bg-white border-2 border-neutral-300 rounded-md shadow p-5" />
    <div>
      <SignOutButtons />
    </div>
  </div> */}


  <div className="absolute grid grid-cols-1 md:grid-cols-2 w-full">
    <div>
      <Chatbot />
    </div>
    <div className="bg-white/30 h-screen">
      map and trip planning
    </div>
  </div>
</div>

      
   
    </SidebarProvider>
  )
}
