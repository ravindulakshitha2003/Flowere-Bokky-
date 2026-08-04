import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { products as initialProducts } from '../data/products'
import { galleryItems as initialGallery } from '../data/gallery'
import {
  DEFAULT_DELIVERY_ZONES as initialZones,
  DEFAULT_DELIVERY_SLOTS as initialSlots,
  DEFAULT_DELIVERY_RULES as initialRules,
} from '../admin/adminConstants'
import { normalizeProductForAdmin, initAdminGallery } from '../admin/adminUtils'

const StoreContext = createContext(null)

const defaultProducts = initialProducts.map(normalizeProductForAdmin)
const defaultGallery = initAdminGallery(initialGallery)

function loadJson(key, fallback) {
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : fallback
  } catch {
    return fallback
  }
}

const ZONE_DEFAULTS = {
  'z-1': { priceSmall: 150, priceMedium: 200, priceLarge: 300 },
  'z-2': { priceSmall: 300, priceMedium: 400, priceLarge: 550 },
  'z-3': { priceSmall: 500, priceMedium: 650, priceLarge: 850 },
  'z-4': { priceSmall: 800, priceMedium: 1000, priceLarge: 1300 },
}

function normalizeZone(zone) {
  const defaults = ZONE_DEFAULTS[zone.id] || { priceSmall: 150, priceMedium: 200, priceLarge: 300 }
  const legacyPrice = zone.price ?? defaults.priceSmall
  return {
    id: zone.id,
    name: zone.name,
    minKm: zone.minKm ?? 0,
    maxKm: zone.maxKm ?? 999,
    priceSmall: zone.priceSmall ?? legacyPrice ?? defaults.priceSmall,
    priceMedium: zone.priceMedium ?? defaults.priceMedium,
    priceLarge: zone.priceLarge ?? defaults.priceLarge,
    active: zone.active ?? zone.isActive ?? true,
  }
}

function normalizeZones(zones) {
  return (Array.isArray(zones) ? zones : []).map(normalizeZone)
}

export function StoreProvider({ children }) {
  const [products, setProducts] = useState(() => loadJson('bb_products', defaultProducts))
  const [galleryItems, setGalleryItems] = useState(() => loadJson('bb_gallery', defaultGallery))
  const [deliveryZones, setDeliveryZones] = useState(() =>
    normalizeZones(loadJson('bb_zones', initialZones))
  )
  const [deliverySlots, setDeliverySlots] = useState(() => loadJson('bb_slots', initialSlots))
  const [deliveryRules, setDeliveryRules] = useState(() => loadJson('bb_rules', initialRules))

  useEffect(() => {
    localStorage.setItem('bb_products', JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem('bb_gallery', JSON.stringify(galleryItems))
  }, [galleryItems])

  useEffect(() => {
    localStorage.setItem('bb_zones', JSON.stringify(deliveryZones))
  }, [deliveryZones])

  useEffect(() => {
    localStorage.setItem('bb_slots', JSON.stringify(deliverySlots))
  }, [deliverySlots])

  useEffect(() => {
    localStorage.setItem('bb_rules', JSON.stringify(deliveryRules))
  }, [deliveryRules])

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: product.id || `bb-${Date.now()}`,
      createdAt: product.createdAt || new Date().toISOString().split('T')[0],
      isActive: product.isActive !== false,
    }
    setProducts((prev) => [...prev, newProduct])
    return newProduct
  }

  const updateProduct = (id, updates) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const updateStock = (productId, size, qty) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p
        return {
          ...p,
          sizes: {
            ...p.sizes,
            [size]: { ...p.sizes[size], stock: Math.max(0, qty) },
          },
        }
      })
    )
  }

  const addGalleryItem = (item) => {
    const newItem = {
      ...item,
      id: item.id || `g-${Date.now()}`,
      isApproved: item.isApproved !== false,
    }
    setGalleryItems((prev) => [newItem, ...prev])
    return newItem
  }

  const updateGalleryItem = (id, updates) => {
    setGalleryItems((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)))
  }

  const deleteGalleryItem = (id) => {
    setGalleryItems((prev) => prev.filter((g) => g.id !== id))
  }

  const activeProducts = useMemo(
    () => products.filter((p) => p.isActive !== false),
    [products]
  )

  const featuredGallery = useMemo(
    () => galleryItems.filter((g) => g.isFeatured && g.isApproved !== false),
    [galleryItems]
  )

  const value = {
    products,
    setProducts,
    galleryItems,
    setGalleryItems,
    deliveryZones,
    setDeliveryZones,
    deliverySlots,
    setDeliverySlots,
    deliveryRules,
    setDeliveryRules,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    activeProducts,
    featuredGallery,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
