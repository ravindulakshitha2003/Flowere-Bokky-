import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

function readTheme() {
  return localStorage.getItem('theme') === 'dark'
}

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(readTheme)

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
