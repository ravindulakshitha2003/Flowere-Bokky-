import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { formatPrice } from '../utils/helpers'
import ConfirmModal from './ConfirmModal'

import { useToast } from '../context/ToastContext'
import styles from './adminShared.module.css'
import dashStyles from '../pages/AdminDashboard.module.css'

const EMPTY_ZONE = {
  name: '',
  minKm: 0,
  maxKm: 10,
  priceSmall: 150,
  priceMedium: 200,
  priceLarge: 300,
  active: true,
}

function normalizeZoneForm(form) {
  return {
    ...form,
    minKm: Number(form.minKm) || 0,
    maxKm: Number(form.maxKm) || 999,
    priceSmall: Number(form.priceSmall) || 0,
    priceMedium: Number(form.priceMedium) || 0,
    priceLarge: Number(form.priceLarge) || 0,
  }
}

export default function DeliveryPanel() {
  const {
    deliveryZones: zones,
    setDeliveryZones: setZones,
    deliverySlots: slots,
    setDeliverySlots: setSlots,
    deliveryRules: rules,
    setDeliveryRules: setRules,
  } = useStore()
  const { showToast } = useToast()
  const [editingZone, setEditingZone] = useState(null)
  const [editZoneForm, setEditZoneForm] = useState({})
  const [addingZone, setAddingZone] = useState(false)
  const [newZone, setNewZone] = useState(EMPTY_ZONE)
  const [savingSlots, setSavingSlots] = useState(false)
  const [savingRules, setSavingRules] = useState(false)
  const [deleteZoneId, setDeleteZoneId] = useState(null)

  const startEditZone = (zone) => {
    setEditingZone(zone.id)
    setEditZoneForm({ ...zone })
  }

  const saveZoneEdit = () => {
    const normalized = normalizeZoneForm(editZoneForm)
    setZones((prev) => prev.map((z) => (z.id === editingZone ? { ...z, ...normalized } : z)))
    setEditingZone(null)
    showToast('Zone updated', 'success')
  }

  const addZone = () => {
    if (!newZone.name.trim()) return
    setZones((prev) => [...prev, { id: `z-${Date.now()}`, ...normalizeZoneForm(newZone) }])
    setAddingZone(false)
    setNewZone(EMPTY_ZONE)
    showToast('Zone added', 'success')
  }

  const confirmDeleteZone = () => {
    setZones((prev) => prev.filter((z) => z.id !== deleteZoneId))
    setDeleteZoneId(null)
    showToast('Zone deleted', 'info')
  }

  const saveSlots = async () => {
    setSavingSlots(true)
    await new Promise((r) => setTimeout(r, 500))
    setSavingSlots(false)
    showToast('Delivery slot settings saved', 'success')
  }

  const saveRules = async () => {
    setSavingRules(true)
    await new Promise((r) => setTimeout(r, 500))
    setSavingRules(false)
    showToast('Delivery rules saved', 'success')
  }

  const renderPriceInputs = (form, setForm) => (
    <>
      <td><input type="number" value={form.priceSmall} onChange={(e) => setForm((f) => ({ ...f, priceSmall: e.target.value }))} className={dashStyles.stockInput} /></td>
      <td><input type="number" value={form.priceMedium} onChange={(e) => setForm((f) => ({ ...f, priceMedium: e.target.value }))} className={dashStyles.stockInput} /></td>
      <td><input type="number" value={form.priceLarge} onChange={(e) => setForm((f) => ({ ...f, priceLarge: e.target.value }))} className={dashStyles.stockInput} /></td>
    </>
  )

  return (
    <div>
      <h1>🚚 Delivery Settings</h1>

      <div className={styles.panelCard}>
        <h2 className={styles.sectionTitle}>Delivery Zones</h2>
        <table className={dashStyles.table}>
          <thead>
            <tr>
              <th>Zone Name</th>
              <th>Min KM</th>
              <th>Max KM</th>
              <th>Small (LKR)</th>
              <th>Medium (LKR)</th>
              <th>Large (LKR)</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone.id}>
                {editingZone === zone.id ? (
                  <>
                    <td><input value={editZoneForm.name} onChange={(e) => setEditZoneForm((f) => ({ ...f, name: e.target.value }))} className={dashStyles.stockInput} style={{ width: '100%' }} /></td>
                    <td><input type="number" value={editZoneForm.minKm} onChange={(e) => setEditZoneForm((f) => ({ ...f, minKm: e.target.value }))} className={dashStyles.stockInput} /></td>
                    <td><input type="number" value={editZoneForm.maxKm} onChange={(e) => setEditZoneForm((f) => ({ ...f, maxKm: e.target.value }))} className={dashStyles.stockInput} /></td>
                    {renderPriceInputs(editZoneForm, setEditZoneForm)}
                    <td>
                      <label className={styles.toggleRow}>
                        <input type="checkbox" checked={editZoneForm.active} onChange={(e) => setEditZoneForm((f) => ({ ...f, active: e.target.checked }))} />
                        <span className={styles.toggleSlider} />
                      </label>
                    </td>
                    <td>
                      <button type="button" className={dashStyles.actionBtn} onClick={saveZoneEdit}>✅ Save</button>
                      <button type="button" className={styles.iconBtn} onClick={() => setEditingZone(null)}>✗ Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{zone.name}</td>
                    <td>{zone.minKm}</td>
                    <td>{zone.maxKm >= 999 ? '30+' : zone.maxKm}</td>
                    <td>{formatPrice(zone.priceSmall)}</td>
                    <td>{formatPrice(zone.priceMedium)}</td>
                    <td>{formatPrice(zone.priceLarge)}</td>
                    <td>{zone.active ? '✅' : '—'}</td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button type="button" className={styles.iconBtn} onClick={() => startEditZone(zone)}>✏️ Edit</button>
                        <button type="button" className={styles.iconBtn} onClick={() => setZones((prev) => prev.map((z) => z.id === zone.id ? { ...z, active: !z.active } : z))}>Toggle</button>
                        <button type="button" className={styles.iconBtn} onClick={() => setDeleteZoneId(zone.id)}>🗑️</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {addingZone && (
              <tr>
                <td><input placeholder="Zone name" value={newZone.name} onChange={(e) => setNewZone((z) => ({ ...z, name: e.target.value }))} className={dashStyles.stockInput} /></td>
                <td><input type="number" value={newZone.minKm} onChange={(e) => setNewZone((z) => ({ ...z, minKm: Number(e.target.value) }))} className={dashStyles.stockInput} /></td>
                <td><input type="number" value={newZone.maxKm} onChange={(e) => setNewZone((z) => ({ ...z, maxKm: Number(e.target.value) }))} className={dashStyles.stockInput} /></td>
                {renderPriceInputs(newZone, setNewZone)}
                <td>✅</td>
                <td>
                  <button type="button" className={dashStyles.actionBtn} onClick={addZone}>Save</button>
                  <button type="button" className={styles.iconBtn} onClick={() => setAddingZone(false)}>Cancel</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {!addingZone && (
          <button type="button" className="btn-outline" style={{ marginTop: 16 }} onClick={() => setAddingZone(true)}>+ Add New Zone</button>
        )}
      </div>

      <div className={styles.panelCard}>
        <h2 className={styles.sectionTitle}>Delivery Time Slots</h2>
        {slots.map((slot, i) => (
          <div key={slot.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: 16, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--petal)' }}>
            <span style={{ fontSize: 24 }}>{slot.icon}</span>
            <div>
              <input value={slot.label} onChange={(e) => setSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, label: e.target.value } : s))} style={{ fontWeight: 600, border: 'none', background: 'transparent', fontSize: 15, width: '100%' }} />
              <span style={{ fontSize: 13, color: 'rgba(62,31,31,0.5)' }}>{slot.time}</span>
            </div>
            <div className={styles.field} style={{ margin: 0 }}>
              <label style={{ fontSize: 11 }}>Max orders</label>
              <input type="number" value={slot.maxOrders} min="1" onChange={(e) => setSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, maxOrders: Number(e.target.value) } : s))} className={dashStyles.stockInput} />
            </div>
            <label className={styles.toggleRow}>
              <input type="checkbox" checked={slot.active} onChange={(e) => setSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, active: e.target.checked } : s))} />
              <span className={styles.toggleSlider} />
            </label>
          </div>
        ))}
        <button type="button" className="btn-primary" style={{ marginTop: 16 }} onClick={saveSlots} disabled={savingSlots}>
          {savingSlots ? <><Loader2 size={18} className={styles.spinner} /> Saving...</> : 'Save Slot Settings'}
        </button>
      </div>

      <div className={styles.panelCard}>
        <h2 className={styles.sectionTitle}>Delivery Rules</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={rules.sameDayDelivery} onChange={(e) => setRules((r) => ({ ...r, sameDayDelivery: e.target.checked }))} />
            Same-day delivery available
          </label>
          <label className={styles.checkboxLabel} style={{ alignItems: 'center', gap: 12 }}>
            <input type="checkbox" checked={rules.freeDeliveryThreshold > 0} onChange={(e) => setRules((r) => ({ ...r, freeDeliveryThreshold: e.target.checked ? 5000 : 0 }))} />
            Minimum order value for free delivery — above LKR
            <input type="number" value={rules.freeDeliveryThreshold} onChange={(e) => setRules((r) => ({ ...r, freeDeliveryThreshold: Number(e.target.value) }))} className={dashStyles.stockInput} style={{ width: 100 }} />
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={rules.blockSundays} onChange={(e) => setRules((r) => ({ ...r, blockSundays: e.target.checked }))} />
            Delivery unavailable on Sundays
          </label>
          <label className={styles.checkboxLabel} style={{ alignItems: 'center', gap: 12 }}>
            <input type="checkbox" checked={rules.advanceBookingDays > 0} onChange={(e) => setRules((r) => ({ ...r, advanceBookingDays: e.target.checked ? 1 : 0 }))} />
            Advance booking required — minimum
            <input type="number" value={rules.advanceBookingDays} min="0" max="30" onChange={(e) => setRules((r) => ({ ...r, advanceBookingDays: Number(e.target.value) }))} className={dashStyles.stockInput} style={{ width: 60 }} />
            days notice
          </label>
        </div>
        <button type="button" className="btn-primary" style={{ marginTop: 20 }} onClick={saveRules} disabled={savingRules}>
          {savingRules ? <><Loader2 size={18} className={styles.spinner} /> Saving...</> : 'Save Delivery Rules'}
        </button>
      </div>

      {deleteZoneId && (
        <ConfirmModal
          message="Are you sure? This cannot be undone."
          onConfirm={confirmDeleteZone}
          onCancel={() => setDeleteZoneId(null)}
        />
      )}
    </div>
  )
}
