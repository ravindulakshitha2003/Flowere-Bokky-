import { createContext, useContext, useReducer, useEffect } from 'react'

const AuthContext = createContext(null)

const MOCK_USERS = [
  {
    id: 'user-1',
    name: 'Amaya Fernando',
    email: 'amaya@email.lk',
    phone: '+94771234567',
    password: 'password123',
    role: 'user',
  },
  {
    id: 'admin-1',
    name: 'Bloom Admin',
    email: 'admin@bloomandbliss.lk',
    phone: '+94777654321',
    password: 'admin123',
    role: 'admin',
  },
]

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

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const stored = localStorage.getItem('bb_user')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        dispatch({ type: 'LOGIN', payload: user })
      } catch {
        localStorage.removeItem('bb_user')
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const login = async (email, password) => {
    await new Promise((r) => setTimeout(r, 800))
    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!user) throw new Error('Invalid email or password')
    const { password: _, ...safeUser } = user
    localStorage.setItem('bb_user', JSON.stringify(safeUser))
    dispatch({ type: 'LOGIN', payload: safeUser })
    return safeUser
  }

  const register = async (data) => {
    await new Promise((r) => setTimeout(r, 1000))
    const exists = MOCK_USERS.find((u) => u.email.toLowerCase() === data.email.toLowerCase())
    if (exists) throw new Error('An account with this email already exists')
    const newUser = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: 'user',
    }
    MOCK_USERS.push(newUser)
    const { password: _, ...safeUser } = newUser
    localStorage.setItem('bb_user', JSON.stringify(safeUser))
    dispatch({ type: 'LOGIN', payload: safeUser })
    return safeUser
  }

  const logout = () => {
    localStorage.removeItem('bb_user')
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
