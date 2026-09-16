// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useToast } from '../../context/ToastContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const location = useLocation()
  const { showToast } = useToast()
  const toastShownRef = useRef(false)

  const token = localStorage.getItem('token')
  const isLoggedIn = !!token

  let user = null
  if (isLoggedIn) {
    try {
      user = JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      user = null
    }
  }
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    if (!isLoggedIn && !toastShownRef.current) {
      const needsLoginToast = ['/checkout', '/account', '/admin'].some((p) =>
        location.pathname.startsWith(p)
      )
      if (needsLoginToast) {
        showToast('Please log in to place an order 🌸', 'info')
        toastShownRef.current = true
      }
    }
    if (isLoggedIn) {
      toastShownRef.current = false
    }
  }, [isLoggedIn, location.pathname, showToast])

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}