// import { createContext, useContext, useState, useEffect, useMemo } from 'react'
// import { galleryItems as initialGallery } from '../data/gallery'
// import {
//   DEFAULT_DELIVERY_ZONES as initialZones,
//   DEFAULT_DELIVERY_SLOTS as initialSlots,
//   DEFAULT_DELIVERY_RULES as initialRules,
// } from '../admin/adminConstants'
// import { normalizeProductForAdmin, initAdminGallery } from '../admin/adminUtils'

// const StoreContext = createContext(null)

// // ⚠️ CHANGE THIS to your real API base URL
// const API_BASE = 'http://localhost:3000/api/products'

// const defaultGallery = initAdminGallery(initialGallery)

// function loadJson(key, fallback) {
//   try {
//     const saved = localStorage.getItem(key)
//     return saved ? JSON.parse(saved) : fallback
//   } catch {
//     return fallback
//   }
// }

// const ZONE_DEFAULTS = {
//   'z-1': { priceSmall: 150, priceMedium: 200, priceLarge: 300 },
//   'z-2': { priceSmall: 300, priceMedium: 400, priceLarge: 550 },
//   'z-3': { priceSmall: 500, priceMedium: 650, priceLarge: 850 },
//   'z-4': { priceSmall: 800, priceMedium: 1000, priceLarge: 1300 },
// }

// function normalizeZone(zone) {
//   const defaults = ZONE_DEFAULTS[zone.id] || { priceSmall: 150, priceMedium: 200, priceLarge: 300 }
//   const legacyPrice = zone.price ?? defaults.priceSmall
//   return {
//     id: zone.id,
//     name: zone.name,
//     minKm: zone.minKm ?? 0,
//     maxKm: zone.maxKm ?? 999,
//     priceSmall: zone.priceSmall ?? legacyPrice ?? defaults.priceSmall,
//     priceMedium: zone.priceMedium ?? defaults.priceMedium,
//     priceLarge: zone.priceLarge ?? defaults.priceLarge,
//     active: zone.active ?? zone.isActive ?? true,
//   }
// }

// function normalizeZones(zones) {
//   return (Array.isArray(zones) ? zones : []).map(normalizeZone)
// }

// export function StoreProvider({ children }) {
//   const [products, setProducts] = useState([])
//   const [productsLoading, setProductsLoading] = useState(true)
//   const [productsError, setProductsError] = useState(null)

//   const [galleryItems, setGalleryItems] = useState(() => loadJson('bb_gallery', defaultGallery))
//   const [deliveryZones, setDeliveryZones] = useState(() =>
//     normalizeZones(loadJson('bb_zones', initialZones))
//   )
//   const [deliverySlots, setDeliverySlots] = useState(() => loadJson('bb_slots', initialSlots))
//   const [deliveryRules, setDeliveryRules] = useState(() => loadJson('bb_rules', initialRules))

//   // Fetch products from the backend on mount
//   useEffect(() => {
//     let cancelled = false

//     async function fetchProducts() {
//       try {
//         setProductsLoading(true)
//         const res = await fetch(API_BASE)
//         if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`)
//         const data = await res.json()
//         const list = Array.isArray(data.allproduct) ? data.allproduct : []
//         if (!cancelled) {
//           setProducts(list.map(normalizeProductForAdmin))
//           setProductsError(null)
//         }
//       } catch (err) {
//         if (!cancelled) setProductsError(err.message)
//       } finally {
//         if (!cancelled) setProductsLoading(false)
//       }
//     }

//     fetchProducts()
//     return () => { cancelled = true }
//   }, [])

//   // Gallery/zones/slots/rules keep working exactly as before — unchanged
//   useEffect(() => {
//     localStorage.setItem('bb_gallery', JSON.stringify(galleryItems))
//   }, [galleryItems])

//   useEffect(() => {
//     localStorage.setItem('bb_zones', JSON.stringify(deliveryZones))
//   }, [deliveryZones])

//   useEffect(() => {
//     localStorage.setItem('bb_slots', JSON.stringify(deliverySlots))
//   }, [deliverySlots])

//   useEffect(() => {
//     localStorage.setItem('bb_rules', JSON.stringify(deliveryRules))
//   }, [deliveryRules])

//   const addProduct = async (product) => {
//     const res = await fetch(API_BASE, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(product),
//     })
//     if (!res.ok) throw new Error('Failed to add product')
//     const saved = await res.json()
//     const newProduct = normalizeProductForAdmin(saved)
//     setProducts((prev) => [...prev, newProduct])
//     return newProduct
//   }

//   const updateProduct = async (id, updates) => {
//     const res = await fetch(`${API_BASE}/${id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(updates),
//     })
//     if (!res.ok) throw new Error('Failed to update product')
//     const saved = await res.json()
//     const updated = normalizeProductForAdmin(saved)
//     setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)))
//     return updated
//   }

//   const deleteProduct = async (id) => {
//     const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
//     if (!res.ok) throw new Error('Failed to delete product')
//     setProducts((prev) => prev.filter((p) => p.id !== id))
//   }

//   const updateStock = async (productId, size, qty) => {
//     const product = products.find((p) => p.id === productId)
//     if (!product) return
//     const updatedSizes = {
//       ...product.sizes,
//       [size]: { ...product.sizes[size], stock: Math.max(0, qty) },
//     }
//     await updateProduct(productId, { sizes: updatedSizes })
//   }

//   const addGalleryItem = (item) => {
//     const newItem = {
//       ...item,
//       id: item.id || `g-${Date.now()}`,
//       isApproved: item.isApproved !== false,
//     }
//     setGalleryItems((prev) => [newItem, ...prev])
//     return newItem
//   }

//   const updateGalleryItem = (id, updates) => {
//     setGalleryItems((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)))
//   }

//   const deleteGalleryItem = (id) => {
//     setGalleryItems((prev) => prev.filter((g) => g.id !== id))
//   }

//   const activeProducts = useMemo(
//     () => products.filter((p) => p.isActive !== false),
//     [products]
//   )

//   const featuredGallery = useMemo(
//     () => galleryItems.filter((g) => g.isFeatured && g.isApproved !== false),
//     [galleryItems]
//   )

//   const value = {
//     products,
//     setProducts,
//     productsLoading,
//     productsError,
//     galleryItems,
//     setGalleryItems,
//     deliveryZones,
//     setDeliveryZones,
//     deliverySlots,
//     setDeliverySlots,
//     deliveryRules,
//     setDeliveryRules,
//     addProduct,
//     updateProduct,
//     deleteProduct,
//     updateStock,
//     addGalleryItem,
//     updateGalleryItem,
//     deleteGalleryItem,
//     activeProducts,
//     featuredGallery,
//   }

//   return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
// }

// export const useStore = () => {
//   const ctx = useContext(StoreContext)
//   if (!ctx) throw new Error('useStore must be used within StoreProvider')
//   return null
// }