import { useState, useEffect } from 'react'
import { X, AlertCircle, Loader2 } from 'lucide-react'

const CATEGORY_OPTIONS = ['Work', 'Personal', 'Development', 'Design', 'Assignments', 'Finance', 'Health']
const PRIORITIES = ['Low', 'Medium', 'High']

function TaskFormContent({ taskToEdit, onClose, onSave, isSubmitting, setIsSubmitting }) {
  const isEditing = Boolean(taskToEdit)

  const [title, setTitle] = useState(taskToEdit?.title || '')
  const [description, setDescription] = useState(taskToEdit?.description || '')
  const [category, setCategory] = useState(taskToEdit?.category || 'Work')
  const [customCategory, setCustomCategory] = useState('')
  const [isCustomCategory, setIsCustomCategory] = useState(() => {
    return taskToEdit?.category ? !CATEGORY_OPTIONS.includes(taskToEdit.category) : false
  })
  const [priority, setPriority] = useState(taskToEdit?.priority || 'Medium')
  const [dueDate, setDueDate] = useState(() => toInputDateFormat(taskToEdit?.dueDate))
  const [status, setStatus] = useState(taskToEdit?.status || 'Pending')

  const [clientErrors, setClientErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)

  const activeCategory = isCustomCategory ? customCategory : category

  const validate = () => {
    const errors = {}

    if (!title.trim()) {
      errors.title = 'Title is required and cannot be blank'
    } else if (title.trim().length > 150) {
      errors.title = 'Title cannot exceed 150 characters'
    }

    if (!activeCategory.trim()) {
      errors.category = 'Category is required and cannot be blank'
    } else if (activeCategory.trim().length > 50) {
      errors.category = 'Category cannot exceed 50 characters'
    }

    if (!dueDate) {
      errors.dueDate = 'Due date is required'
    } else if (isNaN(new Date(dueDate).getTime())) {
      errors.dueDate = 'Please select a valid date'
    }

    if (!PRIORITIES.includes(priority)) {
      errors.priority = 'Priority must be Low, Medium, or High'
    }

    setClientErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return

    setSubmitError(null)
    if (!validate()) return

    setIsSubmitting(true)

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: activeCategory.trim(),
      priority,
      dueDate: new Date(dueDate).toISOString(),
    }

    if (isEditing) {
      payload.status = status
    }

    try {
      await onSave(payload, taskToEdit?.id || taskToEdit?._id)
      onClose()
    } catch (err) {
      setSubmitError(err.message || 'Failed to save task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative w-full max-w-md rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-default)] p-6 sm:p-7 shadow-modal z-10 space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50 cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Server / API Error Banner */}
      {submitError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="flex-1">{submitError}</div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--text-secondary)]" htmlFor="task-title">
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              if (clientErrors.title) setClientErrors({ ...clientErrors, title: null })
            }}
            placeholder="Enter task title"
            disabled={isSubmitting}
            maxLength={150}
            className={`w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-canvas)] border ${
              clientErrors.title 
                ? 'border-rose-500 focus:border-rose-500' 
                : 'border-[var(--border-default)] focus:border-[var(--accent-blue)]'
            } text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue-border)] transition-all disabled:opacity-50`}
          />
          {clientErrors.title && (
            <p className="text-[11px] text-rose-500 mt-1 font-medium">{clientErrors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-[var(--text-secondary)]" htmlFor="task-description">
              Description
            </label>
            <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{description.length}/2000</span>
          </div>
          <textarea
            id="task-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            disabled={isSubmitting}
            maxLength={2000}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] focus:border-[var(--accent-blue)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue-border)] transition-all disabled:opacity-50 resize-y"
          />
        </div>

        {/* Category & Priority Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Category */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]" htmlFor="task-category">
                Category <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-[10px] text-[var(--accent-blue)] hover:underline cursor-pointer"
              >
                {isCustomCategory ? 'Choose from list' : '+ Custom'}
              </button>
            </div>

            {isCustomCategory ? (
              <input
                id="task-category-custom"
                type="text"
                value={customCategory}
                onChange={(e) => {
                  setCustomCategory(e.target.value)
                  if (clientErrors.category) setClientErrors({ ...clientErrors, category: null })
                }}
                placeholder="Enter custom category"
                disabled={isSubmitting}
                maxLength={50}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] focus:border-[var(--accent-blue)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue-border)] transition-all disabled:opacity-50"
              />
            ) : (
              <select
                id="task-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  if (clientErrors.category) setClientErrors({ ...clientErrors, category: null })
                }}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] focus:border-[var(--accent-blue)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue-border)] transition-all disabled:opacity-50 cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}

            {clientErrors.category && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{clientErrors.category}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-secondary)]" htmlFor="task-priority">
              Priority
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] focus:border-[var(--accent-blue)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue-border)] transition-all disabled:opacity-50 cursor-pointer"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date & Status Row */}
        <div className={`grid ${isEditing ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3.5`}>
          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--text-secondary)]" htmlFor="task-due-date">
              Due Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value)
                  if (clientErrors.dueDate) setClientErrors({ ...clientErrors, dueDate: null })
                }}
                disabled={isSubmitting}
                className={`w-full px-3.5 py-2 rounded-xl bg-[var(--bg-canvas)] border ${
                  clientErrors.dueDate 
                    ? 'border-rose-500 focus:border-rose-500' 
                    : 'border-[var(--border-default)] focus:border-[var(--accent-blue)]'
                } text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue-border)] transition-all disabled:opacity-50`}
              />
            </div>
            {clientErrors.dueDate && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{clientErrors.dueDate}</p>
            )}
          </div>

          {/* Status (In edit mode) */}
          {isEditing && (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-secondary)]" htmlFor="task-status">
                Status
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] focus:border-[var(--accent-blue)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue-border)] transition-all disabled:opacity-50 cursor-pointer"
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            id="save-task-btn"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-white text-xs font-semibold shadow-sm transition-colors flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>{isEditing ? 'Save Changes' : 'Create Task'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function TaskModal({ isOpen, onClose, onSave, taskToEdit }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen) return null

  const formKey = taskToEdit ? (taskToEdit.id || taskToEdit._id || 'edit') : 'new'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
        aria-hidden="true"
      />

      <TaskFormContent
        key={formKey}
        taskToEdit={taskToEdit}
        onClose={onClose}
        onSave={onSave}
        isSubmitting={isSubmitting}
        setIsSubmitting={setIsSubmitting}
      />
    </div>
  )
}
