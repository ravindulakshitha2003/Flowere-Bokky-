const mongoose = require('mongoose')

const sizeSchema = new mongoose.Schema(
  {
    flowers: { type: Number, default: 0 },
    price: { type: Number, required: true, default: 0 },
    stock: { type: Number, required: true, default: 0 },
  },
  { _id: false }
)

const faqSchema = new mongoose.Schema(
  {
    q: { type: String, required: true },
    a: { type: String, required: true },
  },
  { _id: false }
)

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Natural Flowers', 'Hand-Ribbon', 'Both'],
      default: 'Natural Flowers',
    },
    description: { type: String, default: '' },
    colors: { type: [String], default: [] },
    sizes: {
      S: { type: sizeSchema, default: () => ({}) },
      M: { type: sizeSchema, default: () => ({}) },
      L: { type: sizeSchema, default: () => ({}) },
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    occasions: { type: [String], default: [] },
    quality: { type: String, default: 'Standard' },
    weight: { type: String, default: '' },
    packingMaterial: { type: String, default: '' },
    packingCost: { type: Number, default: 0 },
    wrappingOptions: { type: [String], default: [] },
    isOffer: { type: Boolean, default: false },
    offerDiscount: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    flowers: { type: [String], default: [] },
    dimensions: {
      height: { type: String, default: '' },
      width: { type: String, default: '' },
    },
    faq: { type: [faqSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

productSchema.index({ name: 'text', description: 'text' })

productSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret.__v
    return ret
  },
})

module.exports = mongoose.model('Product', productSchema)
