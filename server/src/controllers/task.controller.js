import mongoose from 'mongoose'
import Task from '../models/task.model.js'

const ALLOWED_PRIORITIES = ['Low', 'Medium', 'High']
const ALLOWED_STATUSES = ['Pending', 'Completed']

/**
 * Helper to validate a MongoDB ObjectId string.
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

/**
 * @route   POST /api/tasks
 * @desc    Create a new task for the authenticated user
 * @access  Private (JWT required)
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, category, priority, dueDate, status } = req.body

    // 1. Validate required title
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required and cannot be blank',
      })
    }

    // 2. Validate required category
    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category is required and cannot be blank',
      })
    }

    // 3. Validate priority enum
    if (!priority || !ALLOWED_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority. Allowed values are: Low, Medium, High',
      })
    }

    // 4. Validate dueDate
    if (!dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Due date is required',
      })
    }

    const parsedDate = new Date(dueDate)
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid due date format. Must be a valid date',
      })
    }

    // 5. Validate status enum if provided
    let taskStatus = 'Pending'
    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Allowed values are: Pending, Completed',
        })
      }
      taskStatus = status
    }

    // 6. Explicitly scope ownership strictly to req.user._id (ignoring any body/query inputs)
    const task = await Task.create({
      title: title.trim(),
      description: typeof description === 'string' ? description.trim() : '',
      category: category.trim(),
      priority,
      dueDate: parsedDate,
      status: taskStatus,
      user: req.user._id,
    })

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks belonging strictly to the authenticated user
 * @access  Private (JWT required)
 */
export const getTasks = async (req, res, next) => {
  try {
    // Only return tasks where user matches req.user._id
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID (only if owned by authenticated user)
 * @access  Private (JWT required)
 */
export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params

    // Validate ID format
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format',
      })
    }

    // Query scoped to both task ID and authenticated user ID
    const task = await Task.findOne({ _id: id, user: req.user._id })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      })
    }

    return res.status(200).json({
      success: true,
      task,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update allowed task fields for a task owned by the authenticated user
 * @access  Private (JWT required)
 */
export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format',
      })
    }

    // Find task scoped strictly to authenticated user
    const task = await Task.findOne({ _id: id, user: req.user._id })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      })
    }

    const { title, description, category, priority, dueDate, status } = req.body

    // Validate and apply only allowlisted fields
    if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Task title cannot be blank',
        })
      }
      task.title = title.trim()
    }

    if (description !== undefined) {
      task.description = typeof description === 'string' ? description.trim() : ''
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || !category.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be blank',
        })
      }
      task.category = category.trim()
    }

    if (priority !== undefined) {
      if (!ALLOWED_PRIORITIES.includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority. Allowed values are: Low, Medium, High',
        })
      }
      task.priority = priority
    }

    if (dueDate !== undefined) {
      const parsedDate = new Date(dueDate)
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid due date format. Must be a valid date',
        })
      }
      task.dueDate = parsedDate
    }

    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Allowed values are: Pending, Completed',
        })
      }
      task.status = status
    }

    // Save with Mongoose schema validation
    await task.save()

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   PATCH /api/tasks/:id/status
 * @desc    Update only the status of a task owned by the authenticated user
 * @access  Private (JWT required)
 */
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format',
      })
    }

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values are: Pending, Completed',
      })
    }

    // Scoped strictly to authenticated user
    const task = await Task.findOne({ _id: id, user: req.user._id })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      })
    }

    task.status = status
    await task.save()

    return res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      task,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task only if owned by the authenticated user
 * @access  Private (JWT required)
 */
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format',
      })
    }

    // Find and delete scoped strictly to authenticated user
    const task = await Task.findOneAndDelete({ _id: id, user: req.user._id })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
