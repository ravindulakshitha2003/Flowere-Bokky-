const asyncHandler = require('express-async-handler')
const Order = require('../models/Order')
const Product = require('../models/Product')

function generateOrderId() {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `ORD-${num}`
}

const STATUS_STEP_INDEX = {
  pending: 0,
  'in-progress': 1,
  ready: 2,
  'out-for-delivery': 3,
  delivered: 4,
  cancelled: 0,
}

// @route  POST /api/orders
// @desc   Place an order from the current cart (checkout)
// @access Private
const createOrder = asyncHandler(async (req, res) => {
  const {
    items,
    customer,
    deliverySlot,
    deliveryDate,
    giftWrapping,
    paymentMethod,
    packingTotal = 0,
    shippingCost = 0,
    estimatedDelivery,
  } = req.body

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400)
    throw new Error('Order must contain at least one item')
  }
  if (!customer || !customer.name || !customer.phone || !customer.address) {
    res.status(400)
    throw new Error('Customer name, phone and address are required')
  }

  // Validate stock and compute subtotal server-side to avoid trusting client totals
  let subtotal = 0
  for (const item of items) {
    if (item.product) {
      const product = await Product.findById(item.product)
      if (!product) {
        res.status(404)
        throw new Error(`Product not found: ${item.name}`)
      }
      const sizeData = product.sizes[item.size]
      if (!sizeData || sizeData.stock < item.quantity) {
        res.status(409)
        throw new Error(`Insufficient stock for ${product.name} (${item.size})`)
      }
    }
    const addonsTotal = (item.addons || []).reduce((s, a) => s + (a.price || 0), 0)
    subtotal += (item.price + (item.packingCost || 0) + addonsTotal) * item.quantity
  }

  const total = subtotal + Number(shippingCost)

  let orderId = generateOrderId()
  // eslint-disable-next-line no-await-in-loop
  while (await Order.findOne({ orderId })) {
    orderId = generateOrderId()
  }

  const order = await Order.create({
    orderId,
    user: req.user._id,
    items,
    customer,
    deliverySlot,
    deliveryDate,
    giftWrapping,
    paymentMethod,
    subtotal,
    packingTotal,
    shippingCost,
    total,
    estimatedDelivery,
  })

  // Decrement stock for items tied to real products
  for (const item of items) {
    if (item.product) {
      // eslint-disable-next-line no-await-in-loop
      await Product.updateOne(
        { _id: item.product },
        { $inc: { [`sizes.${item.size}.stock`]: -item.quantity } }
      )
    }
  }

  res.status(201).json(order)
})

// @route  GET /api/orders
// @desc   Get the logged-in user's own orders (admins can pass ?all=true to get every order)
// @access Private
const getOrders = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'admin' && req.query.all === 'true' ? {} : { user: req.user._id }
  const orders = await Order.find(filter).sort({ createdAt: -1 })
  res.json(orders)
})

// @route  GET /api/orders/:orderId
// @desc   Get a single order by its human-readable orderId (e.g. ORD-2847).
//         Public so the order tracking page can be used without login,
//         but only non-sensitive tracking data should be relied upon by guests.
// @access Public
const getOrderByOrderId = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId })
  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }
  res.json(order)
})

// @route  PATCH /api/orders/:orderId/status
// @desc   Update order status/current step (admin only)
// @access Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, timestamp } = req.body
  const order = await Order.findOne({ orderId: req.params.orderId })
  if (!order) {
    res.status(404)
    throw new Error('Order not found')
  }
  if (!STATUS_STEP_INDEX.hasOwnProperty(status)) {
    res.status(400)
    throw new Error('Invalid status value')
  }

  order.status = status
  const stepIndex = STATUS_STEP_INDEX[status]
  order.currentStep = stepIndex
  if (order.steps[stepIndex]) {
    order.steps[stepIndex].timestamp = timestamp || new Date().toISOString()
    if (note) order.steps[stepIndex].note = note
  }

  await order.save()
  res.json(order)
})

module.exports = { createOrder, getOrders, getOrderByOrderId, updateOrderStatus }
