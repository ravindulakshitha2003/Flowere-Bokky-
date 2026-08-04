import { useState } from 'react'
import { Link } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import styles from './GalleryPage.module.css'

const TABS = ['Our Work', 'Our Brand']
const FILTERS = ['All', 'Birthdays', 'Weddings', 'Anniversaries', 'Custom Orders', 'Natural', 'Hand-Ribbon']

export default function GalleryPage() {
  const { galleryItems } = useStore()
  const publicGallery = galleryItems.filter((item) => item.isApproved === true)
  const [activeTab, setActiveTab] = useState(0)
  const [activeFilter, setActiveFilter] = useState('All')
  const [lightbox, setLightbox] = useState(null)

  const tabKey = activeTab === 0 ? 'work' : 'brand'

  const filtered = publicGallery.filter((item) => {
    if (item.tab !== tabKey) return false
    if (activeFilter === 'All') return true
    if (activeFilter === 'Natural') return item.type === 'Natural Flowers'
    if (activeFilter === 'Hand-Ribbon') return item.type === 'Hand-Ribbon'
    return item.occasion === activeFilter
  })

  const navigateLightbox = (dir) => {
    const idx = filtered.findIndex((i) => i.id === lightbox.id)
    const next = dir === 'next'
      ? filtered[(idx + 1) % filtered.length]
      : filtered[(idx - 1 + filtered.length) % filtered.length]
    setLightbox(next)
  }

  return (
    <div className={styles.gallery}>
      <div className="container">
        <h1 className={styles.title}>Gallery</h1>
        <p className={styles.subtitle}>A glimpse into our floral artistry across Sri Lanka</p>

        <div className={styles.tabs}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`}
              onClick={() => { setActiveTab(i); setActiveFilter('All') }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={styles.filters}>
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`${styles.filterChip} ${activeFilter === f ? styles.filterActive : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className={styles.masonry}>
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className={styles.item}
              style={{
                background: item.gradient,
                gridRow: i % 4 === 0 ? 'span 2' : 'span 1',
              }}
              onClick={() => setLightbox(item)}
            >
              <div className={styles.overlay}>
                <h3>{item.title}</h3>
                <span className={styles.tag}>{item.occasion}</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className={styles.empty}>No images match this filter.</p>
        )}
      </div>

      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>
              <X size={24} />
            </button>
            <button className={styles.lightboxPrev} onClick={() => navigateLightbox('prev')}>
              <ChevronLeft size={28} />
            </button>
            <div className={styles.lightboxImage} style={{ background: lightbox.gradient }} />
            <button className={styles.lightboxNext} onClick={() => navigateLightbox('next')}>
              <ChevronRight size={28} />
            </button>
            <div className={styles.lightboxInfo}>
              <h2>{lightbox.title}</h2>
              <span>{lightbox.occasion} · {lightbox.type}</span>
              <Link to="/shop" className="btn-primary">Order Similar</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
