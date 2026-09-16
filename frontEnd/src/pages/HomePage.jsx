import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'

import { reviews } from '../data/reviews'
import { categories } from '../data/products'
import { seasonalOffer } from '../data/offers'
import { formatPrice } from '../utils/helpers'
import ProductCard from '../components/ui/ProductCard'
import CountdownTimer from '../components/ui/CountdownTimer'
import styles from './HomePage.module.css'

const steps = [
  { num: 1, icon: '🌷', title: 'Browse & Customize', desc: 'Explore our curated collection and personalise your perfect bouquet.' },
  { num: 2, icon: '📝', title: 'Place Your Order', desc: 'Choose delivery slot, add a gift message, and checkout securely.' },
  { num: 3, icon: '💐', title: 'We Craft With Love', desc: 'Our expert florists hand-tie every stem with care and artistry.' },
  { num: 4, icon: '🚚', title: 'Delivered to You', desc: 'Fresh blooms arrive at your door, beautifully packaged.' },
]

// Fixed palette gallery-preview tiles are drawn from — mirrors GalleryPage,
// so the two pages look consistent even though neither gradient is tied to
// a specific image.
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

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [galleryImages, setGalleryImages] = useState([])

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('http://localhost:3000/api/products')
        if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`)
        const data = await res.json()
        setProducts(Array.isArray(data.allproduct) ? data.allproduct : [])
      } catch (err) {
        console.log(err.message)
      }
    }
    async function fetchImages() {
      try {
        const res = await fetch('http://localhost:3000/api/image')
        if (!res.ok) throw new Error(`Failed to fetch images: ${res.status}`)
        const data = await res.json()
        const list = Array.isArray(data.allimage) ? data.allimage : []
        setGalleryImages(list.filter((img) => img.isApproved !== false))
      } catch (err) {
        console.log(err.message)
      }
    }
    fetchProducts()
    fetchImages()
  }, [])

  const bestsellers = products.filter((p) => p.rating >= 4.7).slice(0, 6)

  const galleryPreview = useMemo(
    () => galleryImages.slice(0, 6).map((img) => ({ ...img, gradient: randomGradient() })),
    [galleryImages]
  )

  // Cycle the same fetched gallery photos into the category tiles, layered
  // over each tile's existing gradient — there's no per-category image field
  // from the backend, so this reuses whatever /api/image returns.
  const categoryPhoto = (index) =>
    galleryImages.length > 0 ? galleryImages[index % galleryImages.length].link : null

  return (
    <div className={styles.home}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.petals} aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <span
              key={i}
              className={styles.petal}
              style={{
                left: `${8 + (i * 7.5) % 88}%`,
                animationDuration: `${8 + (i % 4) * 2}s`,
                animationDelay: `${i * 0.7}s`,
                '--drift': `${(i % 2 === 0 ? 1 : -1) * (20 + (i % 3) * 15)}px`,
                '--size': `${14 + (i % 3) * 4}px`,
              }}
            />
          ))}
        </div>
        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>
            Where <em>Every Petal</em> Tells a Story
          </h1>
          <p className={styles.heroSub}>Hand-crafted bouquets, delivered with love.</p>
          <div className={styles.heroCtas}>
            <Link to="/shop" className="btn-primary">Shop Now</Link>
            <Link to="/gallery" className="btn-outline">View Gallery</Link>
          </div>
          <div className={styles.trustBadges}>
            <span>🌿 100% Natural</span>
            <span>🎀 Hand-Crafted</span>
            <span>🚚 Same-Day Delivery</span>
            <span>⭐ 4.8/5 Rating</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.categoryGrid}>
            {categories.map((cat, i) => (
              <Link key={cat.id} to={`/shop?size=${cat.id}`} className={styles.categoryCard}>
                <div className={styles.categoryImage} style={{ background: cat.gradient }}>
                  {categoryPhoto(i) && (
                    <img src={categoryPhoto(i)} alt={cat.name} className={styles.categoryPhoto} loading="lazy" decoding="async" />
                  )}
                </div>
                <div className={styles.categoryInfo}>
                  <h3>{cat.name}</h3>
                  <p>{cat.flowers}</p>
                  <span className={styles.categoryPrice}>From {formatPrice(cat.startPrice)}</span>
                  <span className={styles.categoryExplore}>Explore →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Our Bestsellers</h2>
            <div className={styles.bestsellerScroll}>
              {bestsellers.map((p) => (
                <div key={p.id} className={styles.bestsellerCard}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className={`${styles.section} ${styles.howItWorks}`}>
        <div className="container">
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <div className={styles.stepsGrid}>
            {steps.map((step, i) => (
              <div key={step.num} className={styles.step}>
                {i < steps.length - 1 && <div className={styles.stepLine} />}
                <span className={styles.stepIcon}>{step.icon}</span>
                <span className={styles.stepNum}>{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
          <div className={styles.reviewsGrid}>
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className={`glass-card ${styles.reviewCard}`}>
                <div className={styles.reviewStars}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
                <p className={styles.reviewText}>"{review.text}"</p>
                <div className={styles.reviewAuthor}>
                  <div className={styles.reviewAvatar}>{review.avatar}</div>
                  <div>
                    <strong>{review.author}</strong>
                    <span>{review.date}</span>
                    <span className={styles.reviewProduct}>{review.productName}</span>
                  </div>
                </div>
                {review.verified && <span className={styles.verified}>✓ Verified Buyer</span>}
                {review.hasPhoto && <span className={styles.photoReview}>📷 Photo Review</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      {galleryPreview.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <div className={styles.galleryHeader}>
              <h2 className={styles.sectionTitle}>Our Work</h2>
              <Link to="/gallery" className={styles.galleryLink}>View Full Gallery →</Link>
            </div>
            <div className={styles.masonryGrid}>
              {galleryPreview.map((item, i) => (
                <div
                  key={item._id || item.id}
                  className={styles.masonryItem}
                  style={{ background: item.gradient, gridRow: i % 3 === 0 ? 'span 2' : 'span 1' }}
                >
                  <img src={item.link} alt={item.title || ''} className={styles.masonryImage} loading="lazy" decoding="async" />
                  <div className={styles.masonryOverlay}>
                    <span>{item.title}</span>
                    {item.occasion && <span className={styles.masonryTag}>{item.occasion}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Seasonal Offer */}
      {seasonalOffer.isActive && (
        <section className={styles.offerBanner}>
          <div className="container">
            <div className={styles.offerContent}>
              <div>
                <h2>{seasonalOffer.title}</h2>
                <p>{seasonalOffer.description}</p>
              </div>
              <CountdownTimer endDate={seasonalOffer.endDate} />
              <Link to={seasonalOffer.ctaLink} className={styles.offerCta}>
                {seasonalOffer.ctaText}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* WhatsApp CTA */}
      <section className={styles.whatsappCta}>
        <div className="container">
          <h2>Order via WhatsApp 🌸</h2>
          <p>Chat with our florists for custom bouquets, gift messages, and same-day delivery across Sri Lanka.</p>
          <a
            href="https://wa.me/94771234567?text=Hi%20Bloom%20%26%20Bliss!%20I%27d%20like%20to%20order%20a%20bouquet."
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappBtn}
          >
            Message Us on WhatsApp
          </a>
        </div>
      </section>
    </div>
  )
}