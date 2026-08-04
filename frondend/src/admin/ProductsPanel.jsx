import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { OCCASIONS, COLOR_OPTIONS, COLOR_MAP, ADMIN_ADDONS, DEFAULT_WRAPPING_PAPERS } from './adminConstants'
import { useStore } from '../context/StoreContext'
import { useToast } from '../context/ToastContext'
import { createEmptyProduct } from './adminUtils'
import { readFileAsBase64 } from './adminUtils'
import ConfirmModal from './ConfirmModal'
import { getGradientForProduct } from '../utils/helpers'
import styles from './adminShared.module.css'

const SIZE_KEYS = [
  { key: 'S', label: 'Small' },
  { key: 'M', label: 'Medium' },
  { key: 'L', label: 'Large' },
]

export default function ProductsPanel() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore()
  const { showToast } = useToast()
  const [wrappingPapers, setWrappingPapers] = useState(DEFAULT_WRAPPING_PAPERS)
  const [tab, setTab] = useState('add')
  const [form, setForm] = useState(createEmptyProduct())
  const [editingId, setEditingId] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [wrapModal, setWrapModal] = useState(false)
  const [newWrap, setNewWrap] = useState({ name: '', hex: '#F2A7BB', price: 0 })

  const isEditing = Boolean(editingId)

  const resetForm = () => {
    setForm(createEmptyProduct())
    setEditingId(null)
    setErrors({})
    setTab('add')
  }

  const loadForEdit = (product) => {
    setForm(JSON.parse(JSON.stringify(product)))
    setEditingId(product.id)
    setTab('add')
    setErrors({})
  }

  const updateForm = (key, value) => setForm((p) => ({ ...p, [key]: value }))

  const toggleArray = (key, value) => {
    setForm((p) => {
      const arr = p[key] || []
      return {
        ...p,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      }
    })
  }

  const updateSize = (sizeKey, field, value) => {
    setForm((p) => ({
      ...p,
      sizes: {
        ...p.sizes,
        [sizeKey]: { ...p.sizes[sizeKey], [field]: field === 'price' || field === 'flowers' || field === 'stock' ? Number(value) || 0 : value },
      },
    }))
  }

  const updateSizeMeta = (sizeKey, field, value) => {
    setForm((p) => ({
      ...p,
      sizeMeta: {
        ...p.sizeMeta,
        [sizeKey]: { ...p.sizeMeta[sizeKey], [field]: field === 'waitingDays' ? Number(value) || 1 : value },
      },
    }))
  }

  const handleImage = async (file, target, index = null) => {
    if (!file) return
    const base64 = await readFileAsBase64(file)
    if (target === 'main') {
      setForm((p) => ({ ...p, imageData: { ...p.imageData, main: base64 } }))
    } else {
      setForm((p) => {
        const additional = [...p.imageData.additional]
        additional[index] = base64
        return { ...p, imageData: { ...p.imageData, additional } }
      })
    }
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Product name is required'
    if (!form.shortDescription.trim()) errs.shortDescription = 'Short description is required'
    if (!form.fullDescription.trim()) errs.fullDescription = 'Full description is required'
    if (!form.packingMaterial.trim()) errs.packingMaterial = 'Packing material is required'
    SIZE_KEYS.forEach(({ key }) => {
      if (form.sizeMeta[key]?.active && form.sizes[key].price <= 0) {
        errs[`price_${key}`] = `${key} price must be greater than 0`
      }
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))

    const productData = {
      ...form,
      description: form.fullDescription,
      quality: `${form.qualityGrade} Grade`,
      weight: `${form.weightGrams} g`,
      id: editingId || `bb-${Date.now()}`,
      createdAt: form.createdAt || new Date().toISOString().split('T')[0],
    }

    if (editingId) {
      updateProduct(editingId, productData)
      showToast('Product updated successfully! 🌸', 'success')
    } else {
      addProduct(productData)
      showToast('🌸 New bouquet added successfully!', 'success')
      resetForm()
    }
    setSaving(false)
    if (editingId) resetForm()
  }

  const handleDelete = () => {
    deleteProduct(deleteTarget.id)
    showToast('Product deleted', 'info')
    setDeleteTarget(null)
  }

  const addWrappingPaper = () => {
    if (!newWrap.name.trim()) return
    const paper = { id: `wr-${Date.now()}`, ...newWrap, price: Number(newWrap.price) || 0 }
    setWrappingPapers((prev) => [...prev, paper])
    setForm((p) => ({ ...p, wrappingOptions: [...p.wrappingOptions, paper.name] }))
    setWrapModal(false)
    setNewWrap({ name: '', hex: '#F2A7BB', price: 0 })
    showToast('Wrapping paper added', 'success')
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1>🌸 Products</h1>

      <div className={styles.subTabs}>
        <button type="button" className={`${styles.subTab} ${tab === 'add' ? styles.subTabActive : ''}`} onClick={() => setTab('add')}>
          {isEditing ? 'Edit Bouquet' : 'Add New Bouquet'}
        </button>
        <button type="button" className={`${styles.subTab} ${tab === 'manage' ? styles.subTabActive : ''}`} onClick={() => { setTab('manage'); resetForm() }}>
          Manage Products
        </button>
      </div>

      {tab === 'add' && (
        <div>
          {/* Section 1 */}
          <div className={styles.panelCard}>
            <h2 className={styles.sectionTitle}>Basic Info</h2>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Product Name *</label>
                <input value={form.name} onChange={(e) => updateForm('name', e.target.value)} />
                {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
              </div>
              <div className={styles.field}>
                <label>Product Type</label>
                <div className={styles.radioGroup}>
                  {['Natural Flowers', 'Hand-Ribbon'].map((t) => (
                    <label key={t} className={styles.radioLabel}>
                      <input type="radio" name="type" checked={form.type === t} onChange={() => updateForm('type', t)} />
                      {t === 'Hand-Ribbon' ? 'Hand-Ribbon Flowers' : t}
                    </label>
                  ))}
                </div>
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label>Occasion Tags</label>
                <div className={styles.checkboxGrid}>
                  {OCCASIONS.map((o) => (
                    <label key={o} className={styles.checkboxLabel}>
                      <input type="checkbox" checked={form.occasions.includes(o)} onChange={() => toggleArray('occasions', o)} />
                      {o}
                    </label>
                  ))}
                </div>
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label>Short Description * (max 200)</label>
                <textarea rows={2} maxLength={200} value={form.shortDescription} onChange={(e) => updateForm('shortDescription', e.target.value)} />
                <span className={styles.charCount}>{form.shortDescription.length}/200</span>
                {errors.shortDescription && <span className={styles.fieldError}>{errors.shortDescription}</span>}
              </div>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label>Full Description * (max 600)</label>
                <textarea rows={4} maxLength={600} value={form.fullDescription} onChange={(e) => updateForm('fullDescription', e.target.value)} />
                <span className={styles.charCount}>{form.fullDescription.length}/600</span>
                {errors.fullDescription && <span className={styles.fieldError}>{errors.fullDescription}</span>}
              </div>
              <div className={styles.field}>
                <label className={styles.toggleRow}>
                  <input type="checkbox" checked={form.isActive} onChange={(e) => updateForm('isActive', e.target.checked)} />
                  <span className={styles.toggleSlider} />
                  Is Active (show in shop)
                </label>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className={styles.panelCard}>
            <h2 className={styles.sectionTitle}>Sizes &amp; Pricing</h2>
            <table className={styles.sizeTable}>
              <thead>
                <tr>
                  <th>Size</th><th>Price (LKR)</th><th>Flowers</th><th>Stock</th><th>Waiting Days</th><th>Active</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_KEYS.map(({ key, label }) => (
                  <tr key={key}>
                    <td>{label}</td>
                    <td>
                      <input type="number" value={form.sizes[key].price} onChange={(e) => updateSize(key, 'price', e.target.value)} />
                      {errors[`price_${key}`] && <span className={styles.fieldError}>{errors[`price_${key}`]}</span>}
                    </td>
                    <td><input type="number" value={form.sizes[key].flowers} onChange={(e) => updateSize(key, 'flowers', e.target.value)} /></td>
                    <td><input type="number" value={form.sizes[key].stock} onChange={(e) => updateSize(key, 'stock', e.target.value)} min="0" /></td>
                    <td><input type="number" value={form.sizeMeta[key].waitingDays} onChange={(e) => updateSizeMeta(key, 'waitingDays', e.target.value)} min="1" max="30" /></td>
                    <td>
                      <label className={styles.toggleRow}>
                        <input type="checkbox" checked={form.sizeMeta[key].active} onChange={(e) => updateSizeMeta(key, 'active', e.target.checked)} />
                        <span className={styles.toggleSlider} />
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3 */}
          <div className={styles.panelCard}>
            <h2 className={styles.sectionTitle}>Product Attributes</h2>
            <div className={styles.formGrid}>
              <div className={`${styles.field} ${styles.fieldFull}`}>
                <label>Colors Available</label>
                <div className={styles.colorSwatches}>
                  {COLOR_OPTIONS.map((c) => (
                    <button key={c} type="button" className={`${styles.colorSwatch} ${form.colors.includes(c) ? styles.colorSwatchActive : ''}`} style={{ background: COLOR_MAP[c] }} title={c} onClick={() => toggleArray('colors', c)} />
                  ))}
                </div>
              </div>
              <div className={styles.field}>
                <label>Quality Grade</label>
                <select value={form.qualityGrade} onChange={(e) => updateForm('qualityGrade', e.target.value)}>
                  <option value="Premium">Premium</option>
                  <option value="Standard">Standard</option>
                  <option value="Budget">Budget</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Weight (grams)</label>
                <input type="number" value={form.weightGrams} onChange={(e) => updateForm('weightGrams', Number(e.target.value))} />
              </div>
              <div className={styles.field}>
                <label>Packing Material *</label>
                <input value={form.packingMaterial} onChange={(e) => updateForm('packingMaterial', e.target.value)} placeholder="e.g. Kraft paper" />
                {errors.packingMaterial && <span className={styles.fieldError}>{errors.packingMaterial}</span>}
              </div>
              <div className={styles.field}>
                <label>Packing Cost (LKR)</label>
                <input type="number" value={form.packingCost} onChange={(e) => updateForm('packingCost', Number(e.target.value))} />
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className={styles.panelCard}>
            <h2 className={styles.sectionTitle}>Add-Ons Available</h2>
            <div className={styles.checkboxGrid}>
              {ADMIN_ADDONS.map((addon) => (
                <label key={addon.id} className={styles.checkboxLabel}>
                  <input type="checkbox" checked={form.availableAddons.includes(addon.id)} onChange={() => toggleArray('availableAddons', addon.id)} />
                  {addon.name} (+LKR {addon.price})
                </label>
              ))}
            </div>
          </div>

          {/* Section 5 */}
          <div className={styles.panelCard}>
            <h2 className={styles.sectionTitle}>Wrapping Papers</h2>
            <div className={styles.colorSwatches}>
              {wrappingPapers.map((w) => (
                <button key={w.id} type="button" title={`${w.name} — LKR ${w.price}`} className={`${styles.wrappingSwatch} ${form.wrappingOptions.includes(w.name) ? styles.wrappingSwatchActive : ''}`} style={{ background: w.hex }} onClick={() => toggleArray('wrappingOptions', w.name)} />
              ))}
            </div>
            <button type="button" className="btn-outline" style={{ marginTop: 12 }} onClick={() => setWrapModal(true)}>+ Add New Wrapping Paper</button>
          </div>

          {/* Section 6 */}
          <div className={styles.panelCard}>
            <h2 className={styles.sectionTitle}>Product Images</h2>
            <label className={`${styles.uploadBox} ${styles.uploadBoxLarge}`}>
              {form.imageData.main ? (
                <>
                  <img src={form.imageData.main} alt="" className={styles.uploadPreview} />
                  <button type="button" className={styles.removeImage} onClick={(e) => { e.preventDefault(); setForm((p) => ({ ...p, imageData: { ...p.imageData, main: null } })) }}>×</button>
                </>
              ) : (
                <span>Main Image — drag &amp; drop or click</span>
              )}
              <input type="file" accept="image/*" hidden onChange={(e) => handleImage(e.target.files[0], 'main')} />
            </label>
            <div className={styles.uploadRow} style={{ marginTop: 12 }}>
              {form.imageData.additional.map((img, i) => (
                <label key={i} className={styles.uploadBox}>
                  {img ? (
                    <>
                      <img src={img} alt="" className={styles.uploadPreview} />
                      <button type="button" className={styles.removeImage} onClick={(e) => { e.preventDefault(); setForm((p) => { const a = [...p.imageData.additional]; a[i] = null; return { ...p, imageData: { ...p.imageData, additional: a } } }) }}>×</button>
                    </>
                  ) : (
                    <span>+ Image {i + 1}</span>
                  )}
                  <input type="file" accept="image/*" hidden onChange={(e) => handleImage(e.target.files[0], 'extra', i)} />
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 size={18} className={styles.spinner} /> Saving...</> : isEditing ? 'Update Product' : 'Save Product'}
            </button>
            {(isEditing || form.name) && (
              <button type="button" className="btn-outline" onClick={resetForm}>Cancel</button>
            )}
          </div>
        </div>
      )}

      {tab === 'manage' && (
        <div className={styles.panelCard}>
          <input className={styles.searchBar} placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <table className={styles.sizeTable}>
            <thead>
              <tr><th>Image</th><th>Name</th><th>Type</th><th>Sizes</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const totalStock = Object.values(p.sizes).reduce((s, sz) => s + sz.stock, 0)
                const activeSizes = Object.entries(p.sizeMeta || {}).filter(([, m]) => m.active).map(([k]) => k).join(', ')
                return (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.thumbCell} style={!p.imageData?.main ? { background: getGradientForProduct(p.id) } : undefined}>
                        {p.imageData?.main && <img src={p.imageData.main} alt="" />}
                      </div>
                    </td>
                    <td>{p.name}</td>
                    <td>{p.type === 'Natural Flowers' ? '🌸 Natural' : '🎀 Hand-Ribbon'}</td>
                    <td>{activeSizes || 'S, M, L'}</td>
                    <td>{totalStock}</td>
                    <td>{p.isActive ? <span style={{ color: 'var(--sage)' }}>Active</span> : <span style={{ color: 'var(--rose-deep)' }}>Hidden</span>}</td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button type="button" className={styles.iconBtn} onClick={() => loadForEdit(p)}>✏️ Edit</button>
                        <button type="button" className={styles.iconBtn} onClick={() => { updateProduct(p.id, { isActive: !p.isActive }); showToast(p.isActive ? 'Product hidden' : 'Product activated', 'info') }}>👁️ Toggle</button>
                        <button type="button" className={styles.iconBtn} onClick={() => setDeleteTarget(p)}>🗑️ Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        message={deleteTarget ? `Delete "${deleteTarget.name}"? This cannot be undone.` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {wrapModal && (
        <div className={styles.modalOverlay} onClick={() => setWrapModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Add Wrapping Paper</h3>
            <div className={styles.field} style={{ marginBottom: 12 }}>
              <label>Name</label>
              <input value={newWrap.name} onChange={(e) => setNewWrap((w) => ({ ...w, name: e.target.value }))} placeholder="Rustic Kraft" />
            </div>
            <div className={styles.field} style={{ marginBottom: 12 }}>
              <label>Color</label>
              <input type="color" value={newWrap.hex} onChange={(e) => setNewWrap((w) => ({ ...w, hex: e.target.value }))} />
            </div>
            <div className={styles.field} style={{ marginBottom: 16 }}>
              <label>Price (LKR)</label>
              <input type="number" value={newWrap.price} onChange={(e) => setNewWrap((w) => ({ ...w, price: e.target.value }))} />
            </div>
            <div className={styles.modalActions}>
              <button type="button" className="btn-outline" onClick={() => setWrapModal(false)}>Cancel</button>
              <button type="button" className="btn-primary" onClick={addWrappingPaper}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
