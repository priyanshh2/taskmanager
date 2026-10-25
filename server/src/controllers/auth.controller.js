import User from '../models/user.model.js'
import { generateToken } from '../utils/token.js'

// Simple email regex RFC-compliant check
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    // 1. Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name is required and must be a valid string',
      })
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address format',
      })
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      })
    }

    // 2. Check for existing user with identical email
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists',
      })
    }

    // 3. Create user (password is automatically hashed via schema pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    })

    // 4. Generate token
    const token = generateToken(user._id)

    // 5. Send safe response (never includes plain-text or hashed password)
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: user.toSafeObject(),
      token,
    })
  } catch (error) {
    // Handle MongoDB duplicate key error code 11000 defensively
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists',
      })
    }
    next(error)
  }
}

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user credentials and issue JWT
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      })
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    // 2. Find user by email and explicitly select password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password')

    // 3. Verify user existence and password validity with generic error
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
    }

    // 4. Issue JWT
    const token = generateToken(user._id)

    // 5. Return safe user data
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: user.toSafeObject(),
      token,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   GET /api/auth/me
 * @desc    Get profile for currently authenticated user
 * @access  Private (Protected by JWT)
 */
export const getMe = async (req, res) => {
  // req.user is attached by the 'protect' middleware
  return res.status(200).json({
    success: true,
    user: req.user.toSafeObject ? req.user.toSafeObject() : req.user,
  })
}

/**
 * @route   POST /api/auth/logout
 * @desc    Stateless logout acknowledgment endpoint
 * @access  Public / Private
 */
export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logout successful. Please discard your authentication token on the client.',
    note: 'JWT authentication is stateless; the client is responsible for discarding the token from memory/sessionStorage.',
  })
}
