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
import { LayoutDashboard, Users, FileText, BarChart3, LogOut, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

const adminMenuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Manage Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Questionnaires",
    url: "/admin/questionnaires",
    icon: FileText,
  },
  {
    title: "Submissions",
    url: "/admin/submissions",
    icon: BarChart3,
  },
]

export function AdminSidebar() {
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
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Admin</span>
            </div>
          </div>
          {/* <div className="text-base font-medium text-gray-600 uppercase tracking-wide">
            ADMINISTRATOR
          </div> */}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {adminMenuItems.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/admin" && pathname.startsWith(item.url))
                
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
                        <span className="font-medium text-base">{item.title}</span>
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
        <div className="space-y-3">
          {/* User Info */}
          <div className="px-3 py-2 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          
          {/* Logout Button */}
          <Button 
            onClick={logout} 
            variant="ghost" 
            className="w-full justify-start px-3 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-500" />
            <span className="font-medium text-base">Sign Out</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
