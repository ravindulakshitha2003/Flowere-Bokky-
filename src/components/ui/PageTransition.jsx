import { useLocation, useOutlet } from 'react-router-dom'
import styles from './PageTransition.module.css'

export default function PageTransition() {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <div key={location.pathname} className={styles.page}>
      {outlet}
    </div>
  )
}
