"use client"

import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Mail,
  ClipboardCheck,
  Target,
  FileBarChart,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Page = "dashboard" | "officers" | "missions" | "invitations" | "attendance" | "reports"

interface DashboardSidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const navItems = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "officers" as Page, label: "Officers", icon: Users },
  { id: "missions" as Page, label: "Missions", icon: Target },
  { id: "invitations" as Page, label: "Invitations", icon: Mail },
  { id: "attendance" as Page, label: "Attendance", icon: ClipboardCheck },
  { id: "reports" as Page, label: "Reports", icon: FileBarChart },
]

export function DashboardSidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }: DashboardSidebarProps) {
  const { user, logout } = useAuth()

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-3 px-4 border-b border-sidebar-border">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-sidebar-foreground truncate">Admin Panel</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPage === item.id
            const button = (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-sidebar-primary")} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover text-popover-foreground border-border">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              )
            }
            return button
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="px-2 pb-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full justify-center text-muted-foreground hover:text-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* User */}
        <div className="p-2">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={logout}
                  className="flex w-full items-center justify-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-popover text-popover-foreground border-border">
                Sign Out ({user?.username})
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3 rounded-md px-3 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.username}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
              </div>
              <button
                onClick={logout}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
