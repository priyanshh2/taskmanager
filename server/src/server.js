import dotenv from 'dotenv'

// Load environment variables before any other module imports
dotenv.config()

import app from './app.js'
import { connectDB } from './config/db.js'

const PORT = process.env.PORT || 5000

// Initialize Database connection
await connectDB()

// Start Express HTTP Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 [Server Running] TaskFlow API listening on port ${PORT}`)
  console.log(`🔍 [Health Check] Visit http://localhost:${PORT}/api/health`)
})

// Graceful shutdown handling
const handleShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down server gracefully...`)
  server.close(() => {
    console.log('HTTP server closed.')
    process.exit(0)
  })
}

process.on('SIGINT', () => handleShutdown('SIGINT'))
process.on('SIGTERM', () => handleShutdown('SIGTERM'))

export default server
