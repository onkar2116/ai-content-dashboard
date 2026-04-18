const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()

const connectDB = require('./config/db')
const analyzeRoutes = require('./routes/analyze')
const authRoutes = require('./routes/auth')
const { generalLimiter, authLimiter, analyzeLimiter } = require('./middleware/rateLimiter')
const errorHandler = require('./middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 5000

// Trust proxy (Railway/CF sit in front of the app - needed for rate limiter IP and secure cookies)
app.set('trust proxy', 1)

// CORS: allow configured client origins (comma-separated) and localhost in dev
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true)
      if (allowedOrigins.includes(origin)) return cb(null, true)
      return cb(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
  })
)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '1mb' }))
app.use(generalLimiter)

// Routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/analyze', analyzeLimiter, analyzeRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Global error handler (must be after routes)
app.use(errorHandler)

// Connect to DB and start server
const start = async () => {
  try {
    await connectDB()
  } catch {
    console.warn('Starting without MongoDB — set MONGODB_URI in .env')
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

start()
