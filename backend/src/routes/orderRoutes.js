const express = require('express')
const {
  createOrder,
  getOrders,
  getOrderByOrderId,
  updateOrderStatus,
} = require('../controllers/orderController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router.post('/', protect, createOrder)
router.get('/', protect, getOrders)
router.get('/:orderId', getOrderByOrderId) // public, for the order-tracking page
router.patch('/:orderId/status', protect, authorize('admin'), updateOrderStatus)

module.exports = router
