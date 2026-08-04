const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const galleryRoutes = require('./routes/galleryRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const wishlistRoutes = require('./routes/wishlistRoutes')
const deliveryRoutes = require('./routes/deliveryRoutes')
const promoRoutes = require('./routes/promoRoutes')
const userRoutes = require('./routes/userRoutes')
const { notFound, errorHandler } = require('./middleware/errorHandler')

const app = express()

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
)

app.use(express.json({ limit: '5mb' })) // 5mb to allow base64 image uploads from the admin panel
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/gallery', galleryRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/delivery-settings', deliveryRoutes)
app.use('/api/promo-codes', promoRoutes)
app.use('/api/users', userRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
