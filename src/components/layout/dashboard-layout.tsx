import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { DashboardSidebar, DashboardSidebarTrigger } from '@/components/layout/dashboard-sidebar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-background">
      <div
        className={cn(
          mobileOpen ? 'fixed inset-0 z-40 flex' : 'hidden',
          'lg:flex lg:relative lg:inset-auto'
        )}
      >
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
        <div className="relative z-50 lg:z-auto">
          <DashboardSidebar
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-card/95 backdrop-blur px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <DashboardSidebarTrigger onClick={() => setMobileOpen(true)} />
            <span className="hidden lg:inline text-sm text-muted-foreground">
              Study hub
            </span>
          </div>
          <div className="lg:hidden flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard/settings">
                <User className="h-5 w-5" aria-label="Settings" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
