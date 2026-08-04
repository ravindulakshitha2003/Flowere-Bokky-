const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true, default: '' },
    // Not required: users who sign in with Google will not have a password
    password: { type: String, minlength: 6, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    googleId: { type: String, default: null, index: true },
    avatar: { type: String, default: '' },
    address: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.password) return false
  return bcrypt.compare(candidate, this.password)
}

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password
    delete ret.__v
    return ret
  },
})

module.exports = mongoose.model('User', userSchema)
