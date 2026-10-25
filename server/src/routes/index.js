import { Router } from 'express'
import healthRoutes from './health.routes.js'
import authRoutes from './auth.routes.js'
import taskRoutes from './task.routes.js'

const router = Router()

// Health check route: /api/health
router.use('/health', healthRoutes)

// Auth routes: /api/auth
router.use('/auth', authRoutes)

// Task CRUD routes: /api/tasks
router.use('/tasks', taskRoutes)

export default router
