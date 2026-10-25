import { useState, useEffect } from 'react'
import { toInputDateFormat } from '../utils/date.js'
import { X, Tag, AlertCircle, Loader2, Check } from 'lucide-react'

const CATEGORY_SUGGESTIONS = ['Work', 'Personal', 'Development', 'Design', 'Finance', 'Health']
const PRIORITIES = ['Low', 'Medium', 'High']

export default function TaskModal({ isOpen, onClose, onSave, taskToEdit }) {
  const isEditing = Boolean(taskToEdit)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('Pending')

  const [clientErrors, setClientErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate form fields when opening in edit mode
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '')
      setDescription(taskToEdit.description || '')
      setCategory(taskToEdit.category || '')
      setPriority(taskToEdit.priority || 'Medium')
      setDueDate(toInputDateFormat(taskToEdit.dueDate))
      setStatus(taskToEdit.status || 'Pending')
    } else {
      // Default reset for new task
      setTitle('')
      setDescription('')
      setCategory('')
      setPriority('Medium')
      setDueDate(toInputDateFormat())
      setStatus('Pending')
    }
    setClientErrors({})
    setSubmitError(null)
  }, [taskToEdit, isOpen])

  // Close on Escape key
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

  const validate = () => {
    const errors = {}

    if (!title.trim()) {
      errors.title = 'Title is required and cannot be blank'
    } else if (title.trim().length > 150) {
      errors.title = 'Title cannot exceed 150 characters'
    }

    if (!category.trim()) {
      errors.category = 'Category is required and cannot be blank'
    } else if (category.trim().length > 50) {
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
      category: category.trim(),
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
      // Preserve form values on error and display useful error
      setSubmitError(err.message || 'Failed to save task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
      ></div>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0d121f] border border-slate-800 p-6 sm:p-8 shadow-2xl z-10 space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEditing ? 'Update task details and assignments' : 'Add a new item to your task manager'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server / API Error Banner */}
        {submitError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{submitError}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300" htmlFor="task-title">
              Task Title <span className="text-rose-400">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (clientErrors.title) setClientErrors({ ...clientErrors, title: null })
              }}
              placeholder="e.g. Complete quarterly security review"
              disabled={isSubmitting}
              maxLength={150}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border ${
                clientErrors.title ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
              } text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-50`}
            />
            {clientErrors.title && (
              <p className="text-[11px] text-rose-400 flex items-center space-x-1 mt-1">
                <span>{clientErrors.title}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300" htmlFor="task-description">
                Description <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <span className="text-[11px] text-slate-500">{description.length}/2000</span>
            </div>
            <textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add extra context, checklist notes, or specifications..."
              disabled={isSubmitting}
              maxLength={2000}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 resize-y"
            />
          </div>

          {/* Category & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300" htmlFor="task-category">
                Category <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <input
                  id="task-category"
                  type="text"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    if (clientErrors.category) setClientErrors({ ...clientErrors, category: null })
                  }}
                  placeholder="e.g. Work, Engineering"
                  disabled={isSubmitting}
                  maxLength={50}
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/70 border ${
                    clientErrors.category ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                  } text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all disabled:opacity-50`}
                />
              </div>
              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {CATEGORY_SUGGESTIONS.slice(0, 4).map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => {
                      setCategory(sugg)
                      if (clientErrors.category) setClientErrors({ ...clientErrors, category: null })
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
              {clientErrors.category && (
                <p className="text-[11px] text-rose-400 mt-1">{clientErrors.category}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300" htmlFor="task-due-date">
                Due Date <span className="text-rose-400">*</span>
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
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border ${
                    clientErrors.dueDate ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                  } text-sm text-slate-100 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 [color-scheme:dark]`}
                />
              </div>
              {clientErrors.dueDate && (
                <p className="text-[11px] text-rose-400 mt-1">{clientErrors.dueDate}</p>
              )}
            </div>
          </div>

          {/* Priority & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Priority Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Priority <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      disabled={isSubmitting}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                        isSelected
                          ? p === 'High'
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm'
                            : p === 'Medium'
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                            : 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Status Selection (Visible in Edit mode or defaults to Pending) */}
            {isEditing ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('Pending')}
                    disabled={isSubmitting}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      status === 'Pending'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('Completed')}
                    disabled={isSubmitting}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      status === 'Completed'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5 flex flex-col justify-end">
                <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-400 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>Initial Status: <strong>Pending</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-task-btn"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Create Task'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
