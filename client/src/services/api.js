/**
 * TaskFlow API Client & Session Management
 *
 * STORAGE DESIGN DECISION:
 * For Phase 2, authentication tokens (JWT) are stored in `sessionStorage`.
 *
 * Security Note:
 * - `sessionStorage` isolates the token to the current browser tab and clears automatically when the tab closes.
 * - However, like `localStorage`, any JavaScript-accessible storage is vulnerable to token theft if an XSS
 *   (Cross-Site Scripting) vulnerability is introduced into the application.
 * - This approach is chosen for simplicity in this local assessment phase.
 * - In a production enterprise deployment, tokens should ideally be stored in `HttpOnly`, `Secure`, `SameSite=Strict`
 *   cookies, or kept strictly in-memory alongside a secure refresh-token rotation mechanism.
 */

const TOKEN_KEY = 'taskflow_auth_token'
const USER_KEY = 'taskflow_auth_user'

export const tokenStorage = {
  get: () => {
    try {
      return sessionStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set: (token) => {
    try {
      sessionStorage.setItem(TOKEN_KEY, token)
    } catch (e) {
      console.error('Failed to save auth token to sessionStorage:', e)
    }
  },
  remove: () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY)
    } catch (e) {
      console.error('Failed to remove auth token from sessionStorage:', e)
    }
  },
}

export const userStorage = {
  get: () => {
    try {
      const data = sessionStorage.getItem(USER_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },
  set: (user) => {
    try {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch (e) {
      console.error('Failed to save user to sessionStorage:', e)
    }
  },
  remove: () => {
    try {
      sessionStorage.removeItem(USER_KEY)
    } catch (e) {
      console.error('Failed to remove user from sessionStorage:', e)
    }
  },
}

export const clearAuthSession = () => {
  tokenStorage.remove()
  userStorage.remove()
}

/**
 * Centralized fetch helper with automatic Authorization header injection
 * and 401 handling for expired/invalid tokens.
 */
export async function apiFetch(endpoint, options = {}, onUnauthorized = null) {
  const token = tokenStorage.get()

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  // Inject Authorization Bearer token if present
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  })

  // Handle 401 Unauthorized globally (token expired or invalid)
  if (response.status === 401) {
    clearAuthSession()
    if (typeof onUnauthorized === 'function') {
      onUnauthorized()
    }
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`)
    error.status = response.status
    error.data = data
    throw error
  }

  return data
}

/**
 * Auth API Endpoints
 */
export const authAPI = {
  register: (name, email, password) =>
    apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: (onUnauthorized) =>
    apiFetch('/api/auth/me', { method: 'GET' }, onUnauthorized),

  logout: () =>
    apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => ({})),
}

/**
 * Task CRUD API Endpoints
 */
export const taskAPI = {
  getTasks: (onUnauthorized) =>
    apiFetch('/api/tasks', { method: 'GET' }, onUnauthorized),

  getTaskById: (id, onUnauthorized) =>
    apiFetch(`/api/tasks/${id}`, { method: 'GET' }, onUnauthorized),

  createTask: (taskData, onUnauthorized) =>
    apiFetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }, onUnauthorized),

  updateTask: (id, taskData, onUnauthorized) =>
    apiFetch(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    }, onUnauthorized),

  updateTaskStatus: (id, status, onUnauthorized) =>
    apiFetch(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, onUnauthorized),

  deleteTask: (id, onUnauthorized) =>
    apiFetch(`/api/tasks/${id}`, { method: 'DELETE' }, onUnauthorized),
}

