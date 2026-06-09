import { useTheme } from '../../context/ThemeContext'
import styles from './ThemeToggle.module.css'

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      className={`${styles.toggle} ${className}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
