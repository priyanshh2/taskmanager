import { useEffect } from 'react'
import { useTheme } from '../context/ThemeContext.jsx'
import { 
  CheckSquare, 
  LayoutDashboard, 
  Calendar, 
  BarChart2, 
  Sun, 
  Moon, 
  LogOut, 
  X 
} from 'lucide-react'

export default function Sidebar({
  user,
  onLogout,
  currentView,
  onSelectView,
  counts = { total: 0, pending: 0, completed: 0, overdue: 0 },
  mobileOpen,
  onCloseMobile,
}) {
  const { isDark, toggleTheme } = useTheme()

  // Close mobile sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        onCloseMobile()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen, onCloseMobile])

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      badge: counts.pending > 0 ? counts.pending : null,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: BarChart2,
    },
  ]

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-4 select-none text-[13px]">
      {/* Top Section */}
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-blue)] text-white flex items-center justify-center shadow-sm">
              <CheckSquare className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="font-bold tracking-tight text-[var(--text-primary)] text-base sm:text-lg">
              TaskFlow
            </span>
          </div>

          {/* Close button on mobile drawer */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return (
              <button
                key={item.id}
                type="button"
                id={`nav-${item.id}`}
                onClick={() => {
                  onSelectView(item.id)
                  if (mobileOpen) onCloseMobile()
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all font-medium cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-blue-subtle)] text-[var(--accent-blue-text)] font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--accent-blue-text)] stroke-[2.5]' : 'text-[var(--text-tertiary)]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium ${
                    isActive ? 'bg-[var(--accent-blue)] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-tertiary)]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Bottom Section: Profile, Theme, and Logout */}
      <div className="pt-4 border-t border-[var(--border-default)] space-y-3">
        {/* User Profile Card */}
        <div className="flex items-center space-x-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[var(--accent-blue)] font-bold text-xs flex items-center justify-center flex-shrink-0">
            {userInitial}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
              {user?.name || 'User'}
            </span>
            <span className="text-[11px] text-[var(--text-tertiary)] truncate">
              {user?.email || 'user@taskflow.dev'}
            </span>
          </div>
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          type="button"
          id="sidebar-theme-toggle"
          onClick={toggleTheme}
          className="w-full flex items-center space-x-2.5 px-2 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
          )}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Logout Action (Red style as in Life Manager) */}
        <button
          type="button"
          id="sidebar-logout-btn"
          onClick={onLogout}
          className="w-full flex items-center space-x-2.5 px-2 py-1.5 rounded-lg text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-56 flex-shrink-0 bg-[var(--bg-sidebar)] border-r border-[var(--border-default)] h-screen sticky top-0 z-30 shadow-subtle">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-64 max-w-[80vw] h-full bg-[var(--bg-sidebar)] border-r border-[var(--border-default)] shadow-xl z-10 animate-fadeIn">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
