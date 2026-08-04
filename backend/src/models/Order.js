const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    size: { type: String, enum: ['S', 'M', 'L'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    packingCost: { type: Number, default: 0 },
    wrapping: { type: String, default: '' },
    addons: { type: [{ name: String, price: Number }], default: [] },
  },
  { _id: false }
)

const stepSchema = new mongoose.Schema(
  {
    label: String,
    icon: String,
    timestamp: String,
    note: String,
  },
  { _id: false }
)

const DEFAULT_STEPS = [
  { label: 'Order Confirmed', icon: '✅', note: 'Your order has been received!' },
  { label: 'Being Crafted', icon: '🌸', note: 'Scheduled for crafting.' },
  { label: 'Ready for Pickup', icon: '📦', note: 'Pending.' },
  { label: 'Out for Delivery', icon: '🚚', note: 'Pending.' },
  { label: 'Delivered', icon: '✅', note: 'Pending.' },
]

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true }, // human readable e.g. ORD-2847
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },

    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },

    deliverySlot: { type: String, default: 'morning' },
    deliveryDate: { type: String, default: '' },
    giftWrapping: { type: Boolean, default: false },

    paymentMethod: { type: String, enum: ['card', 'cod'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },

    subtotal: { type: Number, required: true },
    packingTotal: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },

    status: {
      type: String,
      enum: ['pending', 'in-progress', 'ready', 'out-for-delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    steps: { type: [stepSchema], default: DEFAULT_STEPS },
    currentStep: { type: Number, default: 0 },
    estimatedDelivery: { type: String, default: '' },
  },
  { timestamps: true }
)

orderSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret.__v
    return ret
  },
})

module.exports = mongoose.model('Order', orderSchema)
