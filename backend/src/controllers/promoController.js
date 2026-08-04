const asyncHandler = require('express-async-handler')
const PromoCode = require('../models/PromoCode')

// @route  GET /api/promo-codes
// @access Private/Admin
const getPromoCodes = asyncHandler(async (req, res) => {
  const codes = await PromoCode.find().sort({ createdAt: -1 })
  res.json(codes)
})

// @route  POST /api/promo-codes/validate
// @desc   Validate a promo code entered at checkout
// @access Public
const validatePromoCode = asyncHandler(async (req, res) => {
  const { code } = req.body
  if (!code) {
    res.status(400)
    throw new Error('Promo code is required')
  }
  const promo = await PromoCode.findOne({ code: code.toUpperCase(), active: true })
  if (!promo) {
    res.status(404)
    throw new Error('Invalid or expired promo code')
  }
  res.json({ code: promo.code, discount: promo.discount, type: promo.type })
})

// @route  POST /api/promo-codes
// @access Private/Admin
const createPromoCode = asyncHandler(async (req, res) => {
  const promo = await PromoCode.create(req.body)
  res.status(201).json(promo)
})

// @route  PUT /api/promo-codes/:id
// @access Private/Admin
const updatePromoCode = asyncHandler(async (req, res) => {
  const promo = await PromoCode.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!promo) {
    res.status(404)
    throw new Error('Promo code not found')
  }
  res.json(promo)
})

// @route  DELETE /api/promo-codes/:id
// @access Private/Admin
const deletePromoCode = asyncHandler(async (req, res) => {
  const promo = await PromoCode.findByIdAndDelete(req.params.id)
  if (!promo) {
    res.status(404)
    throw new Error('Promo code not found')
  }
  res.json({ message: 'Promo code deleted' })
})

module.exports = {
  getPromoCodes,
  validatePromoCode,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
}
