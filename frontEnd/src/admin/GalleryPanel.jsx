import { useState } from 'react'
import { Loader2 } from 'lucide-react'
// import { readFileAsBase64 } from './adminUtils'
import { MOCK_CUSTOMER_PHOTOS } from './adminConstants'

import { useToast } from '../context/ToastContext'
import ConfirmModal from './ConfirmModal'
import styles from './adminShared.module.css'
import dashStyles from '../pages/AdminDashboard.module.css'

export default function GalleryPanel() {
  const { galleryItems, addGalleryItem, updateGalleryItem, deleteGalleryItem } = useStore()
  const { showToast } = useToast()
  const [customerPhotos, setCustomerPhotos] = useState(MOCK_CUSTOMER_PHOTOS)
  const [tab, setTab] = useState('upload')
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: '', category: 'Our Work', occasionTag: 'General',
    bouquetType: 'Natural', isFeatured: false, isApproved: true, imageData: null,
  })
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterOccasion, setFilterOccasion] = useState('all')
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [hiddenOnly, setHiddenOnly] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [editForm, setEditForm] = useState({})

  const handleUpload = async () => {
    if (!form.title.trim() || !form.imageData) {
      showToast('Title and image are required', 'error')
      return
    }
    setUploading(true)
    await new Promise((r) => setTimeout(r, 600))
    const newItem = {
      id: `g-${Date.now()}`,
      title: form.title,
      occasion: form.occasionTag,
      type: form.bouquetType === 'Natural' ? 'Natural Flowers' : form.bouquetType === 'Hand-Ribbon' ? 'Hand-Ribbon' : 'Mixed',
      gradient: `linear-gradient(135deg, #F2A7BB, #FFD6E0)`,
      tab: form.category === 'Our Brand' ? 'brand' : 'work',
      ...form,
    }
    addGalleryItem(newItem)
    setForm({ title: '', category: 'Our Work', occasionTag: 'General', bouquetType: 'Natural', isFeatured: false, isApproved: true, imageData: null })
    setUploading(false)
    showToast('🖼️ Image added to gallery!', 'success')
  }

  const handleImageSelect = async (file) => {
    if (!file) return
    const base64 = await readFileAsBase64(file)
    setForm((f) => ({ ...f, imageData: base64 }))
  }

  const filtered = galleryItems.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false
    if (filterOccasion !== 'all' && item.occasionTag !== filterOccasion) return false
    if (featuredOnly && !item.isFeatured) return false
    if (hiddenOnly && item.isApproved) return false
    return true
  })

  const openEdit = (item) => {
    setEditTarget(item)
    setEditForm({ title: item.title, category: item.category, occasionTag: item.occasionTag, bouquetType: item.bouquetType })
  }

  const saveEdit = () => {
    updateGalleryItem(editTarget.id, { ...editForm, title: editForm.title })
    setEditTarget(null)
    showToast('Tags updated', 'success')
  }

  const approvePhoto = (photo) => {
    const newItem = {
      id: `g-${Date.now()}`,
      title: photo.title,
      occasion: 'Custom',
      type: 'Natural Flowers',
      gradient: photo.gradient,
      tab: 'work',
      category: 'Our Work',
      occasionTag: 'Custom',
      bouquetType: 'Natural',
      isFeatured: false,
      isApproved: true,
      imageData: photo.imageData,
    }
    addGalleryItem(newItem)
    setCustomerPhotos((prev) => prev.filter((p) => p.id !== photo.id))
    showToast('Photo approved and added to gallery', 'success')
  }

  return (
    <div>
      <h1>🖼️ Gallery Management</h1>

      <div className={styles.subTabs}>
        <button type="button" className={`${styles.subTab} ${tab === 'upload' ? styles.subTabActive : ''}`} onClick={() => setTab('upload')}>Upload New</button>
        <button type="button" className={`${styles.subTab} ${tab === 'manage' ? styles.subTabActive : ''}`} onClick={() => setTab('manage')}>Manage Gallery</button>
      </div>

      {tab === 'upload' && (
        <div className={styles.panelCard}>
          <label className={`${styles.uploadBox} ${styles.uploadBoxLarge}`}>
            {form.imageData ? (
              <>
                <img src={form.imageData} alt="" className={styles.uploadPreview} />
                <button type="button" className={styles.removeImage} onClick={(e) => { e.preventDefault(); setForm((f) => ({ ...f, imageData: null })) }}>×</button>
              </>
            ) : (
              <span>Drag &amp; drop or click to upload</span>
            )}
            <input type="file" accept="image/*" hidden onChange={(e) => handleImageSelect(e.target.files[0])} />
          </label>

          <div className={styles.formGrid} style={{ marginTop: 20 }}>
            <div className={styles.field}>
              <label>Image Title</label>
              <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className={styles.field}>
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                <option value="Our Work">Our Work</option>
                <option value="Our Brand">Our Brand</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Occasion Tag</label>
              <select value={form.occasionTag} onChange={(e) => setForm((f) => ({ ...f, occasionTag: e.target.value }))}>
                {['Birthday', 'Wedding', 'Anniversary', 'Custom', 'General'].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Bouquet Type</label>
              <select value={form.bouquetType} onChange={(e) => setForm((f) => ({ ...f, bouquetType: e.target.value }))}>
                {['Natural', 'Hand-Ribbon', 'Both', 'None'].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.toggleRow}>
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))} />
                <span className={styles.toggleSlider} /> Is Featured
              </label>
            </div>
            <div className={styles.field}>
              <label className={styles.toggleRow}>
                <input type="checkbox" checked={form.isApproved} onChange={(e) => setForm((f) => ({ ...f, isApproved: e.target.checked }))} />
                <span className={styles.toggleSlider} /> Is Approved
              </label>
            </div>
          </div>

          <button type="button" className="btn-primary" style={{ marginTop: 16 }} onClick={handleUpload} disabled={uploading}>
            {uploading ? <><Loader2 size={18} className={styles.spinner} /> Uploading...</> : 'Upload to Gallery'}
          </button>
        </div>
      )}

      {tab === 'manage' && (
        <>
          <div className={styles.filterBar}>
            <select className={styles.searchBar} style={{ maxWidth: 160 }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="Our Work">Our Work</option>
              <option value="Our Brand">Our Brand</option>
            </select>
            <select className={styles.searchBar} style={{ maxWidth: 160 }} value={filterOccasion} onChange={(e) => setFilterOccasion(e.target.value)}>
              <option value="all">All Occasions</option>
              {['Birthday', 'Wedding', 'Anniversary', 'Custom', 'General'].map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <button type="button" className={`${styles.filterChip} ${featuredOnly ? styles.filterChipActive : ''}`} onClick={() => setFeaturedOnly(!featuredOnly)}>Featured only</button>
            <button type="button" className={`${styles.filterChip} ${hiddenOnly ? styles.filterChipActive : ''}`} onClick={() => setHiddenOnly(!hiddenOnly)}>Hidden only</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {filtered.map((item) => (
              <div key={item.id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '4/5', background: item.gradient }}>
                {item.imageData && <img src={item.imageData} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(62,31,31,0.55)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 12, gap: 6, opacity: 0, transition: 'opacity 0.3s' }} className="gallery-admin-overlay">
                  <strong style={{ color: 'white', fontSize: 14 }}>{item.title}</strong>
                  <div className={styles.actionGroup}>
                    <button type="button" className={styles.iconBtn} onClick={() => openEdit(item)}>✏️ Edit Tags</button>
                    <button type="button" className={styles.iconBtn} onClick={() => { updateGalleryItem(item.id, { isApproved: !item.isApproved }); showToast(item.isApproved ? 'Hidden from public' : 'Now visible', 'info') }}>👁️</button>
                    <button type="button" className={styles.iconBtn} onClick={() => { updateGalleryItem(item.id, { isFeatured: !item.isFeatured }); showToast(item.isFeatured ? 'Unfeatured' : 'Featured!', 'success') }}>⭐</button>
                    <button type="button" className={styles.iconBtn} onClick={() => setDeleteTarget(item)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <style>{`.gallery-admin-overlay { opacity: 0 } div:hover > .gallery-admin-overlay { opacity: 1 !important }`}</style>

          <h2 style={{ marginTop: 40, marginBottom: 16, fontSize: 20 }}>Customer Submitted Photos</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {customerPhotos.map((photo) => (
              <div key={photo.id} style={{ width: 180, borderRadius: 12, overflow: 'hidden', background: 'white', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ height: 120, background: photo.gradient }} />
                <div style={{ padding: 12 }}>
                  <strong style={{ fontSize: 13, display: 'block' }}>{photo.title}</strong>
                  <span style={{ fontSize: 11, color: 'rgba(62,31,31,0.5)' }}>{photo.author}</span>
                  <div className={styles.actionGroup} style={{ marginTop: 8 }}>
                    <button type="button" className={dashStyles.actionBtn} onClick={() => approvePhoto(photo)}>✅ Approve</button>
                    <button type="button" className={styles.iconBtn} onClick={() => { setCustomerPhotos((prev) => prev.filter((p) => p.id !== photo.id)); showToast('Photo rejected', 'info') }}>❌ Reject</button>
                  </div>
                </div>
              </div>
            ))}
            {customerPhotos.length === 0 && <p style={{ color: 'rgba(62,31,31,0.5)' }}>No pending customer photos.</p>}
          </div>
        </>
      )}

      <ConfirmModal message={deleteTarget ? `Delete "${deleteTarget.title}"? This cannot be undone.` : ''} onConfirm={() => { deleteGalleryItem(deleteTarget.id); setDeleteTarget(null); showToast('Image deleted', 'info') }} onCancel={() => setDeleteTarget(null)} />

      {editTarget && (
        <div className={styles.modalOverlay} onClick={() => setEditTarget(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Edit Tags</h3>
            <div className={styles.field} style={{ marginBottom: 12 }}><label>Title</label><input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div className={styles.field} style={{ marginBottom: 12 }}><label>Category</label><select value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}><option value="Our Work">Our Work</option><option value="Our Brand">Our Brand</option></select></div>
            <div className={styles.field} style={{ marginBottom: 12 }}><label>Occasion</label><select value={editForm.occasionTag} onChange={(e) => setEditForm((f) => ({ ...f, occasionTag: e.target.value }))}>{['Birthday', 'Wedding', 'Anniversary', 'Custom', 'General'].map((o) => <option key={o} value={o}>{o}</option>)}</select></div>
            <div className={styles.field} style={{ marginBottom: 16 }}><label>Bouquet Type</label><select value={editForm.bouquetType} onChange={(e) => setEditForm((f) => ({ ...f, bouquetType: e.target.value }))}>{['Natural', 'Hand-Ribbon', 'Both', 'None'].map((o) => <option key={o} value={o}>{o}</option>)}</select></div>
            <div className={styles.modalActions}>
              <button type="button" className="btn-outline" onClick={() => setEditTarget(null)}>Cancel</button>
              <button type="button" className="btn-primary" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
