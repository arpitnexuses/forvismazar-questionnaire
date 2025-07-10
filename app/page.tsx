"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Questionnaire Management System</CardTitle>
          <CardDescription>Comprehensive questionnaire management with role-based access control</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Link href="/login">
              <Button className="w-full">Login</Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="w-full bg-transparent">
                Sign Up
              </Button>
            </Link>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>Admin features: User management, questionnaire creation</p>
            <p>Team features: Client management, form submissions, reports</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
