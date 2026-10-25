import { Router } from 'express'
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/task.controller.js'
import { protect } from '../middleware/auth.js'

const router = Router()

// All task routes require valid JWT authentication
router.use(protect)

// Collection routes
router.route('/')
  .post(createTask)
  .get(getTasks)

// Specific task status update route
router.patch('/:id/status', updateTaskStatus)

// Document routes
router.route('/:id')
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask)

export default router
