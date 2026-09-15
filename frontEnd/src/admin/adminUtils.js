

export function normalizeProductForAdmin(product) {
  const quality = product.quality || ''
  let qualityGrade = 'Standard'
  if (quality.includes('Premium') || quality.includes('Luxury')) qualityGrade = 'Premium'
  else if (quality.includes('Budget')) qualityGrade = 'Budget'

  const weightGrams = parseInt(String(product.weight).replace(/[^\d]/g, ''), 10) || 1000

  return {
    ...product,
    isActive: product.isActive !== false,
    shortDescription: product.shortDescription || (product.description || '').slice(0, 200),
    fullDescription: product.fullDescription || product.description || '',
    qualityGrade,
    weightGrams,
    availableAddons: product.availableAddons || [
      'led-lighting', 'fairy-lights-admin', 'butterfly-deco', 'ribbon-upgrade',
      'birthday-tag-admin', 'greeting-card-admin', 'balloon-admin',
    ],
    imageData: product.imageData || { main: null, additional: [null, null, null, null] },
    sizeMeta: product.sizeMeta || {
      S: { active: true, waitingDays: 1 },
      M: { active: true, waitingDays: 1 },
      L: { active: true, waitingDays: product.sizes?.L?.stock === 0 ? 5 : 1 },
    },
  }
}

export function initAdminProducts() {
  return products.map(normalizeProductForAdmin)
}

export function createEmptyProduct() {
  return {
    id: '',
    name: '',
    type: 'Natural Flowers',
    description: '',
    shortDescription: '',
    fullDescription: '',
    colors: [],
    sizes: {
      S: { flowers: 10, price: 0, stock: 0 },
      M: { flowers: 20, price: 0, stock: 0 },
      L: { flowers: 30, price: 0, stock: 0 },
    },
    sizeMeta: {
      S: { active: true, waitingDays: 1 },
      M: { active: true, waitingDays: 1 },
      L: { active: true, waitingDays: 1 },
    },
    rating: 4.5,
    reviewCount: 0,
    occasions: [],
    qualityGrade: 'Premium',
    weightGrams: 1000,
    packingMaterial: '',
    packingCost: 0,
    wrappingOptions: [],
    availableAddons: [],
    isOffer: false,
    isActive: true,
    createdAt: new Date().toISOString().split('T')[0],
    images: ['main'],
    flowers: [],
    dimensions: { height: '40 cm', width: '30 cm' },
    faq: [],
    imageData: { main: null, additional: [null, null, null, null] },
  }
}

export function initAdminGallery(galleryItems) {
  return galleryItems.map((item) => ({
    ...item,
    imageData: item.imageData || null,
    category: item.tab === 'brand' ? 'Our Brand' : 'Our Work',
    occasionTag: item.occasion === 'Weddings' ? 'Wedding'
      : item.occasion === 'Birthdays' ? 'Birthday'
      : item.occasion === 'Anniversaries' ? 'Anniversary'
      : item.occasion === 'Custom Orders' ? 'Custom' : 'General',
    bouquetType: item.type === 'Natural Flowers' ? 'Natural'
      : item.type === 'Hand-Ribbon' ? 'Hand-Ribbon' : 'Both',
    isFeatured: false,
    isApproved: true,
  }))
}

export function getStockStatus(stock) {
  if (stock === 0) return { label: 'Out of Stock', emoji: '🔴', key: 'out' }
  if (stock <= 4) return { label: 'Low Stock', emoji: '🟡', key: 'low' }
  if (stock <= 14) return { label: 'In Stock', emoji: '🟢', key: 'in' }
  return { label: 'Well Stocked', emoji: '🔵', key: 'well' }
}

export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
