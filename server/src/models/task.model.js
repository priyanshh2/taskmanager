import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [150, 'Task title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Task description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: 'Priority must be either Low, Medium, or High',
      },
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Completed'],
        message: 'Status must be either Pending or Completed',
      },
      default: 'Pending',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task owner (user) is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound indexes for performant querying of a user's tasks
taskSchema.index({ user: 1, createdAt: -1 })
taskSchema.index({ user: 1, status: 1 })
taskSchema.index({ user: 1, dueDate: 1 })

// Format output JSON
taskSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret.__v
    return ret
  },
})

const Task = mongoose.model('Task', taskSchema)

export default Task
