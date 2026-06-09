import { useState, useMemo } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { getDiscountedPrice } from '../data/products'
import { useStore } from '../context/StoreContext'
import FilterPanel from '../components/shop/FilterPanel'
import ProductCard from '../components/ui/ProductCard'
import styles from './ShopPage.module.css'

const SIZE_MAP = { Small: 'S', Medium: 'M', Large: 'L' }

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price Low–High' },
  { value: 'price-desc', label: 'Price High–Low' },
  { value: 'rating', label: 'Top Rated' },
]

const defaultFilters = {
  priceRange: [0, 15000],
  colors: [],
  sizes: [],
  types: [],
  occasions: [],
  inStock: false,
  preOrder: false,
  offersOnly: false,
}

export default function ShopPage() {
  const { activeProducts } = useStore()
  const [filters, setFilters] = useState(defaultFilters)
  const [sort, setSort] = useState('popular')
  const [mobileFilters, setMobileFilters] = useState(false)

  const filtered = useMemo(() => {
    let result = [...activeProducts]

    result = result.filter((p) => {
      const mPrice = p.sizes.M.price
      const price = p.isOffer ? getDiscountedPrice(mPrice, p.offerDiscount) : mPrice
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false
      if (filters.colors.length && !filters.colors.some((c) => p.colors.includes(c))) return false
      if (filters.sizes.length) {
        const hasSize = filters.sizes.some((s) => {
          const key = SIZE_MAP[s]
          return p.sizes[key] && (filters.inStock ? p.sizes[key].stock > 0 : true)
        })
        if (!hasSize) return false
      }
      if (filters.types.length && !filters.types.includes(p.type)) return false
      if (filters.occasions.length && !filters.occasions.some((o) => p.occasions.includes(o))) return false
      if (filters.inStock && !Object.values(p.sizes).some((s) => s.stock > 0)) return false
      if (filters.preOrder && !Object.values(p.sizes).some((s) => s.stock === 0)) return false
      if (filters.offersOnly && !p.isOffer) return false
      return true
    })

    switch (sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case 'price-asc':
        result.sort((a, b) => a.sizes.M.price - b.sizes.M.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.sizes.M.price - a.sizes.M.price)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      default:
        result.sort((a, b) => b.reviewCount - a.reviewCount)
    }

    return result
  }, [filters, sort, activeProducts])

  const activeChips = useMemo(() => {
    const chips = []
    if (filters.colors.length) filters.colors.forEach((c) => chips.push({ key: 'colors', value: c, label: c }))
    if (filters.sizes.length) filters.sizes.forEach((s) => chips.push({ key: 'sizes', value: s, label: s }))
    if (filters.types.length) filters.types.forEach((t) => chips.push({ key: 'types', value: t, label: t }))
    if (filters.occasions.length) filters.occasions.forEach((o) => chips.push({ key: 'occasions', value: o, label: o }))
    if (filters.offersOnly) chips.push({ key: 'offersOnly', value: true, label: 'Offers Only' })
    if (filters.inStock) chips.push({ key: 'inStock', value: true, label: 'In Stock' })
    if (filters.preOrder) chips.push({ key: 'preOrder', value: true, label: 'Pre-Order' })
    return chips
  }, [filters])

  const removeChip = (chip) => {
    if (chip.key === 'offersOnly' || chip.key === 'inStock' || chip.key === 'preOrder') {
      setFilters((prev) => ({ ...prev, [chip.key]: false }))
    } else {
      setFilters((prev) => ({
        ...prev,
        [chip.key]: prev[chip.key].filter((v) => v !== chip.value),
      }))
    }
  }

  return (
    <div className={styles.shop}>
      <div className="container">
        <div className={styles.header}>
          <h1>Shop Bouquets</h1>
          <p>Discover hand-crafted arrangements for every occasion</p>
        </div>

        <div className={styles.layout}>
          <div className={styles.sidebar}>
            <FilterPanel filters={filters} setFilters={setFilters} />
          </div>

          {mobileFilters && (
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              onClose={() => setMobileFilters(false)}
              isMobile
            />
          )}

          <div className={styles.main}>
            <div className={styles.sortBar}>
              <span className={styles.resultCount}>Showing {filtered.length} results</span>
              <div className={styles.sortControls}>
                <button
                  type="button"
                  className={styles.filterToggle}
                  onClick={() => setMobileFilters(true)}
                >
                  <SlidersHorizontal size={18} /> Filters
                </button>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className={styles.sortSelect}>
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeChips.length > 0 && (
              <div className={styles.chips}>
                {activeChips.map((chip) => (
                  <button key={`${chip.key}-${chip.value}`} type="button" className={styles.chip} onClick={() => removeChip(chip)}>
                    {chip.label} <X size={14} />
                  </button>
                ))}
              </div>
            )}

            <div className={styles.grid}>
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} showSizeSelector />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className={styles.empty}>
                <p>No bouquets match your filters 🌸</p>
                <button type="button" onClick={() => setFilters(defaultFilters)} className="btn-outline">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
