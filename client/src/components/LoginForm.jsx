import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react'

export default function LoginForm({ onSwitchToRegister }) {
  const { login, authError, clearError } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [clientErrors, setClientErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const errors = {}
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      errors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password) {
      errors.password = 'Password is required'
    }

    setClientErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    clearError()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await login(email.trim(), password)
    } finally {
      setIsSubmitting(false)
    }
  }

  const fillDemoAccount = () => {
    setEmail('demo.user@taskflow.dev')
    setPassword('DemoPass123!')
    setClientErrors({})
    clearError()
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Form Header */}
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome back</h2>
          <p className="text-xs text-slate-400">
            Sign in to access your TaskFlow dashboard
          </p>
        </div>

        {/* Server Auth Error Banner */}
        {authError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{authError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (clientErrors.email) setClientErrors({ ...clientErrors, email: null })
                }}
                placeholder="you@example.com"
                disabled={isSubmitting}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/60 border ${
                  clientErrors.email ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                } text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-50`}
              />
            </div>
            {clientErrors.email && (
              <p className="text-[11px] text-rose-400 flex items-center space-x-1 mt-1">
                <span>{clientErrors.email}</span>
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-slate-300" htmlFor="login-password">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (clientErrors.password) setClientErrors({ ...clientErrors, password: null })
                }}
                placeholder="••••••••"
                disabled={isSubmitting}
                className={`w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950/60 border ${
                  clientErrors.password ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                } text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {clientErrors.password && (
              <p className="text-[11px] text-rose-400 flex items-center space-x-1 mt-1">
                <span>{clientErrors.password}</span>
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in to TaskFlow</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Fill for rapid testing */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Need test inputs?</span>
          <button
            type="button"
            id="fill-demo-btn"
            onClick={fillDemoAccount}
            className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2 transition-colors cursor-pointer"
          >
            Fill Demo Credentials
          </button>
        </div>

        {/* Switch to Registration */}
        <div className="text-center text-xs text-slate-400">
          <span>Don't have an account yet? </span>
          <button
            type="button"
            id="switch-to-register-btn"
            onClick={onSwitchToRegister}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  )
}
