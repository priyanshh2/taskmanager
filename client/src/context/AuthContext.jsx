import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI, tokenStorage, userStorage, clearAuthSession } from '../services/api.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => userStorage.get())
  const [token, setToken] = useState(() => tokenStorage.get())
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  const handleUnauthorized = useCallback(() => {
    clearAuthSession()
    setUser(null)
    setToken(null)
    setAuthError('Your session has expired. Please sign in again.')
  }, [])

  // Verify stored session on initial mount
  useEffect(() => {
    const verifyInitialSession = async () => {
      const storedToken = tokenStorage.get()
      if (!storedToken) {
        setLoading(false)
        return
      }

      try {
        const response = await authAPI.getMe(handleUnauthorized)
        if (response.success && response.user) {
          setUser(response.user)
          userStorage.set(response.user)
          setToken(storedToken)
        } else {
          handleUnauthorized()
        }
      } catch {
        // If 401 or invalid token, clean up session
        handleUnauthorized()
      } finally {
        setLoading(false)
      }
    }

    verifyInitialSession()
  }, [handleUnauthorized])

  const register = async (name, email, password) => {
    setAuthError(null)
    try {
      const response = await authAPI.register(name, email, password)
      if (response.success && response.token) {
        tokenStorage.set(response.token)
        userStorage.set(response.user)
        setToken(response.token)
        setUser(response.user)
        return { success: true, user: response.user }
      }
      throw new Error(response.message || 'Registration failed')
    } catch (err) {
      const msg = err.message || 'Registration failed. Please check your inputs.'
      setAuthError(msg)
      return { success: false, error: msg }
    }
  }

  const login = async (email, password) => {
    setAuthError(null)
    try {
      const response = await authAPI.login(email, password)
      if (response.success && response.token) {
        tokenStorage.set(response.token)
        userStorage.set(response.user)
        setToken(response.token)
        setUser(response.user)
        return { success: true, user: response.user }
      }
      throw new Error(response.message || 'Login failed')
    } catch (err) {
      const msg = err.message || 'Invalid email or password'
      setAuthError(msg)
      return { success: false, error: msg }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch {
      // Ignore network errors on logout
    } finally {
      clearAuthSession()
      setUser(null)
      setToken(null)
      setAuthError(null)
    }
  }

  const clearError = () => setAuthError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        authError,
        register,
        login,
        logout,
        clearError,
        handleUnauthorized,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
