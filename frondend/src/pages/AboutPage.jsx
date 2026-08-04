import SEOHead from '../components/SEOHead'
import styles from './AboutPage.module.css'

const VALUES = [
  { icon: '🌿', title: '100% Natural', desc: 'Fresh stems sourced daily from trusted Sri Lankan growers — never artificial substitutes.' },
  { icon: '🎀', title: 'Hand-Crafted', desc: 'Every bouquet is tied by skilled florists who treat each arrangement as a work of art.' },
  { icon: '💛', title: 'Made with Love', desc: 'From the first stem to the final ribbon, we pour care into every detail of your order.' },
]

const FEATURES = [
  { icon: '⭐', title: 'Verified Reviews', desc: 'Real feedback from happy customers across the island.' },
  { icon: '🚚', title: 'Reliable Delivery', desc: 'Zone-based delivery with tracked slots and same-day options in Colombo.' },
  { icon: '🎨', title: 'Full Customization', desc: 'Choose wrapping, add-ons, sizes, and gift messages for a personal touch.' },
  { icon: '💬', title: 'Personal Service', desc: 'Chat with us on WhatsApp for bespoke bouquets and special requests.' },
]

const STATS = [
  { value: '500+', label: 'Happy Customers' },
  { value: '1,200+', label: 'Bouquets Made' },
  { value: '4.8★', label: 'Average Rating' },
  { value: '3', label: 'Years of Blooming' },
]

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <SEOHead title="About Us" />

      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.petals} aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className={styles.petal}
              style={{
                left: `${10 + i * 8}%`,
                animationDuration: `${9 + (i % 3) * 2}s`,
                animationDelay: `${i * 0.6}s`,
                '--drift': `${(i % 2 ? -1 : 1) * (18 + i * 4)}px`,
              }}
            />
          ))}
        </div>
        <div className={`container ${styles.heroContent}`}>
          <h1 className={styles.heroTitle}>Our Story</h1>
          <p className={styles.heroSub}>
            Bloom & Bliss began in a small Colombo studio with a simple belief: flowers should tell
            your story. Today we craft hand-tied bouquets for birthdays, weddings, and everyday
            moments — delivered with warmth across Sri Lanka.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Our Values</h2>
          <div className={styles.valuesGrid}>
            {VALUES.map((v) => (
              <div key={v.title} className={`glass-card ${styles.valueCard}`}>
                <span className={styles.valueIcon}>{v.icon}</span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.twoCol}>
            <div className={styles.imagePlaceholder} />
            <div className={styles.flowersText}>
              <h2>Meet the Flowers</h2>
              <p>
                We partner with local farms for roses, orchids, lilies, and seasonal blooms —
                selected at peak freshness. Our <strong>Natural Flowers</strong> bouquets use real
                stems arranged in classic and contemporary styles.
              </p>
              <p>
                Our <strong>Hand-Ribbon</strong> collection offers long-lasting artisan blooms
                perfect for events, corporate gifts, and tropical climates where fresh flowers need
                extra care. Every arrangement is quality-checked before it leaves our studio.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.featuresSection}`}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Why Choose Us</h2>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureBlock}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.statsRow}>
        <div className={`container ${styles.statsInner}`}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.stat}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Contact & Find Us</h2>
          <div className={`glass-card ${styles.contactCard}`}>
            <div>
              <h3>WhatsApp</h3>
              <a href="https://wa.me/94771234567">+94 77 123 4567</a>
            </div>
            <div>
              <h3>Email</h3>
              <a href="mailto:hello@bloomandbliss.lk">hello@bloomandbliss.lk</a>
            </div>
            <div>
              <h3>Location</h3>
              <p>Colombo &amp; Greater Western Province, Sri Lanka</p>
            </div>
            <div>
              <h3>Hours</h3>
              <p>Mon – Sat: 8:00 AM – 8:00 PM<br />Sun: 9:00 AM – 5:00 PM</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
