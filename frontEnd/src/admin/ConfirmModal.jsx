import styles from './adminShared.module.css'

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  if (!message) return null

  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Confirm Delete</h3>
        <p>{message || 'Are you sure? This cannot be undone.'}</p>
        <div className={styles.modalActions}>
          <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
          <button type="button" className={styles.deleteBtn} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}
