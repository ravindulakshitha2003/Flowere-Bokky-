import { MessageCircle } from 'lucide-react'
import styles from './FloatingWhatsApp.module.css'

export default function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/94771234567"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
      aria-label="Chat with us on WhatsApp"
      data-tooltip="Chat with us"
    >
      <MessageCircle size={28} />
    </a>
  )
}
