import { createContext, useContext, useReducer, useEffect } from 'react'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Built-in demo accounts used when no backend is reachable (frontend-only mode).
const MOCK_USERS = [
  {
    email: 'amaya@email.lk',
    password: 'password123',
    user: { id: 'u_amaya', name: 'Amaya', email: 'amaya@email.lk', role: 'user' },
  },
  {
    email: 'admin@bloomandbliss.lk',
    password: 'admin123',
    user: { id: 'u_admin', name: 'Admin', email: 'admin@bloomandbliss.lk', role: 'admin' },
  },
]

function mockAuthLogin(email, password) {
  const match = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  )
  if (!match) {
    throw new Error('Invalid email or password')
  }
  return { token: `mock-token-${match.user.id}`, user: match.user }
}

const initialState = {
  user: null,
  isLoggedIn: false,
  isAdmin: false,
  loading: true,
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        user: action.payload,
        isLoggedIn: true,
        isAdmin: action.payload.role === 'admin',
        loading: false,
      }
    case 'LOGOUT':
      return { ...initialState, loading: false }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } }
    default:
      return state
  }
}

async function parseAuthError(response) {
  try {
    const data = await response.json()
    return data.message || 'Authentication failed'
  } catch {
    return 'Authentication failed'
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('bb_token')
      const storedUser = localStorage.getItem('bb_user')

      if (!token || !storedUser) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      try {
        const user = JSON.parse(storedUser)
        const response = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const freshUser = await response.json()
          localStorage.setItem('bb_user', JSON.stringify(freshUser))
          dispatch({ type: 'LOGIN', payload: freshUser })
        } else {
          localStorage.removeItem('bb_token')
          localStorage.removeItem('bb_user')
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch {
        try {
          const user = JSON.parse(storedUser)
          dispatch({ type: 'LOGIN', payload: user })
        } catch {
          localStorage.removeItem('bb_token')
          localStorage.removeItem('bb_user')
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      }
    }

    restoreSession()
  }, [])

  const login = async (email, password) => {
    let data
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error(await parseAuthError(response))
      }

      data = await response.json()
    } catch (err) {
      // No backend reachable: fall back to built-in demo accounts.
      if (err instanceof TypeError) {
        data = mockAuthLogin(email, password)
      } else {
        throw err
      }
    }

    localStorage.setItem('bb_token', data.token)
    localStorage.setItem('bb_user', JSON.stringify(data.user))
    dispatch({ type: 'LOGIN', payload: data.user })
    return data.user
  }

  const register = async (formData) => {
    let data
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      })

      if (!response.ok) {
        throw new Error(await parseAuthError(response))
      }

      data = await response.json()
    } catch (err) {
      // No backend reachable: create a local-only account.
      if (err instanceof TypeError) {
        const user = {
          id: `u_${Date.now()}`,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: 'user',
        }
        data = { token: `mock-token-${user.id}`, user }
      } else {
        throw err
      }
    }

    localStorage.setItem('bb_token', data.token)
    localStorage.setItem('bb_user', JSON.stringify(data.user))
    dispatch({ type: 'LOGIN', payload: data.user })
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('bb_user')
    localStorage.removeItem('bb_token')
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('authUser')
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        isAdmin: state.isAdmin,
        loading: state.loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
