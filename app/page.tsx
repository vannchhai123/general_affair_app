"use client"

import { useState } from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardOverview } from "@/components/dashboard-overview"
import { OfficerManagement } from "@/components/officer-management"
import { MissionManagement } from "@/components/mission-management"
import { InvitationManagement } from "@/components/invitation-management"
import { AttendanceManagement } from "@/components/attendance-management"
import { ReportGeneration } from "@/components/report-generation"
import { ScrollArea } from "@/components/ui/scroll-area"

type Page = "dashboard" | "officers" | "missions" | "invitations" | "attendance" | "reports"

function DashboardContent() {
  const { isAuthenticated } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (!isAuthenticated) {
    return <LoginForm />
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <DashboardOverview />
      case "officers":
        return <OfficerManagement />
      case "missions":
        return <MissionManagement />
      case "invitations":
        return <InvitationManagement />
      case "attendance":
        return <AttendanceManagement />
      case "reports":
        return <ReportGeneration />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 lg:p-8 max-w-7xl">
            {renderPage()}
          </div>
        </ScrollArea>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  )
}
