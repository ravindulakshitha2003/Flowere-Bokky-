import { X } from 'lucide-react'
import PriceRangeSlider from './PriceRangeSlider'
import styles from './FilterPanel.module.css'

const COLOR_OPTIONS = ['Red', 'Pink', 'White', 'Yellow', 'Purple', 'Orange', 'Mixed']
const COLOR_MAP = {
  Red: '#C2185B', Pink: '#F2A7BB', White: '#FFFDF8', Yellow: '#F9EDD3',
  Purple: '#9C27B0', Orange: '#FF9800', Mixed: 'linear-gradient(135deg, #F2A7BB, #7A9E7E)',
}
const SIZE_OPTIONS = ['Small', 'Medium', 'Large']
const OCCASION_OPTIONS = ['Birthday', 'Wedding', 'Anniversary', 'Graduation', 'Just Because', "Valentine's"]
const TYPE_OPTIONS = ['Natural Flowers', 'Hand-Ribbon']

export default function FilterPanel({ filters, setFilters, onClose, isMobile }) {
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const toggleArrayFilter = (key, value) => {
    setFilters((prev) => {
      const arr = prev[key]
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      }
    })
  }

  return (
    <aside className={`${styles.panel} ${isMobile ? styles.mobile : ''}`}>
      {isMobile && (
        <div className={styles.mobileHeader}>
          <h3>Filters</h3>
          <button onClick={onClose} aria-label="Close filters"><X size={20} /></button>
        </div>
      )}

      <div className={styles.section}>
        <h4>Price Range</h4>
        <PriceRangeSlider
          min={0}
          max={15000}
          value={filters.priceRange}
          onChange={(v) => updateFilter('priceRange', v)}
        />
      </div>

      <div className={styles.section}>
        <h4>Colors</h4>
        <div className={styles.colorSwatches}>
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              className={`${styles.swatch} ${filters.colors.includes(color) ? styles.swatchActive : ''}`}
              style={{ background: COLOR_MAP[color] }}
              onClick={() => toggleArrayFilter('colors', color)}
              aria-label={color}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h4>Size</h4>
        {SIZE_OPTIONS.map((size) => (
          <label key={size} className={styles.checkbox}>
            <input
              type="checkbox"
              checked={filters.sizes.includes(size)}
              onChange={() => toggleArrayFilter('sizes', size)}
            />
            {size}
          </label>
        ))}
      </div>

      <div className={styles.section}>
        <h4>Type</h4>
        <div className={styles.chips}>
          {TYPE_OPTIONS.map((type) => (
            <button
              key={type}
              className={`${styles.chip} ${filters.types.includes(type) ? styles.chipActive : ''}`}
              onClick={() => toggleArrayFilter('types', type)}
            >
              {type === 'Natural Flowers' ? '🌸 Natural' : '🎀 Hand-Ribbon'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h4>Occasion</h4>
        {OCCASION_OPTIONS.map((occ) => (
          <label key={occ} className={styles.checkbox}>
            <input
              type="checkbox"
              checked={filters.occasions.includes(occ)}
              onChange={() => toggleArrayFilter('occasions', occ)}
            />
            {occ}
          </label>
        ))}
      </div>

      <div className={styles.section}>
        <h4>Availability</h4>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => updateFilter('inStock', e.target.checked)}
          />
          <span className={styles.toggleSlider} />
          In Stock Only
        </label>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={filters.preOrder}
            onChange={(e) => updateFilter('preOrder', e.target.checked)}
          />
          <span className={styles.toggleSlider} />
          Pre-Order Available
        </label>
      </div>

      <div className={styles.section}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={filters.offersOnly}
            onChange={(e) => updateFilter('offersOnly', e.target.checked)}
          />
          <span className={styles.toggleSlider} />
          Offers Only
        </label>
      </div>
    </aside>
  )
}
