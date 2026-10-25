import { useState } from 'react'
import { isTaskOverdue, isTaskDueToday, formatDueDate } from '../utils/date.js'
import { 
  Check, 
  Clock, 
  Calendar, 
  Tag, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Flag 
} from 'lucide-react'

export default function TaskCard({ task, onStatusToggle, onEdit, onDelete, isTogglingStatus }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isCompleted = task.status === 'Completed'
  const overdue = isTaskOverdue(task)
  const dueToday = isTaskDueToday(task)

  // Priority color scheme
  const priorityStyles = {
    High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Low: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  }

  const priorityStyle = priorityStyles[task.priority] || priorityStyles.Medium

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 p-4 sm:p-5 backdrop-blur-sm ${
        isCompleted
          ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
          : overdue
          ? 'bg-gradient-to-r from-rose-950/20 via-slate-900/80 to-slate-950/80 border-rose-500/30 shadow-lg shadow-rose-950/10'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Quick Status Toggle Checkbox */}
        <button
          type="button"
          onClick={() => onStatusToggle(task)}
          disabled={isTogglingStatus}
          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer flex-shrink-0 disabled:opacity-50 ${
            isCompleted
              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
              : 'border-slate-600 hover:border-emerald-400 bg-slate-950/50'
          }`}
          title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
          aria-label={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
        >
          {isTogglingStatus ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
          ) : isCompleted ? (
            <Check className="w-4 h-4 stroke-[3]" />
          ) : null}
        </button>

        {/* Center: Task Information */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title and Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3
              className={`text-sm sm:text-base font-semibold tracking-tight break-words ${
                isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
              }`}
            >
              {task.title}
            </h3>

            {/* Badges */}
            <div className="flex items-center flex-wrap gap-1.5 flex-shrink-0">
              {/* Category */}
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/60 text-slate-300 text-[11px] font-medium">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>{task.category}</span>
              </span>

              {/* Priority */}
              <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md border text-[11px] font-semibold ${priorityStyle}`}>
                <Flag className="w-3 h-3" />
                <span>{task.priority}</span>
              </span>

              {/* Status */}
              <span
                className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                  isCompleted
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                <span>●</span>
                <span>{task.status}</span>
              </span>
            </div>
          </div>

          {/* Optional Description Preview */}
          {task.description && (
            <div className="text-xs text-slate-400 leading-relaxed">
              <p className={!isExpanded ? 'line-clamp-2' : ''}>
                {task.description}
              </p>
              {task.description.length > 120 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center space-x-0.5 cursor-pointer"
                >
                  <span>{isExpanded ? 'Show less' : 'Read more'}</span>
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
            </div>
          )}

          {/* Footer Metadata: Due Date & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/40 text-xs">
            {/* Due date information */}
            <div className="flex items-center flex-wrap gap-2 text-slate-400">
              <span className="flex items-center space-x-1 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Due: {formatDueDate(task.dueDate)}</span>
              </span>

              {/* Overdue Warning Badge */}
              {overdue && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold animate-pulse">
                  <AlertCircle className="w-3 h-3" />
                  <span>OVERDUE</span>
                </span>
              )}

              {/* Due Today Badge */}
              {dueToday && !isCompleted && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                  <Clock className="w-3 h-3" />
                  <span>DUE TODAY</span>
                </span>
              )}
            </div>

            {/* Action Buttons: Edit & Delete */}
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition-all flex items-center space-x-1 cursor-pointer"
                title="Edit task"
                aria-label={`Edit task ${task.title}`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => onDelete(task)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 text-xs font-medium transition-all flex items-center space-x-1 cursor-pointer"
                title="Delete task"
                aria-label={`Delete task ${task.title}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
