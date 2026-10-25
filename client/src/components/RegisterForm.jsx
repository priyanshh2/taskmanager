import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, Check } from 'lucide-react'

export default function RegisterForm({ onSwitchToLogin }) {
  const { register, authError, clearError } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [clientErrors, setClientErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const errors = {}
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      errors.name = 'Full name is required'
    } else if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters long'
    }

    if (!trimmedEmail) {
      errors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
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
      await register(name.trim(), email.trim(), password)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isPasswordMinLength = password.length >= 8
  const doPasswordsMatch = password && confirmPassword && password === confirmPassword

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/90 p-8 shadow-2xl backdrop-blur-xl space-y-6">
        {/* Form Header */}
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl font-bold tracking-tight text-white">Create an account</h2>
          <p className="text-xs text-slate-400">
            Join TaskFlow to start managing your tasks
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
          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300" htmlFor="register-name">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (clientErrors.name) setClientErrors({ ...clientErrors, name: null })
                }}
                placeholder="Sarah Connor"
                disabled={isSubmitting}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/60 border ${
                  clientErrors.name ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                } text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-50`}
              />
            </div>
            {clientErrors.name && (
              <p className="text-[11px] text-rose-400 flex items-center space-x-1 mt-1">
                <span>{clientErrors.name}</span>
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300" htmlFor="register-email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (clientErrors.email) setClientErrors({ ...clientErrors, email: null })
                }}
                placeholder="sarah@example.com"
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
            <label className="block text-xs font-medium text-slate-300" htmlFor="register-password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (clientErrors.password) setClientErrors({ ...clientErrors, password: null })
                }}
                placeholder="At least 8 characters"
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

          {/* Confirm Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300" htmlFor="register-confirm-password">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="register-confirm-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (clientErrors.confirmPassword) setClientErrors({ ...clientErrors, confirmPassword: null })
                }}
                placeholder="Re-enter your password"
                disabled={isSubmitting}
                className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/60 border ${
                  clientErrors.confirmPassword ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                } text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-50`}
              />
            </div>
            {clientErrors.confirmPassword && (
              <p className="text-[11px] text-rose-400 flex items-center space-x-1 mt-1">
                <span>{clientErrors.confirmPassword}</span>
              </p>
            )}
          </div>

          {/* Live Validation Badges */}
          <div className="pt-1 flex flex-wrap gap-2 text-[11px]">
            <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border ${
              isPasswordMinLength ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}>
              <Check className={`w-3 h-3 ${isPasswordMinLength ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>8+ characters</span>
            </span>
            <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg border ${
              doPasswordsMatch ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}>
              <Check className={`w-3 h-3 ${doPasswordsMatch ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>Passwords match</span>
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="register-submit-btn"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-60 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="pt-2 border-t border-slate-800/80 text-center text-xs text-slate-400">
          <span>Already have an account? </span>
          <button
            type="button"
            id="switch-to-login-btn"
            onClick={onSwitchToLogin}
            className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 transition-colors cursor-pointer"
          >
            Sign in instead
          </button>
        </div>
      </div>
    </div>
  )
}
