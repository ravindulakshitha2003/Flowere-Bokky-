const express = require('express')
const {
  getGalleryItems,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
} = require('../controllers/galleryController')
const { protect, authorize } = require('../middleware/auth')

const router = express.Router()

router.get('/', getGalleryItems)
router.get('/:id', getGalleryItem)
router.post('/', protect, createGalleryItem) // any logged-in user can submit; admins auto-approved
router.put('/:id', protect, authorize('admin'), updateGalleryItem)
router.delete('/:id', protect, authorize('admin'), deleteGalleryItem)

module.exports = router
