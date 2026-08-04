const asyncHandler = require('express-async-handler')
const Product = require('../models/Product')

// @route  GET /api/products
// @desc   List products with optional filtering, search, sorting, pagination
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    type,
    occasion,
    color,
    minPrice,
    maxPrice,
    isOffer,
    search,
    sort,
    page = 1,
    limit = 20,
    includeInactive,
  } = req.query

  const query = {}

  if (!includeInactive) query.isActive = true
  if (type) query.type = type
  if (occasion) query.occasions = occasion
  if (color) query.colors = color
  if (isOffer !== undefined) query.isOffer = isOffer === 'true'
  if (search) query.$text = { $search: search }

  if (minPrice || maxPrice) {
    const priceFilter = {}
    if (minPrice) priceFilter.$gte = Number(minPrice)
    if (maxPrice) priceFilter.$lte = Number(maxPrice)
    query.$or = ['sizes.S.price', 'sizes.M.price', 'sizes.L.price'].map((path) => ({
      [path]: priceFilter,
    }))
  }

  let sortOption = { createdAt: -1 }
  if (sort === 'price-asc') sortOption = { 'sizes.S.price': 1 }
  if (sort === 'price-desc') sortOption = { 'sizes.S.price': -1 }
  if (sort === 'rating') sortOption = { rating: -1 }
  if (sort === 'newest') sortOption = { createdAt: -1 }

  const pageNum = Math.max(1, Number(page))
  const limitNum = Math.min(100, Number(limit))

  const [products, total] = await Promise.all([
    Product.find(query)
      .sort(sortOption)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(query),
  ])

  res.json({
    products,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    totalResults: total,
  })
})

// @route  GET /api/products/:id
// @access Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }
  res.json(product)
})

// @route  POST /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body)
  res.status(201).json(product)
})

// @route  PUT /api/products/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }
  res.json(product)
})

// @route  DELETE /api/products/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }
  res.json({ message: 'Product deleted' })
})

// @route  PATCH /api/products/:id/stock
// @desc   Update stock quantity for a specific size (S, M, L)
// @access Private/Admin
const updateStock = asyncHandler(async (req, res) => {
  const { size, stock } = req.body
  if (!['S', 'M', 'L'].includes(size) || stock === undefined) {
    res.status(400)
    throw new Error('A valid size (S, M, L) and stock value are required')
  }

  const product = await Product.findById(req.params.id)
  if (!product) {
    res.status(404)
    throw new Error('Product not found')
  }

  product.sizes[size].stock = Math.max(0, Number(stock))
  await product.save()
  res.json(product)
})

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
}
