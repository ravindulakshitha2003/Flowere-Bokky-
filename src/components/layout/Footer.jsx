import { Link } from 'react-router-dom'
import { Instagram, Facebook, MessageCircle } from 'lucide-react'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer} id="about">
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <h3 className={styles.logo}>Bloom & Bliss</h3>
            <p className={styles.tagline}>
              Hand-crafted bouquets, delivered with love across Sri Lanka.
            </p>
            <div className={styles.social}>
              <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
              <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
              <a href="https://wa.me/94771234567" aria-label="WhatsApp"><MessageCircle size={20} /></a>
            </div>
          </div>

          <div className={styles.links}>
            <h4>Quick Links</h4>
            <Link to="/shop">Shop</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/track/ORD-2847">Track Order</Link>
            <a href="mailto:hello@bloomandbliss.lk">Contact</a>
          </div>

          <div className={styles.links}>
            <h4>Delivery Areas</h4>
            <span>Colombo & Suburbs</span>
            <span>Kandy & Hill Country</span>
            <span>Galle & Southern Coast</span>
            <span>Island-wide Delivery</span>
          </div>

          <div className={styles.payment}>
            <h4>We Accept</h4>
            <div className={styles.paymentIcons}>
              <span className={styles.visa}>VISA</span>
              <span className={styles.mastercard}>Mastercard</span>
              <span className={styles.cod}>Cash on Delivery</span>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© 2026 Bloom & Bliss. Made with 🌸 in Sri Lanka</p>
        </div>
      </div>
    </footer>
  )
}
