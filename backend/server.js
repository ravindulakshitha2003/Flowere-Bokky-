require('dotenv').config()
const app = require('./src/app')
const connectDB = require('./src/config/db')

const PORT = process.env.PORT || 8080

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Bloom & Bliss API running on port ${PORT}`)
  })
})

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled rejection: ${err.message}`)
})
