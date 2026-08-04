const express = require('express')
const {
  getPromoCodes,
  validatePromoCode,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
} = require('../controllers/promoController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router.post('/validate', validatePromoCode) // public - used at checkout
router.get('/', protect, authorize('admin'), getPromoCodes)
router.post('/', protect, authorize('admin'), createPromoCode)
router.put('/:id', protect, authorize('admin'), updatePromoCode)
router.delete('/:id', protect, authorize('admin'), deletePromoCode)

module.exports = router
