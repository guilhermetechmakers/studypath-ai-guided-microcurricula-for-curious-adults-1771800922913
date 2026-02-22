import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Search,
  Settings,
  Bell,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/create', icon: PlusCircle, label: 'Create Curriculum' },
  { to: '/dashboard/curricula', icon: BookOpen, label: 'My Curricula' },
  { to: '/dashboard/search', icon: Search, label: 'Search & Browse' },
  { to: '/dashboard/scheduler', icon: Bell, label: 'Scheduler' },
  { to: '/dashboard/export', icon: FileDown, label: 'Export & Import' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

interface DashboardSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export function DashboardSidebar({ mobileOpen, onMobileClose }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const showCollapse = !mobileOpen

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col h-full bg-card border-r border-border transition-all duration-300',
          collapsed && showCollapse ? 'w-[72px]' : 'w-56',
          mobileOpen ? 'fixed inset-y-0 left-0 z-50 w-56' : ''
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-border">
          {(!collapsed || mobileOpen) && (
            <Link to="/dashboard" className="font-semibold text-primary" onClick={onMobileClose}>
              StudyPath
            </Link>
          )}
          {showCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="shrink-0"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
            const Icon = item.icon
            const link = (
              <Link
                to={item.to}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:bg-accent/5 hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
            return collapsed ? (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.to}>{link}</div>
            )
          })}
        </nav>
      </aside>
    </TooltipProvider>
  )
}

export function DashboardSidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} className="lg:hidden" aria-label="Open menu">
      <Menu className="h-5 w-5" />
    </Button>
  )
}
