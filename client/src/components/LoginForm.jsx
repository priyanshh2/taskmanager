import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

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
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-default)] p-6 sm:p-7 shadow-dropdown space-y-5 animate-fadeIn">
        {/* Form Header */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Sign In</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Enter your credentials to access your workspace
          </p>
        </div>

        {/* Server Auth Error Banner */}
        {authError && (
          <div className="p-2.5 rounded-[6px] bg-[var(--tag-red-bg)] border border-[var(--tag-red-border)] text-[var(--tag-red-text)] text-xs flex items-start space-x-2 animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{authError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          {/* Email Field */}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[var(--text-secondary)]" htmlFor="login-email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                <Mail className="w-3.5 h-3.5" />
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
                placeholder="name@example.com"
                disabled={isSubmitting}
                className={`w-full pl-8 pr-3 py-1.5 rounded-[6px] bg-[var(--bg-subtle)] border ${
                  clientErrors.email 
                    ? 'border-[var(--tag-red-border)] focus:border-[var(--tag-red-text)]' 
                    : 'border-[var(--border-default)] focus:border-[var(--accent-blue)] focus:bg-[var(--bg-surface)]'
                } text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] transition-all disabled:opacity-50`}
              />
            </div>
            {clientErrors.email && (
              <p className="text-[11px] text-[var(--tag-red-text)] mt-1">{clientErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-medium text-[var(--text-secondary)]" htmlFor="login-password">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                <Lock className="w-3.5 h-3.5" />
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
                className={`w-full pl-8 pr-9 py-1.5 rounded-[6px] bg-[var(--bg-subtle)] border ${
                  clientErrors.password 
                    ? 'border-[var(--tag-red-border)] focus:border-[var(--tag-red-text)]' 
                    : 'border-[var(--border-default)] focus:border-[var(--accent-blue)] focus:bg-[var(--bg-surface)]'
                } text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] transition-all disabled:opacity-50`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {clientErrors.password && (
              <p className="text-[11px] text-[var(--tag-red-text)] mt-1">{clientErrors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={isSubmitting}
            className="w-full py-1.5 px-3 rounded-[6px] bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-white text-xs font-medium shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Demo Account Helper */}
        <div className="pt-2 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={fillDemoAccount}
            className="w-full py-1 px-2 rounded-[5px] text-[11px] text-[var(--text-secondary)] hover:text-[var(--accent-blue-text)] hover:bg-[var(--bg-hover)] border border-dashed border-[var(--border-default)] transition-colors cursor-pointer text-center"
          >
            Use Demo Account Credentials
          </button>
        </div>

        {/* Switch to Register */}
        <div className="text-center text-xs text-[var(--text-secondary)] pt-1">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-[var(--accent-blue-text)] hover:underline font-medium cursor-pointer"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  )
}
