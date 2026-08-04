import { X } from 'lucide-react'
import styles from './Toast.module.css'

export default function Toast({ message, type, onClose }) {
  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      <span>{message}</span>
      <button className={styles.close} onClick={onClose} aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  )
}
