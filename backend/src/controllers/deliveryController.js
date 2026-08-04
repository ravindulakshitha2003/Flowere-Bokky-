const asyncHandler = require('express-async-handler')
const DeliverySettings = require('../models/DeliverySettings')

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

async function getOrCreateSettings() {
  let settings = await DeliverySettings.findOne()
  if (!settings) {
    settings = await DeliverySettings.create({ zones: DEFAULT_ZONES, slots: DEFAULT_SLOTS })
  }
  return settings
}

// @route  GET /api/delivery-settings
// @access Public
const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings()
  res.json(settings)
})

// @route  PUT /api/delivery-settings
// @desc   Replace zones/slots/rules (admin only)
// @access Private/Admin
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings()
  const { zones, slots, rules } = req.body

  if (zones) settings.zones = zones
  if (slots) settings.slots = slots
  if (rules) settings.rules = { ...settings.rules.toObject(), ...rules }

  await settings.save()
  res.json(settings)
})

module.exports = { getSettings, updateSettings }
