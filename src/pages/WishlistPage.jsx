import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useStore } from '../context/StoreContext'
import ProductCard from '../components/ui/ProductCard'
import styles from './WishlistPage.module.css'

export default function WishlistPage() {
  const { items } = useWishlist()
  const { products } = useStore()

  const wishlistProducts = items
    .map((item) => products.find((p) => p.id === item.productId))
    .filter(Boolean)

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIllustration} aria-hidden="true" />
        <h2>Nothing saved yet</h2>
        <p>Heart a bouquet to save it here</p>
        <Link to="/shop" className="btn-primary">Browse Bouquets</Link>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <h1>My Wishlist 🌸</h1>
          <p>{items.length} bouquet{items.length !== 1 ? 's' : ''} saved</p>
        </header>

        {wishlistProducts.length === 0 ? (
          <div className={styles.staleNotice}>
            <p>Some saved items are no longer available.</p>
            <Link to="/shop" className="btn-outline">Browse Bouquets</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} showSizeSelector />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
