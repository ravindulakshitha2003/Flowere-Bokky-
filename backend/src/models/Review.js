const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    author: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true },
    verified: { type: Boolean, default: false },
    hasPhoto: { type: Boolean, default: false },
  },
  { timestamps: true }
)

reviewSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret.__v
    return ret
  },
})

module.exports = mongoose.model('Review', reviewSchema)
