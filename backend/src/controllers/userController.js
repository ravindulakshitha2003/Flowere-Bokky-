const asyncHandler = require('express-async-handler')
const User = require('../models/User')

// @route  GET /api/users
// @access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 })
  res.json(users)
})

// @route  GET /api/users/:id
// @access Private/Admin
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  res.json(user)
})

// @route  PUT /api/users/:id
// @desc   Admin updates a user's role / active status / details
// @access Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const { name, phone, role, isActive } = req.body
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  if (name !== undefined) user.name = name
  if (phone !== undefined) user.phone = phone
  if (role !== undefined) user.role = role
  if (isActive !== undefined) user.isActive = isActive

  await user.save()
  res.json(user)
})

// @route  DELETE /api/users/:id
// @access Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400)
    throw new Error('You cannot delete your own account from here')
  }
  await user.deleteOne()
  res.json({ message: 'User deleted' })
})

module.exports = { getUsers, getUser, updateUser, deleteUser }
