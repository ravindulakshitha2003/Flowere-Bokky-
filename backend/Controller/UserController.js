import User from '../models/User.js'

// ---- POST /api/auth/register ----
export async function registerUser(req, res) {
  try {
    const { name, email, phone, password, termsAccepted } = req.body

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: 'Name, email, phone and password are all required.',
      })
    }

    if (!termsAccepted) {
      return res.status(400).json({
        message: 'You must accept the terms and conditions.',
      })
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    })

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'phone number'
      return res.status(409).json({ message: `An account with this ${field} already exists.` })
    }

    // Password hashing happens automatically in the User model's pre('save') hook
    const user = await User.create({
      name,
      email,
      phone,
      password,
      termsAccepted,
    })

    res.status(201).json({
      message: 'Account created successfully.',
      user, // toJSON() on the model already strips the password hash
    })
  } catch (err) {
    if (err.name === 'ValidationError') {
      const firstError = Object.values(err.errors)[0]?.message
      return res.status(400).json({ message: firstError || 'Invalid input.' })
    }

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field'
      return res.status(409).json({ message: `This ${field} is already registered.` })
    }

    console.error('registerUser error:', err)
    res.status(500).json({ message: 'Something went wrong while creating your account.' })
  }
}

// ---- POST /api/auth/login ----
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    // password is select:false on the schema, so it must be explicitly requested
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    res.status(200).json({
      message: 'Logged in successfully.',
      user, // toJSON() on the model strips the password hash
    })
  } catch (err) {
    console.error('loginUser error:', err)
    res.status(500).json({ message: 'Something went wrong while logging in.' })
  }
}