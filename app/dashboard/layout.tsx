"use client"

import type React from "react"

import { useAuth } from "@/components/providers/auth-provider"
import { TeamSidebar } from "@/components/team-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

function ContentWrapper({ children }: { children: React.ReactNode }) {
  const { state } = useSidebar()
  
  return (
    <div className="relative flex flex-1 flex-col">
      {/* Floating Sidebar Toggle - only show when collapsed */}
      {state === "collapsed" && (
        <div className="fixed top-6 left-6 z-50">
          <SidebarTrigger className="h-10 w-10 bg-white shadow-lg border border-gray-200 hover:bg-gray-50 hover:shadow-xl transition-all duration-200 rounded-lg" />
        </div>
      )}
      {children}
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "team")) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== "team") {
    return null
  }

  return (
    <SidebarProvider>
      <TeamSidebar />
      <SidebarInset>
        <ContentWrapper>{children}</ContentWrapper>
      </SidebarInset>
    </SidebarProvider>
  )
}
