import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatPrice, getPasswordStrength } from '../utils/helpers'
import ThemeToggle from '../components/ui/ThemeToggle'
import styles from './AccountPage.module.css'

const API_BASE = 'http://localhost:3000'

const NAV = [
  { id: 'orders', label: '📦 My Orders', icon: '📦' },
  { id: 'profile', label: '👤 My Profile', icon: '👤' },
  { id: 'wishlist', label: '♥  My Wishlist', href: '/wishlist' },
]

const STATUS_CONFIG = {
  pending: { label: '⏳ Pending', tone: 'pending' },
  confirmed: { label: '🌸 Confirmed', tone: 'preparing' },
  preparing: { label: '🌸 Preparing', tone: 'preparing' },
  'in-progress': { label: '🌸 Preparing', tone: 'preparing' },
  out_for_delivery: { label: '🚚 On the Way', tone: 'delivering' },
  delivering: { label: '🚚 On the Way', tone: 'delivering' },
  completed: { label: '✅ Delivered', tone: 'delivered' },
  delivered: { label: '✅ Delivered', tone: 'delivered' },
  cancelled: { label: '❌ Cancelled', tone: 'cancelled' },
}

function getStatus(status) {
  return STATUS_CONFIG[status] || { label: status, tone: 'pending' }
}

// Safely extracts the user ID directly from JWT payload
function getUserIdFromToken(token) {
  if (!token) return null
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    const payload = JSON.parse(jsonPayload)
    return payload.id || payload._id || payload.userId || payload.sub || null
  } catch (err) {
    console.error('Failed to decode JWT token:', err)
    return null
  }
}

