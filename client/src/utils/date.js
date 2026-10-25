/**
 * Date utility functions for TaskFlow
 */

/**
 * Checks if a task is overdue based on the user's local calendar date.
 * - Completed tasks are NEVER overdue.
 * - Tasks due today are NOT overdue.
 * - Only pending tasks with a dueDate strictly before today's calendar start (00:00:00) are overdue.
 */
export function isTaskOverdue(task) {
  if (!task || task.status === 'Completed' || !task.dueDate) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(task.dueDate)
  dueDate.setHours(0, 0, 0, 0)

  return dueDate.getTime() < today.getTime()
}

/**
 * Checks if a task's due date is today.
 */
export function isTaskDueToday(task) {
  if (!task || !task.dueDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(task.dueDate)
  dueDate.setHours(0, 0, 0, 0)

  return dueDate.getTime() === today.getTime()
}

/**
 * Formats an ISO date string for display (e.g. "Oct 30, 2026").
 */
export function formatDueDate(dateString) {
  if (!dateString) return 'No due date'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid date'

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Converts a date to YYYY-MM-DD for HTML <input type="date" />.
 */
export function toInputDateFormat(dateString) {
  if (!dateString) {
    // Default to today's date in local time
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
