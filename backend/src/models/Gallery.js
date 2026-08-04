const mongoose = require('mongoose')

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    occasion: { type: String, default: 'General' },
    type: { type: String, enum: ['Natural Flowers', 'Hand-Ribbon', 'Both'], default: 'Natural Flowers' },
    image: { type: String, default: '' }, // URL or base64 data uri
    tab: { type: String, enum: ['work', 'brand'], default: 'work' },
    isFeatured: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
)

gallerySchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret.__v
    return ret
  },
})

module.exports = mongoose.model('Gallery', gallerySchema)
