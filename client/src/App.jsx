import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import LoginForm from './components/LoginForm.jsx'
import RegisterForm from './components/RegisterForm.jsx'
import ProtectedDashboard from './components/ProtectedDashboard.jsx'
import { CheckCircle2, Shield, Loader2, Server, Database, RefreshCw } from 'lucide-react'
import { healthAPI } from './services/api.js'

function MainContent() {
  const { isAuthenticated, loading } = useAuth()
  const [authMode, setAuthMode] = useState('login') // 'login' or 'register'
  
  // Backend health status monitor (preserved from Phase 1)
  const [healthData, setHealthData] = useState(null)
  const [healthLoading, setHealthLoading] = useState(false)

  const checkHealth = async () => {
    setHealthLoading(true)
    try {
      const data = await healthAPI.check()
      setHealthData(data)
    } catch {
      setHealthData(null)
    } finally {
      setHealthLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono tracking-wide">Validating authentication session...</p>
        </div>
      </div>
    )
  }

  // If authenticated, render Protected Dashboard
  if (isAuthenticated) {
    return <ProtectedDashboard />
  }

  // If unauthenticated, render Auth Portal (Login / Register)
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[128px]"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-violet-600/15 rounded-full blur-[128px]"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-[128px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800/80 backdrop-blur-md bg-[#090d16]/75">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white">TaskFlow</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20">
                Phase 4
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Backend Online</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Auth Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Brand & Security Overview */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              <span>Full-Stack Personal Task Management</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Secure Access to <br />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                Your Personal Tasks
              </span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-lg">
              Sign in or create an account to access the protected dashboard. Passwords are securely hashed with bcrypt, and sessions are authorized via JWT Bearer tokens.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
                <div className="text-xs text-indigo-400 font-mono flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Bcrypt Encryption</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Salts & hashes passwords before DB insertion.</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
                <div className="text-xs text-indigo-400 font-mono flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>JWT Authorization</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Stateless Bearer tokens with 1-hour expiration.</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
                <div className="text-xs text-indigo-400 font-mono flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Protected Routes</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Backend middleware blocks unauthenticated requests.</div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm">
                <div className="text-xs text-indigo-400 font-mono flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Duplicate Defense</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Duplicate email protection with client-safe alerts.</div>
              </div>
            </div>

            {/* Preserved Health Badge */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-400">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                <span>API Health:</span>
                <span className={healthData?.status === 'ok' ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                  {healthData?.status === 'ok' ? 'Online' : 'Checking...'}
                </span>
                <span className="text-slate-600">|</span>
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>MongoDB:</span>
                <span className={healthData?.database?.status === 'connected' ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                  {healthData?.database?.status === 'connected' ? 'Connected' : 'Checking...'}
                </span>
              </div>
              <button
                onClick={checkHealth}
                disabled={healthLoading}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${healthLoading ? 'animate-spin' : ''}`} />
                <span>Ping</span>
              </button>
            </div>
          </div>

          {/* Right Column: Auth Card (Login or Register) */}
          <div className="lg:col-span-6">
            {/* View Mode Switcher Tabs */}
            <div className="max-w-md mx-auto mb-4 p-1 rounded-xl bg-slate-900/90 border border-slate-800 flex text-xs font-semibold">
              <button
                id="tab-login"
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                id="tab-register"
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {authMode === 'login' ? (
              <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>TaskFlow — Phase 2 Authentication Foundation</span>
          <div className="flex items-center space-x-4 text-slate-400 font-mono text-[11px]">
            <span>Session: Guest (Unauthenticated)</span>
            <span>Auth Route: /api/auth</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  )
}
