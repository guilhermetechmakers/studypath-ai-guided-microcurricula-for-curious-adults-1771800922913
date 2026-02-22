import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  User,
  BookOpen,
  Shield,
  Link2,
  CreditCard,
  FileDown,
  BarChart3,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProfileHeader } from './profile-header'
import { ScrollArea } from '@/components/ui/scroll-area'

const SETTINGS_TAB_KEY = 'studypath-settings-tab'

const navItems = [
  { to: 'profile', icon: User, label: 'Profile' },
  { to: 'preferences', icon: BookOpen, label: 'Learning Preferences' },
  { to: 'security', icon: Shield, label: 'Account & Security' },
  { to: 'connections', icon: Link2, label: 'Connected Accounts' },
  { to: 'billing', icon: CreditCard, label: 'Billing & Subscription' },
  { to: 'export', icon: FileDown, label: 'Export & Import' },
  { to: 'analytics', icon: BarChart3, label: 'Progress & Analytics' },
  { to: 'privacy', icon: Trash2, label: 'Privacy & Data' },
]

export function SettingsLayout() {
  const location = useLocation()
  const [collapsed] = useState(() => {
    try {
      return localStorage.getItem('studypath-settings-nav-collapsed') === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      const tab = location.pathname.split('/').pop() || 'profile'
      localStorage.setItem(SETTINGS_TAB_KEY, tab)
    } catch {
      // ignore
    }
  }, [location.pathname])

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in">
      <div className="flex flex-col gap-6">
        <ProfileHeader />

        <nav
          className={cn(
            'flex lg:flex-col transition-all duration-300',
            collapsed ? 'lg:w-14' : 'lg:w-56'
          )}
          aria-label="Settings sections"
        >
          <ScrollArea className="lg:h-[calc(100vh-16rem)]">
            <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-x-visible lg:pb-0">
              {navItems.map((item) => {
                const to = `/dashboard/settings/${item.to}`
                const isActive = location.pathname === to
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.to}
                    to={to}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200',
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-muted-foreground hover:bg-accent/5 hover:text-foreground'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                )
              })}
            </div>
          </ScrollArea>
        </nav>
      </div>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
