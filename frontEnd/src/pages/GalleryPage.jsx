import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './GalleryPage.module.css'

// Fixed palette the gradients are drawn from — not tied to any particular
// image, just a pleasant backdrop behind whatever photo lands on that tile.
const GRADIENTS = [
  'linear-gradient(160deg, #F2A7BB, #C9A84C)',
  'linear-gradient(145deg, #C9A84C, #F2A7BB)',
  'linear-gradient(135deg, #7A9E7E, #F9EDD3)',
  'linear-gradient(120deg, #FFD6E0, #C2185B)',
  'linear-gradient(170deg, #F9EDD3, #7A9E7E)',
  'linear-gradient(150deg, #C2185B, #FFD6E0)',
  'linear-gradient(140deg, #FFFDF8, #F2A7BB)',
  'linear-gradient(130deg, #7A9E7E, #C9A84C)',
]

function randomGradient() {
  return GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)]
}

function titleCase(str) {
  return str.replace(/(^|\s)\S/g, (c) => c.toUpperCase())
}

export default function GalleryPage() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('All')
  const [activeFilter, setActiveFilter] = useState('All')
  const [lightboxId, setLightboxId] = useState(null)

  useEffect(() => {
    async function fetchImages() {
      try {
        setLoading(true)
        setError(null)
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3000/api/image', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        })
        if (!res.ok) throw new Error(`Failed to fetch images: ${res.status}`)
        const data = await res.json()
        const list = Array.isArray(data.allimage) ? data.allimage : []
        setImages(list.filter((img) => img.isApproved !== false))
      } catch (err) {
        console.log(err.message)
        setError('Failed to load gallery images.')
      } finally {
        setLoading(false)
      }
    }
    fetchImages()
  }, [])

  // Assign each fetched image a gradient once (so it doesn't reshuffle on
  // every re-render), scaling to however many images actually come back.
  const tiles = useMemo(
    () => images.map((img) => ({ ...img, gradient: randomGradient() })),
    [images]
  )

  // Tabs come straight from whatever `tab` values the backend actually sends
  // — no fixed "work"/"brand" list, since that's no longer guaranteed.
  // "All" is always first and is the default, so a page with few images
  // spread across many distinct tab values doesn't hide most of them.
  const tabs = useMemo(() => {
    const unique = [...new Set(tiles.map((t) => t.tab).filter(Boolean))].sort()
    return ['All', ...unique]
  }, [tiles])

  // Filter chips are the union of unique occasion + type values seen in the
  // data, again not a fixed list.
  const filters = useMemo(() => {
    const occasions = tiles.map((t) => t.occasion).filter(Boolean)
    const types = tiles.map((t) => t.type).filter(Boolean)
    return ['All', ...new Set([...occasions, ...types])]
  }, [tiles])

  const filtered = tiles.filter((t) => {
    if (activeTab !== 'All' && t.tab !== activeTab) return false
    if (activeFilter === 'All') return true
    return t.occasion === activeFilter || t.type === activeFilter
  })

  const lightboxIndex = filtered.findIndex((t) => (t._id || t.id) === lightboxId)
  const lightboxTile = lightboxIndex !== -1 ? filtered[lightboxIndex] : null

  const navigateLightbox = (dir) => {
    if (lightboxIndex === -1 || filtered.length === 0) return
    const nextIdx = dir === 'next'
      ? (lightboxIndex + 1) % filtered.length
      : (lightboxIndex - 1 + filtered.length) % filtered.length
    setLightboxId(filtered[nextIdx]._id || filtered[nextIdx].id)
  }

  return (
    <div className={styles.gallery}>
      <div className="container">
        <h1 className={styles.title}>Gallery</h1>
        <p className={styles.subtitle}>A glimpse into our floral artistry across Sri Lanka</p>

        {loading && <p className={styles.empty}>Loading gallery…</p>}
        {!loading && error && <p className={styles.empty}>{error}</p>}

        {!loading && !error && (
          <>
            {tabs.length > 1 && (
              <div className={styles.tabs}>
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                    onClick={() => { setActiveTab(tab); setActiveFilter('All') }}
                  >
                    {titleCase(tab)}
                  </button>
                ))}
              </div>
            )}

            {filters.length > 1 && (
              <div className={styles.filters}>
                {filters.map((f) => (
                  <button
                    key={f}
                    className={`${styles.filterChip} ${activeFilter === f ? styles.filterActive : ''}`}
                    onClick={() => setActiveFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}

            <div className={styles.masonry}>
              {filtered.map((tile) => (
                <div
                  key={tile._id || tile.id}
                  className={styles.item}
                  style={{ background: tile.gradient }}
                  onClick={() => setLightboxId(tile._id || tile.id)}
                >
                  <img src={tile.link} alt={tile.title || ''} className={styles.itemImage} loading="lazy" decoding="async" />
                  {(tile.title || tile.occasion) && (
                    <div className={styles.overlay}>
                      {tile.title && <h3>{tile.title}</h3>}
                      {tile.occasion && <span className={styles.tag}>{tile.occasion}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className={styles.empty}>No images match this filter.</p>
            )}
          </>
        )}
      </div>

      {lightboxTile && (
        <div className={styles.lightbox} onClick={() => setLightboxId(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={() => setLightboxId(null)}>
              <X size={24} />
            </button>
            <button className={styles.lightboxPrev} onClick={() => navigateLightbox('prev')}>
              <ChevronLeft size={28} />
            </button>
            <div className={styles.lightboxImage} style={{ background: lightboxTile.gradient }}>
              <img src={lightboxTile.link} alt={lightboxTile.title || ''} className={styles.lightboxImagePhoto} />
            </div>
            <button className={styles.lightboxNext} onClick={() => navigateLightbox('next')}>
              <ChevronRight size={28} />
            </button>
            <div className={styles.lightboxInfo}>
              {lightboxTile.title && <h2>{lightboxTile.title}</h2>}
              {(lightboxTile.occasion || lightboxTile.type) && (
                <span>{[lightboxTile.occasion, lightboxTile.type].filter(Boolean).join(' · ')}</span>
              )}
              <Link to="/shop" className="btn-primary">Order Similar</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}