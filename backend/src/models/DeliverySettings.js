const mongoose = require('mongoose')

const zoneSchema = new mongoose.Schema(
  {
    name: String,
    minKm: { type: Number, default: 0 },
    maxKm: { type: Number, default: 999 },
    priceSmall: { type: Number, default: 150 },
    priceMedium: { type: Number, default: 200 },
    priceLarge: { type: Number, default: 300 },
    active: { type: Boolean, default: true },
  },
  { _id: true }
)

const slotSchema = new mongoose.Schema(
  {
    label: String,
    time: String,
    icon: String,
    active: { type: Boolean, default: true },
    maxOrders: { type: Number, default: 20 },
  },
  { _id: true }
)

const deliverySettingsSchema = new mongoose.Schema(
  {
    zones: { type: [zoneSchema], default: [] },
    slots: { type: [slotSchema], default: [] },
    rules: {
      sameDayDelivery: { type: Boolean, default: true },
      freeDeliveryThreshold: { type: Number, default: 5000 },
      blockSundays: { type: Boolean, default: true },
      advanceBookingDays: { type: Number, default: 1 },
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('DeliverySettings', deliverySettingsSchema)
