const mongoose = require('mongoose')

const promoCodeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discount: { type: Number, required: true },
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('PromoCode', promoCodeSchema)
