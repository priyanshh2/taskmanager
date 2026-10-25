import { Router } from 'express'
import { register, login, getMe, logout } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// Public Auth Endpoints
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)

// Protected Auth Endpoints
router.get('/me', protect, getMe)

export default router
