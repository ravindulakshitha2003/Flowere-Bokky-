import { useState } from 'react'
import { getStockStatus } from './adminUtils'
import { formatPrice } from '../utils/helpers'
import { useStore } from '../context/StoreContext'
import { useToast } from '../context/ToastContext'
import styles from './adminShared.module.css'
import dashStyles from '../pages/AdminDashboard.module.css'

const SIZE_LABELS = { S: 'Small', M: 'Medium', L: 'Large' }

export default function InventoryPanel() {
  const { products, updateStock, updateProduct } = useStore()
  const { showToast } = useToast()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [bulkModal, setBulkModal] = useState(false)
  const [bulkForm, setBulkForm] = useState({ productId: '', size: 'M', qty: 0, note: '' })
  const [pendingUpdates, setPendingUpdates] = useState({})

  const rows = products.flatMap((p) =>
    ['S', 'M', 'L'].map((size) => ({
      productId: p.id,
      productName: p.name,
      size,
      stock: p.sizes[size]?.stock ?? 0,
      waitingDays: p.sizeMeta?.[size]?.waitingDays ?? 1,
      price: p.sizes[size]?.price ?? 0,
      active: p.sizeMeta?.[size]?.active !== false,
    }))
  )

  const filteredRows = rows.filter((row) => {
    if (!row.active) return false
    const status = getStockStatus(row.stock)
    if (filter === 'in' && !['in', 'well'].includes(status.key)) return false
    if (filter !== 'all' && filter !== 'in' && status.key !== filter) return false
    if (search && !row.productName.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const outCount = rows.filter((r) => r.active && r.stock === 0).length
  const lowCount = rows.filter((r) => r.active && r.stock > 0 && r.stock < 5).length
  const totalValue = rows.reduce((sum, r) => sum + r.stock * r.price, 0)

  const updateWaiting = (productId, size, days) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return
    updateProduct(productId, {
      sizeMeta: {
        ...product.sizeMeta,
        [size]: {
          ...product.sizeMeta?.[size],
          waitingDays: Math.min(30, Math.max(1, days)),
        },
      },
    })
  }

  const getPendingKey = (productId, size) => `${productId}-${size}`

  const handleSaveRow = (row) => {
    const key = getPendingKey(row.productId, row.size)
    const pending = pendingUpdates[key]
    if (pending?.stock !== undefined) updateStock(row.productId, row.size, pending.stock)
    if (pending?.waitingDays !== undefined) updateWaiting(row.productId, row.size, pending.waitingDays)
    setPendingUpdates((prev) => { const n = { ...prev }; delete n[key]; return n })
    showToast('Stock updated ✅', 'success')
  }

  const handleBulkAdd = () => {
    if (!bulkForm.productId || bulkForm.qty <= 0) return
    const current = products.find((p) => p.id === bulkForm.productId)?.sizes[bulkForm.size]?.stock ?? 0
    updateStock(bulkForm.productId, bulkForm.size, current + Number(bulkForm.qty))
    showToast(`Added ${bulkForm.qty} units`, 'success')
    setBulkModal(false)
    setBulkForm({ productId: '', size: 'M', qty: 0, note: '' })
  }

  return (
    <div>
      <h1>📊 Inventory &amp; Stock Management</h1>

      {(outCount > 0 || lowCount > 0) && (
        <button
          type="button"
          className={`${styles.alertBanner} ${lowCount > 0 ? styles.alertBannerUrgent : ''}`}
          onClick={() => setFilter('low')}
        >
          ⚠️ {lowCount + outCount} product size{lowCount + outCount !== 1 ? 's are' : ' is'} running low on stock
        </button>
      )}

      <div className={dashStyles.statGrid}>
        <div className={dashStyles.statCard}>
          <span className={dashStyles.statLabel}>Total Products</span>
          <span className={dashStyles.statValue}>{products.length}</span>
        </div>
        <div className={dashStyles.statCard}>
          <span className={dashStyles.statLabel}>Out of Stock</span>
          <span className={`${dashStyles.statValue} ${outCount > 0 ? dashStyles.warning : ''}`}>{outCount}</span>
        </div>
        <div className={dashStyles.statCard}>
          <span className={dashStyles.statLabel}>Low Stock</span>
          <span className={`${dashStyles.statValue} ${lowCount > 0 ? dashStyles.warning : ''}`}>{lowCount}</span>
        </div>
        <div className={dashStyles.statCard}>
          <span className={dashStyles.statLabel}>Total Stock Value</span>
          <span className={dashStyles.statValue} style={{ fontSize: 22 }}>{formatPrice(totalValue)}</span>
        </div>
      </div>

      <div className={styles.filterBar}>
        {[
          { key: 'all', label: 'All' },
          { key: 'out', label: 'Out of Stock' },
          { key: 'low', label: 'Low Stock' },
          { key: 'in', label: 'In Stock' },
        ].map((f) => (
          <button key={f.key} type="button" className={`${styles.filterChip} ${filter === f.key ? styles.filterChipActive : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
        <button type="button" className="btn-outline" style={{ marginLeft: 'auto' }} onClick={() => setBulkModal(true)}>📥 Add Stock</button>
      </div>

      <input className={styles.searchBar} placeholder="Search by product name..." value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className={styles.panelCard} style={{ padding: 0, overflow: 'hidden' }}>
        <table className={dashStyles.table}>
          <thead>
            <tr>
              <th>Product</th><th>Size</th><th>Current Stock</th><th>Waiting Days</th><th>Status</th><th>Quick Update</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const key = getPendingKey(row.productId, row.size)
              const pending = pendingUpdates[key] || {}
              const stockVal = pending.stock ?? row.stock
              const waitVal = pending.waitingDays ?? row.waitingDays
              const status = getStockStatus(stockVal)

              return (
                <tr key={key}>
                  <td>{row.productName}</td>
                  <td>{SIZE_LABELS[row.size]}</td>
                  <td>{stockVal}</td>
                  <td>
                    <input
                      type="number"
                      className={dashStyles.stockInput}
                      value={waitVal}
                      min="1"
                      max="30"
                      onChange={(e) => setPendingUpdates((prev) => ({ ...prev, [key]: { ...prev[key], waitingDays: Number(e.target.value) } }))}
                    />
                  </td>
                  <td><span>{status.emoji} {status.label}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <button type="button" className={styles.iconBtn} onClick={() => setPendingUpdates((prev) => ({ ...prev, [key]: { ...prev[key], stock: Math.max(0, stockVal - 1) } }))}>−</button>
                      <input
                        type="number"
                        className={dashStyles.stockInput}
                        value={stockVal}
                        min="0"
                        onChange={(e) => setPendingUpdates((prev) => ({ ...prev, [key]: { ...prev[key], stock: Number(e.target.value) } }))}
                      />
                      <button type="button" className={styles.iconBtn} onClick={() => setPendingUpdates((prev) => ({ ...prev, [key]: { ...prev[key], stock: stockVal + 1 } }))}>+</button>
                      <button type="button" className={dashStyles.actionBtn} onClick={() => handleSaveRow(row)}>Save</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {bulkModal && (
        <div className={styles.modalOverlay} onClick={() => setBulkModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>📥 Bulk Stock Update</h3>
            <div className={styles.field} style={{ marginBottom: 12 }}>
              <label>Product</label>
              <select value={bulkForm.productId} onChange={(e) => setBulkForm((f) => ({ ...f, productId: e.target.value }))}>
                <option value="">Select product</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className={styles.field} style={{ marginBottom: 12 }}>
              <label>Size</label>
              <select value={bulkForm.size} onChange={(e) => setBulkForm((f) => ({ ...f, size: e.target.value }))}>
                <option value="S">Small</option>
                <option value="M">Medium</option>
                <option value="L">Large</option>
              </select>
            </div>
            <div className={styles.field} style={{ marginBottom: 12 }}>
              <label>Add Quantity</label>
              <input type="number" min="1" value={bulkForm.qty} onChange={(e) => setBulkForm((f) => ({ ...f, qty: Number(e.target.value) }))} />
            </div>
            <div className={styles.field} style={{ marginBottom: 16 }}>
              <label>Note (optional)</label>
              <input value={bulkForm.note} onChange={(e) => setBulkForm((f) => ({ ...f, note: e.target.value }))} placeholder="New delivery" />
            </div>
            <div className={styles.modalActions}>
              <button type="button" className="btn-outline" onClick={() => setBulkModal(false)}>Cancel</button>
              <button type="button" className="btn-primary" onClick={handleBulkAdd}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
