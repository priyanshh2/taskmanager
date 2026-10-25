import express from 'express'
import cors from 'cors'
import apiRoutes from './routes/index.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

// CORS Configuration
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
app.use(
  cors({
    origin: allowedOrigin,
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
