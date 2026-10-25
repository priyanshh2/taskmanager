import express from 'express'
import cors from 'cors'
import apiRoutes from './routes/index.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

// CORS Configuration
const rawOrigins = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const allowedOrigins = rawOrigins
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Render health checks, Postman)
      if (!origin) return callback(null, true)

      const normalizedOrigin = origin.replace(/\/$/, '')

      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(normalizedOrigin) ||
        (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost(:\d+)?$/.test(normalizedOrigin)) ||
        (allowedOrigins.some((o) => o.includes('.vercel.app')) && /\.vercel\.app$/.test(normalizedOrigin))
      ) {
        return callback(null, true)
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
  })
)

// Request Body Parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'TaskFlow API',
    version: '1.0.0',
    phase: 'Phase 1 - Foundation',
    healthCheck: '/api/health',
  })
})

// API Routes
app.use('/api', apiRoutes)

// Error Handling Middleware
app.use(notFound)
app.use(errorHandler)

export default app
