import { Link } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import { useState } from 'react'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { getDiscountedPrice } from '../../data/products'
import { formatPrice, getGradientForProduct, isNewProduct } from '../../utils/helpers'
import styles from './ProductCard.module.css'

const SIZE_LABELS = { S: 'Small', M: 'Medium', L: 'Large' }

const TYPE_ICONS = {
  'Natural Flowers': '🌸',
  'Hand-Ribbon': '🎀',
  'Vase-Arrangement': '🏺',
  'Boxed-Bouquet': '🎁',
}

function buildWishlistSnapshot(product) {
  return {
    wishlistItemId: Date.now().toString(),
    productId: product.id,
    name: product.name,
    price: product.sizes?.S?.price ?? 0,
    image: product.imageData?.main ?? product.images?.[0] ?? null,
    type: product.type,
  }
}

function buildCartSnapshot(product, size) {
  const sizeData = product.sizes[size]
  const price = product.isOffer
    ? getDiscountedPrice(sizeData.price, product.offerDiscount)
    : sizeData.price
  return {
    cartItemId: Date.now().toString(),
    productId: product.id,
    name: product.name,
    size,
    sizeLabel: SIZE_LABELS[size],
    price,
    image: product.imageData?.main ?? product.images?.[0] ?? null,
    wrapping: product.wrappingOptions?.[0] || 'Standard',
    addons: [],
    giftMessage: '',
    quantity: 1,
    packingCost: product.packingCost ?? 0,
    type: product.type,
  }
}

export default function ProductCard({ product, showSizeSelector = false }) {
  const [selectedSize, setSelectedSize] = useState('M')
  const { toggle, isWishlisted } = useWishlist()
  const { addItem } = useCart()
  const { showToast } = useToast()

  const sizeData = product.sizes[selectedSize]
  const price = product.isOffer
    ? getDiscountedPrice(sizeData.price, product.offerDiscount)
    : sizeData.price
  const outOfStock = sizeData.stock === 0
  const wishlisted = isWishlisted(product.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(buildCartSnapshot(product, selectedSize))
    showToast(`${product.name} added to cart 🌸`, 'success')
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(buildWishlistSnapshot(product))
    showToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ♥', 'info')
  }

  return (
    <Link to={`/product/${product.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <div
          className={styles.image}
          style={{ background: getGradientForProduct(product.id) }}
        >
          {product.images?.[0] && (
            <img src={product.images[0]} alt={product.name} className={styles.imagePhoto} loading="lazy" decoding="async" />
          )}
          {product.images?.[1] && (
            <img
              src={product.images[1]}
              alt=""
              className={`${styles.imagePhoto} ${styles.imagePhotoHover}`}
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
        {product.isOffer && (
          <span className={styles.offerBadge}>OFFER -{product.offerDiscount}%</span>
        )}
        {isNewProduct(product.createdAt) && (
          <span className={styles.newBadge}>NEW</span>
        )}
        <button
          type="button"
          className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlisted : ''}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{product.name}</h3>
        <span className={styles.type}>
          {TYPE_ICONS[product.type] || '💐'} {product.type}
        </span>

        {showSizeSelector && (
          <div className={styles.sizePills}>
            {['S', 'M', 'L'].map((s) => (
              <button
                key={s}
                type="button"
                className={`${styles.sizePill} ${selectedSize === s ? styles.sizeActive : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedSize(s)
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className={styles.rating}>
          <Star size={14} fill="var(--gold)" color="var(--gold)" />
          <span>{product.rating}</span>
          <span className={styles.reviewCount}>({product.reviewCount})</span>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(price)}</span>
          {product.isOffer && (
            <span className={styles.originalPrice}>{formatPrice(sizeData.price)}</span>
          )}
        </div>

        <p className={outOfStock ? styles.preorder : styles.inStock}>
          {outOfStock ? '⏳ Pre-Order (5 days)' : '✓ In Stock'}
        </p>

        <button type="button" className={styles.addBtn} onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </Link>
  )
}