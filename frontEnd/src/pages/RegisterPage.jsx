import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { validateEmail, validatePhone, getPasswordStrength } from '../utils/helpers'
import styles from './AuthPages.module.css'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [terms, setTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { showToast } = useToast()
  const navigate = useNavigate()

  const strength = getPasswordStrength(form.password)

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Full name is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!validateEmail(form.email)) errs.email = 'Please enter a valid email'
    if (!form.phone) errs.phone = 'Phone number is required'
    else if (!validatePhone(form.phone)) errs.phone = 'Enter a valid Sri Lankan phone number'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!terms) errs.terms = 'You must accept the terms and conditions'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          termsAccepted: terms,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.')
      }

      showToast('Account created! Please sign in 🌸', 'success')
      navigate('/login')
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.authPage} ${styles.mirrored}`}>
      <div className={styles.formSide}>
        <div className={styles.formCard}>
          <h1>Create Account</h1>
          <p className={styles.formSub}>Join the Bloom & Bliss family</p>

          {errors.form && <p className={styles.formError}>{errors.form}</p>}

          <form onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label>Full Name</label>
              <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Amaya Fernando" />
              {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
            </div>

            <div className={styles.field}>
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@email.lk" />
              {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
            </div>

            <div className={styles.field}>
              <label>Phone Number</label>
              <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+94 77 XXX XXXX" />
              {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
            </div>

            <div className={styles.field}>
              <label>Password</label>
              <div className={styles.passwordWrap}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="••••••••"
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {form.password && (
                <div className={styles.strengthBar}>
                  <div className={styles.strengthTrack}>
                    <div
                      className={styles.strengthFill}
                      style={{ width: `${strength.level}%`, background: strength.color }}
                    />
                  </div>
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
              {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
            </div>

            <div className={styles.field}>
              <label>Confirm Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => update('confirmPassword', e.target.value)}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword}</span>}
            </div>

            <label className={styles.checkbox}>
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
              I agree to the <a href="#">Terms & Conditions</a>
            </label>
            {errors.terms && <span className={styles.fieldError}>{errors.terms}</span>}

            <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? <Loader2 size={20} className={styles.spinner} /> : 'Create Account'}
            </button>
          </form>

          <p className={styles.switchAuth}>
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>

      <div className={styles.visual}>
        <div className={styles.visualBg} />
        <div className={styles.visualContent}>
          <h2>Join Us</h2>
          <p>Create an account to track orders, save wishlists, and leave reviews on your favourite bouquets.</p>
        </div>
      </div>
    </div>
  )
}