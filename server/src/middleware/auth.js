import User from '../models/user.model.js'
import { verifyToken } from '../utils/token.js'

/**
 * Authentication middleware that verifies JWT from Authorization header
 * and attaches authenticated user to req.user.
 *
 * Never trusts user IDs in request body or query params.
 */
export const protect = async (req, res, next) => {
  let token

  const authHeader = req.headers.authorization

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]?.trim()
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    })
  }

  try {
    const decoded = verifyToken(token)

    // Lookup user by ID from verified JWT payload (never trusting body/query)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User account does not exist or was removed.',
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Token has expired. Please log in again.',
      })
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Invalid authentication token.',
      })
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Please log in again.',
    })
  }
}
