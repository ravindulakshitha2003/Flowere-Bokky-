import { createContext, useContext, useState, useEffect } from 'react'

const FestivalContext = createContext(null)

const STORAGE_KEY = 'festivalMode'

function readSavedMode() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) return saved
  const legacy = localStorage.getItem('bb_festival')
  if (legacy) return legacy
  return 'off'
}

export function FestivalProvider({ children }) {
  const [festivalMode, setFestivalMode] = useState(readSavedMode)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, festivalMode)
  }, [festivalMode])

  return (
    <FestivalContext.Provider value={{ festivalMode, setFestivalMode }}>
      {children}
    </FestivalContext.Provider>
  )
}

export const useFestival = () => {
  const ctx = useContext(FestivalContext)
  if (!ctx) throw new Error('useFestival must be used within FestivalProvider')
  return ctx
}
