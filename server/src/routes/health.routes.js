import { Router } from 'express'
import mongoose from 'mongoose'

const router = Router()

/**
 * @route   GET /api/health
 * @desc    Health check endpoint confirming API and database status
 * @access  Public
 */
router.get('/', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1

  res.status(200).json({
    status: 'ok',
    message: 'TaskFlow API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: isDbConnected ? 'connected' : 'disconnected',
      name: isDbConnected ? mongoose.connection.name : null,
    },
  })
})

export default router
