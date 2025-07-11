"use client"

import { useAuth } from "@/components/providers/auth-provider"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, Users, FileText, BarChart3, LogOut } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

const teamMenuItems = [
  {
    title: "Home",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Clients",
    url: "/dashboard/clients",
    icon: Users,
  },
  {
    title: "Questionnaire",
    url: "/dashboard/questionnaire",
    icon: FileText,
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: BarChart3,
  },
]

export function TeamSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  return (
    <Sidebar className="bg-white border-r border-gray-200">
      <SidebarHeader className="p-6 relative">
        {/* Collapse Toggle Button */}
        <div className="absolute top-4 right-4">
          <SidebarTrigger className="h-8 w-8 hover:bg-gray-100 rounded-md transition-colors" />
        </div>
        
        <div className="text-center space-y-3 pr-12">
          <div className="flex justify-center">
            <Image
              src="https://22527425.fs1.hubspotusercontent-na1.net/hubfs/22527425/Mazars-SA/Group%203.png"
              alt="Mazars Logo"
              width={120}
              height={60}
              className="h-12 w-auto object-contain"
              priority
            />
          </div>
          <div className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            TEAM MEMBER
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {teamMenuItems.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url))
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`w-full justify-start px-3 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? "bg-blue-50 text-blue-600 hover:bg-blue-50" 
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                        <span className="font-medium">{item.title}</span>
                        
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 mt-auto">
        <Button 
          onClick={logout} 
          variant="ghost" 
          className="w-full justify-start px-3 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-500" />
          <span className="font-medium">Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
