const asyncHandler = require('express-async-handler')
const Gallery = require('../models/Gallery')

// @route  GET /api/gallery
// @access Public
const getGalleryItems = asyncHandler(async (req, res) => {
  const { tab, occasion, type, includeUnapproved } = req.query
  const query = {}
  if (tab) query.tab = tab
  if (occasion) query.occasion = occasion
  if (type) query.type = type
  if (!includeUnapproved) query.isApproved = true

  const items = await Gallery.find(query).sort({ createdAt: -1 })
  res.json(items)
})

// @route  GET /api/gallery/:id
// @access Public
const getGalleryItem = asyncHandler(async (req, res) => {
  const item = await Gallery.findById(req.params.id)
  if (!item) {
    res.status(404)
    throw new Error('Gallery item not found')
  }
  res.json(item)
})

// @route  POST /api/gallery
// @desc   Create a gallery item. Regular logged-in users can submit photos
//         (created as unapproved); admins can create pre-approved items.
// @access Private
const createGalleryItem = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin'
  const item = await Gallery.create({
    ...req.body,
    submittedBy: req.user._id,
    isApproved: isAdmin ? req.body.isApproved !== false : false,
  })
  res.status(201).json(item)
})

// @route  PUT /api/gallery/:id
// @access Private/Admin
const updateGalleryItem = asyncHandler(async (req, res) => {
  const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
  if (!item) {
    res.status(404)
    throw new Error('Gallery item not found')
  }
  res.json(item)
})

// @route  DELETE /api/gallery/:id
// @access Private/Admin
const deleteGalleryItem = asyncHandler(async (req, res) => {
  const item = await Gallery.findByIdAndDelete(req.params.id)
  if (!item) {
    res.status(404)
    throw new Error('Gallery item not found')
  }
  res.json({ message: 'Gallery item deleted' })
})

module.exports = {
  getGalleryItems,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
}
