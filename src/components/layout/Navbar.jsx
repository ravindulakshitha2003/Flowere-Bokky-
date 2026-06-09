import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Heart, ShoppingBag, Menu, X, User, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import ThemeToggle from '../ui/ThemeToggle'
import styles from './Navbar.module.css'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { isLoggedIn, isAdmin, user, logout } = useAuth()
  const { itemCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleLogout = () => {
    logout()
    setDropdownOpen(false)
    navigate('/', { replace: true })
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <Link to="/" className={styles.logo}>
          Bloom & Bliss
        </Link>

        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive && !link.to.includes('#') ? styles.active : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <ThemeToggle />

          <Link to="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
            <Heart size={20} />
            {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
          </Link>

          <Link to="/cart" className={styles.iconBtn} aria-label="Cart">
            <ShoppingBag size={20} />
            {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
          </Link>

          {isLoggedIn ? (
            <div className={styles.dropdown}>
              <button
                className={styles.avatar}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Account menu"
              >
                {user?.name?.charAt(0) || 'U'}
              </button>
              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <Link to="/account" onClick={() => setDropdownOpen(false)}>
                    <User size={16} /> My Account
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setDropdownOpen(false)}>
                      <Shield size={16} /> Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={styles.loginBtn}>Login</Link>
          )}

          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileOpen : ''}`}>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={styles.mobileLink}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
        {!isLoggedIn && (
          <Link to="/login" className={styles.mobileLogin} onClick={() => setMenuOpen(false)}>
            Login
          </Link>
        )}
      </div>
    </header>
  )
}
