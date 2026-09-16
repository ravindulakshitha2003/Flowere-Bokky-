// src/pages/ProductDetailPage.jsx
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Star, Heart, ChevronDown, ChevronUp } from 'lucide-react'
import { addons, getDiscountedPrice } from '../data/products'
import { getReviewsByProduct } from '../data/reviews'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../context/ToastContext'
import { formatPrice } from '../utils/helpers'
import ProductCard from '../components/ui/ProductCard'
import styles from './ProductDetailPage.module.css'

const API = 'http://localhost:3000/api'
const SIZE_LABELS = { S: 'Small', M: 'Medium', L: 'Large' }

const WRAPPING_COLORS = {
  'Blush Pink': '#F2A7BB', 'Ivory Silk': '#FFFDF8', 'Sage Green': '#7A9E7E',
  'Gold Foil': '#C9A84C', 'Kraft Natural': '#D4A574', 'Sunshine Yellow': '#F9EDD3',
  'Coral Sunset': '#FF8A65', 'White Linen': '#FAFAFA', 'Pearl Satin': '#F5F0EB',
  'Champagne Mesh': '#F9EDD3', 'Lilac Satin': '#CE93D8', 'Lavender Mesh': '#E1BEE7',
  'Festival Orange': '#FF9800', 'Avurudu Gold': '#C9A84C', 'Red Silk': '#C2185B',
  'Gold Velvet': '#C9A84C', 'Deep Red Matte': '#8E1B3A', 'Black Silk': '#2B2B2B',
}