export default function AccountPage() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('orders')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  // Real backend order state
  const [orders, setOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [passwords, setPasswords] = useState({
    current: '',
    next: '',
    confirm: '',
  })

  // Fetch orders using JWT token decoding
  useEffect(() => {
    const fetchUserOrders = async () => {
      const token = localStorage.getItem('token')
      const decodedUserId = getUserIdFromToken(token) || user?.id || user?._id

      if (!token || !decodedUserId) {
        setLoadingOrders(false)
        return
      }

      try {
        setLoadingOrders(true)
        const res = await fetch(`${API_BASE}/api/orders?userId=${decodedUserId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error('Failed to fetch orders from server')
        }

        const data = await res.json()
        setOrders(data.orders || [])
      } catch (err) {
        console.error(err)
        showToast(err.message || 'Could not load your orders', 'error')
      } finally {
        setLoadingOrders(false)
      }
    }

    if (activeTab === 'orders') {
      fetchUserOrders()
    }
  }, [user, activeTab, showToast])

  const pendingCount = orders.filter(
    (o) => o.status === 'pending' || o.status === 'preparing' || o.status === 'confirmed'
  ).length
  const deliveredCount = orders.filter(
    (o) => o.status === 'delivered' || o.status === 'completed'
  ).length

  const pwdStrength = getPasswordStrength(passwords.next)

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const handleSaveProfile = () => {
    if (!profile.name.trim() || !profile.email.trim()) {
      showToast('Name and email are required', 'error')
      return
    }
    const updated = { ...user, ...profile }
    localStorage.setItem('bb_user', JSON.stringify(updated))
    showToast('Profile updated ✅', 'success')
    window.location.reload()
  }

  const handleUpdatePassword = () => {
    if (!passwords.current || !passwords.next || !passwords.confirm) {
      showToast('Please fill all password fields', 'error')
      return
    }
    if (passwords.next !== passwords.confirm) {
      showToast('New passwords do not match', 'error')
      return
    }
    if (passwords.next.length < 8) {
      showToast('Password must be at least 8 characters', 'error')
      return
    }
    showToast('Password updated ✅', 'success')
    setPasswords({ current: '', next: '', confirm: '' })
    setShowPassword(false)
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div className={styles.profileBrief}>
              <div className={styles.avatar}>{user?.name?.charAt(0) || 'U'}</div>
              <h2>{user?.name}</h2>
              <p>{user?.email}</p>
            </div>
            <div className={styles.divider} />
            <nav className={styles.sideNav}>
              {NAV.map((item) =>
                item.href ? (
                  <Link key={item.id} to={item.href} className={styles.sideLink}>
                    {item.label}
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.sideLink} ${activeTab === item.id ? styles.sideLinkActive : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    {item.label}
                  </button>
                )
              )}
            </nav>
            <div className={styles.sidebarActions}>
              <ThemeToggle />
              <button type="button" className={styles.logoutButton} onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </aside>

          <div className={styles.mobileTabs}>
            {NAV.filter((n) => !n.href).map((item) => (
              <button
                key={item.id}
                type="button"
                className={`${styles.mobileTab} ${activeTab === item.id ? styles.mobileTabActive : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            ))}
            <Link to="/wishlist" className={styles.mobileTab}>♥ Wishlist</Link>
          </div>

          <main className={styles.content}>
            {activeTab === 'orders' && (
              <>
                <h1 className={styles.contentTitle}>My Orders</h1>
                <div className={styles.summaryRow}>
                  <div className={styles.summaryCard}>
                    <span className={styles.summaryNum}>{orders.length}</span>
                    <span>Total Orders</span>
                  </div>
                  <div className={styles.summaryCard}>
                    <span className={styles.summaryNum}>{pendingCount}</span>
                    <span>Pending</span>
                  </div>
                  <div className={styles.summaryCard}>
                    <span className={styles.summaryNum}>{deliveredCount}</span>
                    <span>Delivered</span>
                  </div>
                </div>

                {loadingOrders ? (
                  <p className={styles.emptyOrders}>Loading your orders...</p>
                ) : orders.length === 0 ? (
                  <p className={styles.emptyOrders}>
                    No orders yet. <Link to="/shop">Start shopping →</Link>
                  </p>
                ) : (
                  <div className={styles.tableWrap}>
                    <table className={styles.ordersTable}>
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => {
                          const st = getStatus(order.status)
                          const firstItem = order.items?.[0]
                          const itemSummary = firstItem
                            ? `${firstItem.name} (${firstItem.size}) ${order.items.length > 1 ? `+${order.items.length - 1} more` : ''}`
                            : 'N/A'

                          return (
                            <tr key={order._id || order.orderId}>
                              <td>{order.orderId}</td>
                              <td>{new Date(order.placedAt || order.createdAt).toLocaleDateString('en-LK')}</td>
                              <td>{itemSummary}</td>
                              <td>{formatPrice(order.pricing?.total ?? 0)}</td>
                              <td>
                                <span className={`${styles.statusBadge} ${styles[`status_${st.tone}`]}`}>
                                  {st.label}
                                </span>
                              </td>
                              <td>
                                <div className={styles.rowActions}>
                                  <Link to={`/track/${order.orderId}`} className={styles.linkBtn}>
                                    Track Order
                                  </Link>
                                  <button
                                    type="button"
                                    className={styles.linkBtn}
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    View Details
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {activeTab === 'profile' && (
              <>
                <h1 className={styles.contentTitle}>My Profile</h1>
                <div className={styles.profileForm}>
                  <div className={styles.field}>
                    <label>Full Name</label>
                    <input
                      value={profile.name}
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Phone Number</label>
                    <input
                      value={profile.phone}
                      onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </div>

                  <button
                    type="button"
                    className={styles.collapseBtn}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '▼' : '▶'} Change Password
                  </button>

                  {showPassword && (
                    <div className={styles.passwordSection}>
                      <div className={styles.field}>
                        <label>Current Password</label>
                        <input
                          type="password"
                          value={passwords.current}
                          onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                        />
                      </div>
                      <div className={styles.field}>
                        <label>New Password</label>
                        <input
                          type="password"
                          value={passwords.next}
                          onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                        />
                        {passwords.next && (
                          <div className={styles.strengthBar}>
                            <div
                              className={styles.strengthFill}
                              style={{ width: `${pwdStrength.level}%`, background: pwdStrength.color }}
                            />
                          </div>
                        )}
                      </div>
                      <div className={styles.field}>
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                        />
                      </div>
                      <button type="button" className="btn-outline" onClick={handleUpdatePassword}>
                        Update Password
                      </button>
                    </div>
                  )}

                  <button type="button" className="btn-primary" onClick={handleSaveProfile}>
                    Save Profile Changes
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Order Details</h2>
            <div className={styles.modalGrid}>
              <div><span>Order ID</span><strong>{selectedOrder.orderId}</strong></div>
              <div>
                <span>Date</span>
                <strong>{new Date(selectedOrder.placedAt || selectedOrder.createdAt).toLocaleString('en-LK')}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{getStatus(selectedOrder.status).label}</strong>
              </div>
            </div>
            <h3>Items</h3>
            {selectedOrder.items?.map((it, idx) => (
              <div key={idx} className={styles.modalItem}>
                <strong>{it.name}</strong>
                <span>Size: {it.sizeLabel || it.size}</span>
                <span>Qty: {it.quantity}</span>
                <span>{formatPrice(it.lineTotal || (it.unitPrice * it.quantity))}</span>
              </div>
            ))}
            <h3>Delivery</h3>
            <p className={styles.modalText}>
              Address: {selectedOrder.delivery?.address}<br />
              Slot: {selectedOrder.delivery?.slotLabel || 'Standard'} · {selectedOrder.delivery?.date}
            </p>
            <div className={styles.modalTotals}>
              <div><span>Shipping</span><span>{formatPrice(selectedOrder.pricing?.shippingCost ?? 0)}</span></div>
              <div><span>Total</span><strong>{formatPrice(selectedOrder.pricing?.total ?? 0)}</strong></div>
              <div><span>Payment</span><span>{selectedOrder.payment?.method === 'cod' ? 'Cash on Delivery' : 'Card'}</span></div>
            </div>
            <div className={styles.modalActions}>
              <button type="button" className="btn-outline" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
              <Link
                to={`/track/${selectedOrder.orderId}`}
                className="btn-primary"
                onClick={() => setSelectedOrder(null)}
              >
                Track This Order
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}