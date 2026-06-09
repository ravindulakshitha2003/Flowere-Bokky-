import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, isAdmin, loading } = useAuth()
  const location = useLocation()
  const { showToast } = useToast()
  const toastShownRef = useRef(false)

  useEffect(() => {
    if (!loading && !isLoggedIn && !toastShownRef.current) {
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
  }, [loading, isLoggedIn, location.pathname, showToast])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{
          width: 40, height: 40, border: '3px solid var(--petal)',
          borderTopColor: 'var(--rose-deep)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
