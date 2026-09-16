import { Routes, Route } from 'react-router-dom'
import { useFestival } from '../../context/FestivalContext'
import FestivalParticles from '../ui/FestivalParticles'
import Layout from './Layout'
import ProtectedRoute from '../auth/ProtectedRoute'
import HomePage from '../../pages/HomePage'
import ShopPage from '../../pages/ShopPage'
import ProductDetailPage from '../../pages/ProductDetailPage.jsx'
import GalleryPage from '../../pages/GalleryPage'
import CartPage from '../../pages/CartPage'
import WishlistPage from '../../pages/WishlistPage'
import CheckoutPage from '../../pages/CheckoutPage'
import OrderTrackingPage from '../../pages/OrderTrackingPage'
import LoginPage from '../../pages/LoginPage'
import RegisterPage from '../../pages/RegisterPage'
import AccountPage from '../../pages/AccountPage'
import AdminDashboard from '../../pages/AdminDashboard'

export default function AppShell() {
  const { festivalMode } = useFestival()

  return (
    <>
      <FestivalParticles mode={festivalMode} />
      <div className="app-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route element={<Layout />}>
           <Route path="shop" element={<ShopPage />} />
            <Route path="product/:id" element={<ProductDetailPage />} />
            <Route path="gallery" element={<GalleryPage />} />
             <Route index element={<HomePage />} />
          
            
           
           
            
            <Route path="cart" element={<CartPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route
              path="checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route path="track/:orderId" element={<OrderTrackingPage />} />
            <Route
              path="account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </div>
    </>
  )
}
