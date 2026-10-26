import { useState } from 'react'
import { isTaskOverdue, isTaskDueToday, formatDueDate } from '../utils/date.js'
import { 
  Check, 
  Calendar, 
  AlertCircle, 
  Clock, 
  Edit3, 
  Trash2, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Tag
} from 'lucide-react'

export default function TaskCard({ task, onStatusToggle, onEdit, onDelete, isTogglingStatus }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isCompleted = task.status === 'Completed'
  const overdue = isTaskOverdue(task)
  const dueToday = isTaskDueToday(task)

  // Priority color tags
  const priorityStyles = {
    High: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
    Medium: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
    Low: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  }

  const priorityStyle = priorityStyles[task.priority] || priorityStyles.Medium

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-150 p-4 sm:p-4.5 bg-[var(--bg-surface)] ${
        isCompleted
          ? 'border-[var(--border-subtle)] opacity-75'
          : overdue
          ? 'border-rose-200 dark:border-rose-900/60 shadow-xs'
          : 'border-[var(--border-default)] hover:border-[var(--border-strong)] hover:shadow-card'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Status Checkbox Toggle */}
        <button
          type="button"
          onClick={() => onStatusToggle(task)}
          disabled={isTogglingStatus}
          className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center border transition-all cursor-pointer flex-shrink-0 disabled:opacity-50 ${
            isCompleted
              ? 'bg-[var(--accent-blue)] border-[var(--accent-blue)] text-white'
              : 'border-[var(--border-strong)] hover:border-[var(--accent-blue)] bg-[var(--bg-canvas)]'
          }`}
          title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
          aria-label={isCompleted ? `Mark ${task.title} as Pending` : `Mark ${task.title} as Completed`}
        >
          {isTogglingStatus ? (
            <Loader2 className="w-3 h-3 animate-spin text-[var(--text-tertiary)]" />
          ) : isCompleted ? (
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          ) : null}
        </button>

        {/* Main Content Details */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Title Row + Actions */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-sm sm:text-base font-semibold tracking-tight break-words transition-colors leading-snug ${
                isCompleted
                  ? 'line-through text-[var(--text-tertiary)]'
                  : 'text-[var(--text-primary)]'
              }`}
            >
              {task.title}
            </h3>

            {/* Actions: Edit & Delete */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-blue-text)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                title="Edit task"
                aria-label={`Edit task ${task.title}`}
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(task)}
                className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Delete task"
                aria-label={`Delete task ${task.title}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Description (Optional, collapsible) */}
          {task.description && (
            <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
              <p className={!isExpanded ? 'line-clamp-2' : ''}>
                {task.description}
              </p>
              {task.description.length > 120 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 text-[11px] text-[var(--accent-blue-text)] hover:underline inline-flex items-center space-x-0.5 cursor-pointer font-medium"
                >
                  <span>{isExpanded ? 'Show less' : 'Read more'}</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>
          )}

          {/* Metadata Row: Category, Priority, Due Date, Status */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            {/* Category Property */}
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)] text-[var(--text-secondary)] font-medium">
              <Tag className="w-3 h-3 text-[var(--text-tertiary)]" />
              <span>{task.category}</span>
            </span>

            {/* Priority Property */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border font-semibold text-[11px] ${priorityStyle}`}>
              <span>{task.priority}</span>
            </span>

            {/* Status Indicator */}
            <span
              className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg border font-semibold text-[11px] ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900'
                  : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900'
              }`}
            >
              <span>{task.status}</span>
            </span>

            {/* Due Date */}
            <span className="inline-flex items-center space-x-1 text-[var(--text-tertiary)] text-[11px]">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[var(--text-secondary)] font-medium">{formatDueDate(task.dueDate)}</span>
            </span>

            {/* Overdue Warning Badge */}
            {overdue && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900 font-bold text-[10px]">
                <AlertCircle className="w-3 h-3" />
                <span>OVERDUE</span>
              </span>
            )}

            {/* Due Today Badge */}
            {dueToday && !isCompleted && (
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900 font-semibold text-[10px]">
                <Clock className="w-3 h-3" />
                <span>DUE TODAY</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
