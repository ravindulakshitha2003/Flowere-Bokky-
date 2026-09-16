import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      // Matches Sri Lankan numbers e.g. +94771234567, 0771234567
      match: [/^(?:\+94|0)?7\d{8}$/, 'Enter a valid Sri Lankan phone number'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // never return password by default on .find()/.findOne()
    },

    termsAccepted: {
      type: Boolean,
      required: true,
      default: false,
    },

    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],

    addresses: [
      {
        label: { type: String, trim: true },
        line1: { type: String, trim: true },
        line2: { type: String, trim: true },
        city: { type: String, trim: true },
        postalCode: { type: String, trim: true },
        isDefault: { type: Boolean, default: false },
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt
  }
)

// ---- Hash password before saving ----
// NOTE: this hook is async, so Mongoose treats it as promise-based.
// Do NOT accept/call a `next` callback here — throwing (or letting bcrypt
// reject) is how errors propagate. Mixing async + next() causes
// "next is not a function".
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// ---- Instance method to compare a plaintext password against the hash ----
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// ---- Strip sensitive fields whenever a user doc is sent as JSON ----
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.__v
  return obj
}

const User = mongoose.model('User', userSchema)

export default User