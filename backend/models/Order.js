// models/Order.js
import mongoose from 'mongoose'



const AddonSchema = new mongoose.Schema({
  addonId: String,
  name: String,
  price: Number,
  category: String,
}, { _id: false })

const OrderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  type: String,
  image: String,

  size: { type: String, enum: ['S', 'M', 'L'], required: true },
  sizeLabel: String,
  flowers: Number,

  unitPrice: { type: Number, required: true },
  originalPrice: Number,
  isOffer: { type: Boolean, default: false },
  offerDiscount: { type: Number, default: 0 },

  packingCost: { type: Number, default: 0 },
  packingMaterial: String,
  quality: String,
  weight: String,
  colors: [String],
  flowerList: [String],

  wrapping: String,
  surpriseMe: { type: Boolean, default: false },

  addons: [AddonSchema],
  addonsTotal: { type: Number, default: 0 },

  giftMessage: String,
  quantity: { type: Number, required: true, min: 1 },
  lineTotal: { type: Number, required: true },
}, { _id: false })

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },

  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
  },

  items: { type: [OrderItemSchema], validate: v => v.length > 0 },

  delivery: {
    address: { type: String, required: true },
    location: { lat: Number, lng: Number },
    zoneId: String,
    zoneName: String,
    slotId: String,
    slotLabel: String,
    slotTime: String,
    date: { type: String, required: true },
    giftWrapping: { type: Boolean, default: false },
    giftWrappingCost: { type: Number, default: 0 },
  },

  payment: {
    method: { type: String, enum: ['card', 'cod'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    cardLast4: String,
    transactionId: String,
  },

  pricing: {
    subtotal: Number,
    packingTotal: Number,
    addonsTotal: Number,
    giftWrappingCost: Number,
    shippingCost: Number,
    discount: { type: Number, default: 0 },
    promoCode: String,
    total: { type: Number, required: true },
    currency: { type: String, default: 'LKR' },
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [{ status: String, at: { type: Date, default: Date.now }, note: String }],
  placedAt: { type: Date, default: Date.now },
}, { timestamps: true })

export default mongoose.model('Order', OrderSchema)