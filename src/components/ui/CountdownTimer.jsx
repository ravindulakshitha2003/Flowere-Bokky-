import { useState, useEffect } from 'react'
import styles from './CountdownTimer.module.css'

export default function CountdownTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft(endDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft(endDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [endDate])

  if (timeLeft.expired) return <span className={styles.expired}>Offer ended</span>

  return (
    <div className={styles.timer}>
      {[
        { value: timeLeft.days, label: 'Days' },
        { value: timeLeft.hours, label: 'Hrs' },
        { value: timeLeft.minutes, label: 'Min' },
        { value: timeLeft.seconds, label: 'Sec' },
      ].map((unit) => (
        <div key={unit.label} className={styles.unit}>
          <span className={styles.value}>{String(unit.value).padStart(2, '0')}</span>
          <span className={styles.label}>{unit.label}</span>
        </div>
      ))}
    </div>
  )
}

function calcTimeLeft(endDate) {
  const diff = new Date(endDate) - new Date()
  if (diff <= 0) return { expired: true }

  return {
    expired: false,
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}
