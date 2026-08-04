const asyncHandler = require('express-async-handler')
const Review = require('../models/Review')
const Product = require('../models/Product')

async function recalculateProductRating(productId) {
  const reviews = await Review.find({ product: productId })
  const reviewCount = reviews.length
  const rating = reviewCount
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
    : 0
  await Product.findByIdAndUpdate(productId, { rating, reviewCount })
}

// @route  GET /api/reviews?product=:productId
// @access Public
const getReviews = asyncHandler(async (req, res) => {
  const query = {}
  if (req.query.product) query.product = req.query.product
  const reviews = await Review.find(query).sort({ createdAt: -1 })
  res.json(reviews)
})

// @route  POST /api/reviews
// @access Private
const createReview = asyncHandler(async (req, res) => {
  const { product, rating, text } = req.body
  if (!product || !rating || !text) {
    res.status(400)
    throw new Error('product, rating and text are required')
  }

  const productExists = await Product.findById(product)
  if (!productExists) {
    res.status(404)
    throw new Error('Product not found')
  }

  const review = await Review.create({
    product,
    user: req.user._id,
    author: req.user.name,
    rating,
    text,
    verified: true,
    hasPhoto: !!req.body.hasPhoto,
  })

  await recalculateProductRating(product)
  res.status(201).json(review)
})

// @route  PUT /api/reviews/:id
// @desc   Owner of the review (or admin) can edit it
// @access Private
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) {
    res.status(404)
    throw new Error('Review not found')
  }
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403)
    throw new Error('Not authorized to edit this review')
  }

  const { rating, text } = req.body
  if (rating !== undefined) review.rating = rating
  if (text !== undefined) review.text = text
  await review.save()
  await recalculateProductRating(review.product)

  res.json(review)
})

// @route  DELETE /api/reviews/:id
// @desc   Owner of the review or admin can delete it
// @access Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id)
  if (!review) {
    res.status(404)
    throw new Error('Review not found')
  }
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403)
    throw new Error('Not authorized to delete this review')
  }

  await review.deleteOne()
  await recalculateProductRating(review.product)

  res.json({ message: 'Review deleted' })
})

module.exports = { getReviews, createReview, updateReview, deleteReview }
