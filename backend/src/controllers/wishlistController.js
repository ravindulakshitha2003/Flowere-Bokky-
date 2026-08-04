const asyncHandler = require('express-async-handler')
const Wishlist = require('../models/Wishlist')

// @route  GET /api/wishlist
// @access Private
const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products')
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] })
  }
  res.json(wishlist.products)
})

// @route  POST /api/wishlist/:productId
// @access Private
const addToWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id })
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] })
  }
  const { productId } = req.params
  if (!wishlist.products.some((p) => p.toString() === productId)) {
    wishlist.products.push(productId)
    await wishlist.save()
  }
  await wishlist.populate('products')
  res.json(wishlist.products)
})

// @route  DELETE /api/wishlist/:productId
// @access Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id })
  if (wishlist) {
    wishlist.products = wishlist.products.filter((p) => p.toString() !== req.params.productId)
    await wishlist.save()
    await wishlist.populate('products')
  }
  res.json(wishlist ? wishlist.products : [])
})

module.exports = { getWishlist, addToWishlist, removeFromWishlist }