function buildWishlistSnapshot(product) {
  return {
    wishlistItemId: Date.now().toString(),
    productId: product._id || product.id,
    name: product.name,
    price: product.sizes?.S?.price ?? 0,
    image: product.imageData?.main ?? product.images?.[0] ?? null,
    type: product.type,
  }
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { toggle, isWishlisted } = useWishlist()
  const { showToast } = useToast()

  const [product, setProduct] = useState(null)
  const [allProducts, setAllProducts] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)

  const [selectedSize, setSelectedSize] = useState('M')
  const [activeImage, setActiveImage] = useState(0)
  const [wrapping, setWrapping] = useState('')
  const [surpriseMe, setSurpriseMe] = useState(false)
  const [selectedAddons, setSelectedAddons] = useState([])
  const [giftMessage, setGiftMessage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [openAccordion, setOpenAccordion] = useState('lighting')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')

  // --- fetch single product (re-runs when id changes) ---
  useEffect(() => {
    setIsLoaded(false)
    setProduct(null)

    async function fetchProduct() {
      try {
        const res = await fetch(`${API}/products/${id}`)
        if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`)
        const data = await res.json()
        const p = data.product
        setProduct(p)
        setActiveImage(0)
        setWrapping(p?.wrappingOptions?.[0] || '')
        setSelectedAddons([])
        setSurpriseMe(false)
        setGiftMessage('')
        setQuantity(1)
        setSelectedSize('M')
      } catch (err) {
        console.log(err.message)
      } finally {
        setIsLoaded(true)
      }
    }

    fetchProduct()
  }, [id])

  // --- fetch all products for "You May Also Love" ---
  useEffect(() => {
    async function fetchAllProducts() {
      try {
        const res = await fetch(`${API}/products`)
        if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`)
        const data = await res.json()
        setAllProducts(Array.isArray(data.allproduct) ? data.allproduct : [])
      } catch (err) {
        console.log(err.message)
      }
    }
    fetchAllProducts()
  }, [])

  if (!product) {
    if (!isLoaded) {
      return <div className={styles.notFound}><h2>Loading…</h2></div>
    }
    return (
      <div className={styles.notFound}>
        <h2>Bouquet not found</h2>
        <Link to="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    )
  }

  const productId = product._id || product.id
  const sizeData = product.sizes[selectedSize]
  const basePrice = product.isOffer
    ? getDiscountedPrice(sizeData.price, product.offerDiscount)
    : sizeData.price
  const addonsTotal = selectedAddons.reduce((s, a) => s + a.price, 0)
  const packingCost = product.packingCost ?? 0
  const subtotal = (basePrice + packingCost + addonsTotal) * quantity
  const outOfStock = sizeData.stock === 0
  const productReviews = getReviewsByProduct(productId)

  const related = allProducts
    .filter((p) => (p._id || p.id) !== productId && p.isActive !== false)
    .slice(0, 4)

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.id === addon.id)
      return exists ? prev.filter((a) => a.id !== addon.id) : [...prev, addon]
    })
  }

  // --- the full snapshot the order payload is built from ---
  const handleAddToCart = () => {
    addItem({
      cartItemId: `${productId}-${selectedSize}-${Date.now()}`,

      productId,
      name: product.name,
      type: product.type,
      image: product.imageData?.main ?? product.images?.[0] ?? null,

      size: selectedSize,
      sizeLabel: SIZE_LABELS[selectedSize],
      flowers: sizeData.flowers ?? null,

      price: basePrice,
      originalPrice: sizeData.price,
      isOffer: !!product.isOffer,
      offerDiscount: product.offerDiscount ?? 0,

      packingCost,
      packingMaterial: product.packingMaterial ?? null,
      quality: product.quality ?? null,
      weight: product.weight ?? null,
      dimensions: product.dimensions ?? null,
      colors: product.colors ?? [],
      flowerList: product.flowers ?? [],

      wrapping: surpriseMe ? 'Surprise Me' : wrapping,
      surpriseMe,

      addons: selectedAddons.map((a) => ({
        addonId: a.id,
        name: a.name,
        price: a.price,
        category: a.category ?? null,
      })),

      giftMessage: giftMessage.trim(),
      quantity,
    })
    showToast(`${product.name} added to cart 🌸`, 'success')
  }

  const handleWishlistToggle = () => {
    toggle(buildWishlistSnapshot(product))
    showToast(
      isWishlisted(productId) ? 'Removed from wishlist' : 'Added to wishlist ♥',
      'info'
    )
  }

  const handleWriteReview = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      showToast('Please log in to write a review 🌸', 'info')
      navigate('/login', { state: { from: `/product/${id}` } })
      return
    }
    setShowReviewForm(true)
  }

  const accordionSections = [
    { key: 'lighting', title: '💡 Lighting', items: addons.lighting },
    { key: 'decorations', title: '🦋 Decorations', items: addons.decorations },
    { key: 'occasion', title: '🎉 Occasion Extras', items: addons.occasionExtras },
  ]

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.layout}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.mainImageWrap}>
              <img
                key={activeImage}
                src={product.images[activeImage]}
                alt={`${product.name} - view ${activeImage + 1}`}
                className={styles.mainImage}
              />
            </div>
            <div className={styles.thumbs}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.thumb} ${activeImage === i ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img} alt={`${product.name} thumbnail ${i + 1}`} className={styles.thumbImg} />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className={styles.details}>
            <nav className={styles.breadcrumb}>
              <Link to="/">Home</Link> &gt; <Link to="/shop">Shop</Link> &gt; {product.name}
            </nav>

            <h1 className={styles.title}>{product.name}</h1>

            <div className={styles.meta}>
              <span className={styles.typeBadge}>
                {product.type === 'Natural Flowers' ? '🌸 Natural' : '🎀 Hand-Ribbon'}
              </span>
              <div className={styles.rating}>
                <Star size={16} fill="var(--gold)" color="var(--gold)" />
                {product.rating} <a href="#reviews">({product.reviewCount} reviews)</a>
              </div>
            </div>

            {/* Size Selector */}
            <div className={styles.sizeSelector}>
              {['S', 'M', 'L'].map((s) => (
                <button
                  key={s}
                  className={`${styles.sizeCard} ${selectedSize === s ? styles.sizeSelected : ''}`}
                  onClick={() => setSelectedSize(s)}
                >
                  <span className={styles.sizeLabel}>{SIZE_LABELS[s]}</span>
                  <span>{product.sizes[s].flowers} flowers</span>
                  <strong>{formatPrice(
                    product.isOffer
                      ? getDiscountedPrice(product.sizes[s].price, product.offerDiscount)
                      : product.sizes[s].price
                  )}</strong>
                </button>
              ))}
            </div>

            {/* Attributes */}
            <div className={styles.attributes}>
              <div><span>Colors</span><strong>{product.colors.join(', ')}</strong></div>
              <div><span>Quality</span><strong>{product.quality}</strong></div>
              <div><span>Weight</span><strong>{product.weight}</strong></div>
              <div><span>Packing Material</span><strong>{product.packingMaterial}</strong></div>
              <div><span>Packing Cost</span><strong>{formatPrice(packingCost)}</strong></div>
            </div>

            {/* Wrapping */}
            <div className={styles.wrapping}>
              <h3>Wrapping Paper</h3>
              <label className={styles.surpriseCheck}>
                <input
                  type="checkbox"
                  checked={surpriseMe}
                  onChange={(e) => setSurpriseMe(e.target.checked)}
                />
                Surprise me — Let the florist choose
              </label>
              {!surpriseMe && (
                <div className={styles.wrappingSwatches}>
                  {product.wrappingOptions.map((w) => (
                    <button
                      key={w}
                      className={`${styles.wrappingSwatch} ${wrapping === w ? styles.wrappingActive : ''}`}
                      style={{ background: WRAPPING_COLORS[w] || '#F2A7BB' }}
                      onClick={() => setWrapping(w)}
                      title={w}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Add-ons Accordion */}
            <div className={styles.accordions}>
              {accordionSections.map((section) => (
                <div key={section.key} className={styles.accordion}>
                  <button
                    className={styles.accordionHeader}
                    onClick={() => setOpenAccordion(openAccordion === section.key ? '' : section.key)}
                  >
                    {section.title}
                    {openAccordion === section.key ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {openAccordion === section.key && (
                    <div className={styles.accordionBody}>
                      {section.items.map((item) => (
                        <label key={item.id} className={styles.addonItem}>
                          <input
                            type="checkbox"
                            checked={selectedAddons.some((a) => a.id === item.id)}
                            onChange={() => toggleAddon(item)}
                          />
                          <span>{item.name}</span>
                          <strong>{formatPrice(item.price)}</strong>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <textarea
              className={styles.giftMessage}
              placeholder="Add a personal message (optional)"
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              rows={3}
              maxLength={200}
            />

            {/* Quantity */}
            <div className={styles.qtyRow}>
              <span>Quantity</span>
              <div className={styles.qtyStepper}>
                <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className={styles.priceBreakdown}>
              <div><span>Product ({selectedSize})</span><span>{formatPrice(basePrice)}</span></div>
              <div><span>Packing Cost</span><span>{formatPrice(packingCost)}</span></div>
              <div><span>Add-Ons</span><span>{formatPrice(addonsTotal)}</span></div>
              {quantity > 1 && <div><span>Quantity</span><span>× {quantity}</span></div>}
              <div className={styles.divider} />
              <div className={styles.subtotalRow}>
                <span>Subtotal</span><strong>{formatPrice(subtotal)}</strong>
              </div>
              <p className={styles.shippingNote}>(Shipping calculated at checkout)</p>
            </div>

            <div className={`${styles.stock} ${outOfStock ? styles.preorder : styles.inStock}`}>
              {outOfStock ? '⏳ Pre-Order — Ready in 5 days' : '✓ In Stock'}
            </div>

            <button className={`btn-primary ${styles.addToCart}`} onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button className={`btn-outline ${styles.wishlistBtn}`} onClick={handleWishlistToggle}>
              <Heart size={18} fill={isWishlisted(productId) ? 'currentColor' : 'none'} />
              {isWishlisted(productId) ? 'In Wishlist' : 'Add to Wishlist'}
            </button>

            {outOfStock && (
              <p className={styles.waitingNote}>
                This size requires a 5-day crafting period. We'll notify you when your bouquet is ready.
              </p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs} id="reviews">
          <div className={styles.tabHeaders}>
            {['description', 'details', 'reviews', 'faq'].map((tab) => (
              <button
                key={tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'description' && (
              <p className={styles.description}>{product.description}</p>
            )}

            {activeTab === 'details' && (
              <div className={styles.detailsTab}>
                <h4>Flowers Included</h4>
                <ul>{product.flowers.map((f) => <li key={f}>{f}</li>)}</ul>
                <table className={styles.dimTable}>
                  <tbody>
                    <tr><td>Height</td><td>{product.dimensions?.height}</td></tr>
                    <tr><td>Width</td><td>{product.dimensions?.width}</td></tr>
                    <tr><td>Weight</td><td>{product.weight}</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className={styles.reviewsTab}>
                {productReviews.map((r) => (
                  <div key={r.id} className={styles.reviewItem}>
                    <div className={styles.reviewHeader}>
                      <strong>{r.author}</strong>
                      <span>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      <span className={styles.reviewDate}>{r.date}</span>
                    </div>
                    <p>{r.text}</p>
                    {r.verified && <span className={styles.verified}>✓ Verified Buyer</span>}
                  </div>
                ))}
                <button className="btn-outline" onClick={handleWriteReview}>Write a Review</button>
                {showReviewForm && (
                  <form
                    className={styles.reviewForm}
                    onSubmit={(e) => {
                      e.preventDefault()
                      showToast('Thank you for your review! 🌸', 'success')
                      setShowReviewForm(false)
                      setReviewText('')
                      setReviewRating(5)
                    }}
                  >
                    <div className={styles.starSelector}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} type="button" onClick={() => setReviewRating(s)}>
                          <Star size={24} fill={s <= reviewRating ? 'var(--gold)' : 'none'} color="var(--gold)" />
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience..."
                      required
                      rows={4}
                    />
                    <label className={styles.photoUpload}>
                      <input type="file" accept="image/*" />
                      Upload a photo (optional)
                    </label>
                    <button type="submit" className="btn-primary">Submit Review</button>
                  </form>
                )}
              </div>
            )}

            {activeTab === 'faq' && (
              <div className={styles.faqTab}>
                {product.faq?.length > 0 ? (
                  product.faq.map((item, i) => <FaqItem key={i} question={item.q} answer={item.a} />)
                ) : (
                  <p className={styles.description}>No FAQs available for this bouquet yet.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        <section className={styles.related}>
          <h2>You May Also Love</h2>
          <div className={styles.relatedGrid}>
            {related.map((p) => <ProductCard key={p._id || p.id} product={p} />)}
          </div>
        </section>
      </div>
    </div>
  )
}

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={styles.faqItem}>
      <button className={styles.faqQuestion} onClick={() => setOpen(!open)}>
        {question}
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {open && <p className={styles.faqAnswer}>{answer}</p>}
    </div>
  )
}