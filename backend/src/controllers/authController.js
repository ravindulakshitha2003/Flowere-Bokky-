const asyncHandler = require('express-async-handler')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    address: user.address,
  }
}

// @route  POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body

  if (!name || !email || !password) {
    res.status(400)
    throw new Error('Name, email and password are required')
  }
  if (password.length < 6) {
    res.status(400)
    throw new Error('Password must be at least 6 characters')
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    res.status(409)
    throw new Error('An account with this email already exists')
  }

  const user = await User.create({ name, email, phone, password })
  const token = generateToken(user._id)

  res.status(201).json({ token, user: sanitizeUser(user) })
})

// @route  POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400)
    throw new Error('Email and password are required')
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
  if (!user || !(await user.comparePassword(password))) {
    res.status(401)
    throw new Error('Invalid email or password')
  }
  if (!user.isActive) {
    res.status(403)
    throw new Error('This account has been deactivated')
  }

  const token = generateToken(user._id)
  res.json({ token, user: sanitizeUser(user) })
})

// @route  POST /api/auth/google
// @desc   Login/Register using a Google ID token obtained on the frontend
//         via Google Identity Services (Sign in with Google button).
// @access Public
const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body // ID token from Google Identity Services

  if (!credential) {
    res.status(400)
    throw new Error('Google credential token is required')
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
  const payload = ticket.getPayload()

  if (!payload || !payload.email) {
    res.status(401)
    throw new Error('Invalid Google credential')
  }

  let user = await User.findOne({
    $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }],
  })

  if (!user) {
    user = await User.create({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      googleId: payload.sub,
      avatar: payload.picture || '',
    })
  } else if (!user.googleId) {
    user.googleId = payload.sub
    if (!user.avatar) user.avatar = payload.picture || ''
    await user.save()
  }

  const token = generateToken(user._id)
  res.json({ token, user: sanitizeUser(user) })
})

// @route  GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.json(sanitizeUser(req.user))
})

// @route  PUT /api/auth/me
// @access Private
const updateMe = asyncHandler(async (req, res) => {
  const { name, phone, address, avatar } = req.body
  const user = req.user

  if (name !== undefined) user.name = name
  if (phone !== undefined) user.phone = phone
  if (address !== undefined) user.address = address
  if (avatar !== undefined) user.avatar = avatar

  await user.save()
  res.json(sanitizeUser(user))
})

// @route  PUT /api/auth/change-password
// @access Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!newPassword || newPassword.length < 6) {
    res.status(400)
    throw new Error('New password must be at least 6 characters')
  }

  const user = await User.findById(req.user._id).select('+password')

  if (user.password) {
    if (!currentPassword || !(await user.comparePassword(currentPassword))) {
      res.status(401)
      throw new Error('Current password is incorrect')
    }
  }

  user.password = newPassword
  await user.save()
  res.json({ message: 'Password updated successfully' })
})

module.exports = { register, login, googleAuth, getMe, updateMe, changePassword }
