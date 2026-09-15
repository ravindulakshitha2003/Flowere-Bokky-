import { Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import { FestivalProvider } from './context/FestivalContext'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { ToastProvider } from './context/ToastContext'
import { RouteSEO } from './components/SEOHead'
import AppShell from './components/layout/AppShell'
import Layout from './components/layout/Layout'
import AboutPage from './pages/AboutPage'

export default function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <ThemeProvider>        
            <FestivalProvider>
              <CartProvider>
                <WishlistProvider>
                  <ToastProvider>
                    <RouteSEO />
                    <Routes>
                      <Route element={<Layout />}>
                        <Route path="about" element={<AboutPage />} />
                      </Route>
                      <Route path="/*" element={<AppShell />} />
                    </Routes>
                  </ToastProvider>
                </WishlistProvider>
              </CartProvider>
            </FestivalProvider>
        </ThemeProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}
