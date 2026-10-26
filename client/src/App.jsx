import { useState, useEffect, useCallback } from 'react'
import { ThemeProvider, useTheme } from './context/ThemeContext.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import LoginForm from './components/LoginForm.jsx'
import RegisterForm from './components/RegisterForm.jsx'
import ProtectedDashboard from './components/ProtectedDashboard.jsx'
import { CheckSquare, Loader2, Sun, Moon, RefreshCw } from 'lucide-react'
import { healthAPI } from './services/api.js'

function AuthHeader({ healthData, healthLoading, onCheckHealth }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-[6px] bg-[var(--accent-blue)] text-white flex items-center justify-center shadow-xs">
            <CheckSquare className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span className="font-semibold tracking-tight text-[var(--text-primary)] text-sm">
            TaskFlow
          </span>
        </div>

        {/* Health Status & Theme Toggle */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Preserved Health Status */}
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-[6px] bg-[var(--bg-subtle)] border border-[var(--border-default)] text-[11px] text-[var(--text-secondary)] font-mono">
            <span className="flex items-center space-x-1">
              <span className={`w-1.5 h-1.5 rounded-full ${healthData?.status === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{healthData?.status === 'ok' ? 'API Online' : 'Connecting...'}</span>
            </span>
            <button
              type="button"
              onClick={onCheckHealth}
              disabled={healthLoading}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
              title="Refresh API health"
            >
              <RefreshCw className={`w-3 h-3 ${healthLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            id="auth-theme-toggle"
            onClick={toggleTheme}
            className="p-1.5 rounded-[6px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] transition-colors cursor-pointer"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[var(--text-secondary)]" />}
          </button>
        </div>
      </div>
    </header>
  )
}

function MainContent() {
  const { isAuthenticated, loading } = useAuth()
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  
  // Backend health status monitor (preserved from Phase 1)
  const [healthData, setHealthData] = useState(null)
  const [healthLoading, setHealthLoading] = useState(false)

  const checkHealth = useCallback(async () => {
    setHealthLoading(true)
    try {
      const data = await healthAPI.check()
      setHealthData(data)
    } catch {
      setHealthData(null)
    } finally {
      setHealthLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    healthAPI.check()
      .then((data) => {
        if (isMounted) setHealthData(data)
      })
      .catch(() => {
        if (isMounted) setHealthData(null)
      })

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="w-6 h-6 text-[var(--accent-blue)] animate-spin mx-auto" />
          <p className="text-xs text-[var(--text-secondary)] font-mono">Validating session...</p>
        </div>
      </div>
    )
  }

  // If authenticated, render Protected Dashboard
  if (isAuthenticated) {
    return <ProtectedDashboard />
  }

  // If unauthenticated, render Calm Notion-inspired Auth Portal
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent-blue-subtle)] selection:text-[var(--accent-blue-text)]">
      {/* Header */}
      <AuthHeader 
        healthData={healthData} 
        healthLoading={healthLoading} 
        onCheckHealth={checkHealth} 
      />

      {/* Main Auth View */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 flex-1 w-full flex flex-col items-center justify-center">
        <div className="w-full max-w-sm space-y-4">
          {/* Tab Switcher */}
          <div className="p-0.5 rounded-[8px] bg-[var(--bg-subtle)] border border-[var(--border-default)] flex text-xs font-medium">
            <button
              id="tab-login"
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-1.5 rounded-[6px] transition-colors cursor-pointer text-center ${
                authMode === 'login'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-register"
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-1.5 rounded-[6px] transition-colors cursor-pointer text-center ${
                authMode === 'register'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          {authMode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-4 text-center text-xs text-[var(--text-tertiary)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TaskFlow — Minimal, Notion-Inspired Task Manager</span>
          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <span>Auth: /api/auth</span>
            <span>•</span>
            <span>Session: Guest</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  )
}
