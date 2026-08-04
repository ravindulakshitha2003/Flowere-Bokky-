/**
 * Seed the database with demo data matching the Bloom & Bliss frontend.
 * Usage: npm run seed          (loads data)
 *        npm run seed -- --wipe (wipes collections first, then loads data)
 */
require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('../config/db')

const User = require('../models/User')
const Product = require('../models/Product')
const Gallery = require('../models/Gallery')
const PromoCode = require('../models/PromoCode')
const DeliverySettings = require('../models/DeliverySettings')

const productsSeed = require('./seedData/products.json')
const gallerySeed = require('./seedData/gallery.json')

const DEFAULT_ZONES = [
  { name: 'Zone 1', minKm: 0, maxKm: 5, priceSmall: 150, priceMedium: 200, priceLarge: 300, active: true },
  { name: 'Zone 2', minKm: 5, maxKm: 15, priceSmall: 300, priceMedium: 400, priceLarge: 550, active: true },
  { name: 'Zone 3', minKm: 15, maxKm: 30, priceSmall: 500, priceMedium: 650, priceLarge: 850, active: true },
  { name: 'Zone 4', minKm: 30, maxKm: 999, priceSmall: 800, priceMedium: 1000, priceLarge: 1300, active: true },
]

const DEFAULT_SLOTS = [
  { label: 'Morning', time: '08:00 AM – 12:00 PM', icon: '🌅', active: true, maxOrders: 20 },
  { label: 'Afternoon', time: '12:00 PM – 04:00 PM', icon: '☀️', active: true, maxOrders: 25 },
  { label: 'Evening', time: '04:00 PM – 08:00 PM', icon: '🌆', active: true, maxOrders: 20 },
]

const PROMO_CODES = [
  { code: 'BLOOM15', discount: 15, type: 'percent', active: true },
  { code: 'BLISS500', discount: 500, type: 'fixed', active: true },
  { code: 'WELCOME10', discount: 10, type: 'percent', active: true },
]

function mapProduct(p) {
  return {
    name: p.name,
    type: p.type,
    description: p.description,
    colors: p.colors || [],
    sizes: p.sizes,
    rating: p.rating || 0,
    reviewCount: p.reviewCount || 0,
    occasions: p.occasions || [],
    quality: p.quality || 'Standard',
    weight: p.weight || '',
    packingMaterial: p.packingMaterial || '',
    packingCost: p.packingCost || 0,
    wrappingOptions: p.wrappingOptions || [],
    isOffer: !!p.isOffer,
    offerDiscount: p.offerDiscount || 0,
    images: p.images || [],
    flowers: p.flowers || [],
    dimensions: p.dimensions || { height: '', width: '' },
    faq: p.faq || [],
    isActive: true,
  }
}

function mapGallery(g) {
  return {
    title: g.title,
    occasion: g.occasion,
    type: g.type,
    image: '', // frontend used CSS gradients for placeholders; swap in real image URLs later
    tab: g.tab,
    isFeatured: false,
    isApproved: true,
  }
}

async function seed() {
  await connectDB()

  const shouldWipe = process.argv.includes('--wipe')

  if (shouldWipe) {
    console.log('Wiping existing collections...')
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Gallery.deleteMany({}),
      PromoCode.deleteMany({}),
      DeliverySettings.deleteMany({}),
    ])
  }

  // Demo users (matching the frontend README demo accounts)
  const existingAdmin = await User.findOne({ email: 'admin@bloomandbliss.lk' })
  if (!existingAdmin) {
    await User.create({
      name: 'Admin',
      email: 'admin@bloomandbliss.lk',
      password: 'admin123',
      role: 'admin',
      phone: '0770000000',
    })
    console.log('Created admin user: admin@bloomandbliss.lk / admin123')
  }

  const existingUser = await User.findOne({ email: 'amaya@email.lk' })
  if (!existingUser) {
    await User.create({
      name: 'Amaya Fernando',
      email: 'amaya@email.lk',
      password: 'password123',
      role: 'user',
      phone: '0771234567',
    })
    console.log('Created demo user: amaya@email.lk / password123')
  }

  // Products
  const productCount = await Product.countDocuments()
  if (productCount === 0) {
    const docs = await Product.insertMany(productsSeed.map(mapProduct))
    console.log(`Inserted ${docs.length} products`)
  } else {
    console.log(`Skipped products (already ${productCount} in DB)`)
  }

  // Gallery
  const galleryCount = await Gallery.countDocuments()
  if (galleryCount === 0) {
    const docs = await Gallery.insertMany(gallerySeed.map(mapGallery))
    console.log(`Inserted ${docs.length} gallery items`)
  } else {
    console.log(`Skipped gallery (already ${galleryCount} in DB)`)
  }

  // Promo codes
  for (const promo of PROMO_CODES) {
    await PromoCode.updateOne({ code: promo.code }, { $setOnInsert: promo }, { upsert: true })
  }
  console.log('Promo codes ensured:', PROMO_CODES.map((p) => p.code).join(', '))

  // Delivery settings (singleton)
  const settingsCount = await DeliverySettings.countDocuments()
  if (settingsCount === 0) {
    await DeliverySettings.create({ zones: DEFAULT_ZONES, slots: DEFAULT_SLOTS })
    console.log('Created default delivery settings')
  } else {
    console.log('Skipped delivery settings (already exists)')
  }

  console.log('Seed complete.')
  await mongoose.connection.close()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
