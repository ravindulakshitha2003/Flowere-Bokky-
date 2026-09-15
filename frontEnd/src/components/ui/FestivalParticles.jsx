import { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from '../../context/ThemeContext'
import styles from './FestivalParticles.module.css'

const MODE_COUNTS = {
  christmas: { desktop: 35, mobile: 17 },
  rain: { desktop: 120, mobile: 60 },
  default: { desktop: 30, mobile: 15 },
  valentines: { desktop: 25, mobile: 12 },
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function pickSnowColor(isDark) {
  if (isDark) {
    return Math.random() < 0.85
      ? 'rgba(255, 255, 255, 0.88)'
      : 'rgba(255, 255, 255, 0.85)'
  }
  const r = Math.random()
  if (r < 0.5) return 'rgba(195, 225, 245, 0.92)'
  if (r < 0.85) return 'rgba(215, 238, 250, 0.88)'
  return 'rgba(170, 210, 235, 0.85)'
}

function pickSnowSize() {
  const r = Math.random()
  if (r < 0.6) return randomBetween(10, 14)
  if (r < 0.9) return randomBetween(15, 20)
  return randomBetween(21, 26)
}

function pickHeartColor() {
  const r = Math.random()
  if (r < 0.4) return '#C2185B'
  if (r < 0.7) return '#E91E8C'
  if (r < 0.9) return '#AD1457'
  return '#FF4081'
}

function pickHeartSize() {
  if (Math.random() < 0.15) return randomBetween(36, 44)
  return randomBetween(18, 32)
}

function pickPetalColor() {
  const r = Math.random()
  if (r < 0.5) return '#E91E8C'
  if (r < 0.8) return '#C2185B'
  return '#F06292'
}

function pickPetalDimensions() {
  return {
    width: randomBetween(10, 18),
    height: randomBetween(16, 28),
  }
}

function generateParticles(mode, isMobile, isDark) {
  const config = MODE_COUNTS[mode]
  if (!config) return []

  const count = isMobile ? config.mobile : config.desktop

  return Array.from({ length: count }, (_, index) => {
    const base = {
      id: `${mode}-${index}-${Math.random().toString(36).slice(2, 9)}`,
      left: Math.random() * 100,
    }

    switch (mode) {
      case 'christmas': {
        const swayDuration = randomBetween(3, 6)
        return {
          ...base,
          type: 'snow',
          left: Math.random() * 100,
          size: pickSnowSize(),
          opacity: randomBetween(0.6, 0.9),
          color: pickSnowColor(isDark),
          duration: randomBetween(6, 12),
          delay: Math.random() * 12,
          swayDuration,
          swayDelay: Math.random() * swayDuration,
          swayMax: randomBetween(8, 15),
        }
      }
      case 'rain':
        return {
          ...base,
          type: 'rain',
          width: randomBetween(2, 3),
          height: randomBetween(20, 35),
          duration: randomBetween(0.4, 0.9),
          delay: Math.random() * 0.9,
          angle: randomBetween(15, 20),
        }
      case 'default': {
        const dims = pickPetalDimensions()
        return {
          ...base,
          type: 'petal',
          color: pickPetalColor(),
          width: dims.width,
          height: dims.height,
          opacity: randomBetween(0.75, 1),
          duration: randomBetween(6, 12),
          delay: Math.random() * 12,
          drift: randomBetween(30, 60) * (Math.random() > 0.5 ? 1 : -1),
          rotateDuration: randomBetween(4, 10),
        }
      }
      case 'valentines':
        return {
          ...base,
          type: 'heart',
          color: pickHeartColor(),
          duration: randomBetween(6, 12),
          delay: Math.random() * 12,
          drift: randomBetween(20, 45) * (Math.random() > 0.5 ? 1 : -1),
          size: pickHeartSize(),
        }
      default:
        return base
    }
  })
}

function PetalShape({ color, width, height, opacity }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
      className={styles.petalSvg}
      aria-hidden="true"
    >
      <ellipse
        cx="12"
        cy="14"
        rx="7"
        ry="10"
        fill={color}
        transform="rotate(-30 12 14)"
        opacity={opacity}
      />
    </svg>
  )
}

export default function FestivalParticles({ mode = 'off' }) {
  const containerRef = useRef(null)
  const { isDark } = useTheme()
  const [particles, setParticles] = useState([])
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  )

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (mode === 'off') {
      setParticles([])
      return
    }
    setParticles(generateParticles(mode, isMobile, isDark))
  }, [mode, isMobile, isDark])

  const handleSnowIteration = useCallback((e) => {
    e.currentTarget.style.left = `${Math.random() * 100}vw`
  }, [])

  const handleIteration = useCallback((e) => {
    e.currentTarget.style.left = `${Math.random() * 100}%`
  }, [])

  if (mode === 'off' || particles.length === 0) {
    return null
  }

  const modeClass = styles[`mode-${mode}`] || ''

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${modeClass}`}
      aria-hidden="true"
    >
      {particles.map((p) => {
        if (p.type === 'snow') {
          return (
            <span
              key={p.id}
              className={styles.snowflake}
              onAnimationIteration={handleSnowIteration}
              style={{
                left: `${p.left}vw`,
                fontSize: `${p.size}px`,
                opacity: p.opacity,
                color: p.color,
                animationDuration: `${p.duration}s, ${p.swayDuration}s`,
                animationDelay: `${p.delay}s, ${p.swayDelay}s`,
                '--sway-max': `${p.swayMax}px`,
              }}
            >
              ❄
            </span>
          )
        }

        if (p.type === 'rain') {
          return (
            <span
              key={p.id}
              className={styles.rain}
              onAnimationIteration={handleIteration}
              style={{
                left: `${p.left}%`,
                width: `${p.width}px`,
                height: `${p.height}px`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                '--rain-angle': `${p.angle}deg`,
              }}
            />
          )
        }

        if (p.type === 'petal') {
          return (
            <span
              key={p.id}
              className={styles.petal}
              onAnimationIteration={handleIteration}
              style={{
                left: `${p.left}%`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                '--drift': `${p.drift}px`,
                '--rotate-duration': `${p.rotateDuration}s`,
              }}
            >
              <PetalShape
                color={p.color}
                width={p.width}
                height={p.height}
                opacity={p.opacity}
              />
            </span>
          )
        }

        if (p.type === 'heart') {
          return (
            <span
              key={p.id}
              className={styles.heart}
              onAnimationIteration={handleIteration}
              style={{
                left: `${p.left}%`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                '--drift': `${p.drift}px`,
                '--heart-color': p.color,
                '--heart-size': `${p.size}px`,
              }}
            >
              <span className={styles.heartChar} aria-hidden="true">♥</span>
            </span>
          )
        }

        return null
      })}
    </div>
  )
}

// ✅ FILE COMPLETE - FestivalParticles.jsx
