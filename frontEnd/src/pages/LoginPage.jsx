import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { validateEmail } from '../utils/helpers'
import styles from './AuthPages.module.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const validate = () => {
    const errs = {}
    if (!email) errs.email = 'Email is required'
    else if (!validateEmail(email)) errs.email = 'Please enter a valid email'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Login failed. Please try again.')
      }

      // No JWT yet — persist the logged-in user so the app knows who's signed in
      // across refreshes. Swap this for a token once the backend issues one.
      localStorage.setItem('user', JSON.stringify(data.user))

      showToast('Welcome back! 🌸', 'success')
      navigate(from, { replace: true })
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.visual}>
        <div className={styles.visualBg} />
        <div className={styles.visualContent}>
          <h2>Bloom & Bliss</h2>
          <p>Where every petal tells a story of love, crafted in the heart of Sri Lanka.</p>
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={styles.formCard}>
          <h1>Welcome Back</h1>
          <p className={styles.formSub}>Sign in to your account</p>

          {errors.form && <p className={styles.formError}>{errors.form}</p>}

          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.lk"
              />
              {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </div>

            <div className={styles.field}>
              <label>Password</label>
              <div className={styles.passwordWrap}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
            </div>

            <div className={styles.formRow}>
              <label className={styles.checkbox}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Remember me
              </label>
              <a href="#" className={styles.forgotLink}>Forgot password?</a>
            </div>

            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? <Loader2 size={20} className={styles.spinner} /> : 'Sign In'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>or continue with</span>
          </div>

          <div className={styles.socialBtns}>
            <button className={styles.googleBtn}>Google</button>
            <button className={styles.facebookBtn}>Facebook</button>
          </div>

          <p className={styles.switchAuth}>
            Don't have an account? <Link to="/register">Register →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}