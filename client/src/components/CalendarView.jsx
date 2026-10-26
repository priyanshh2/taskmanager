import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react'

export default function CalendarView({ tasks, onTaskClick, onNewTaskWithDate }) {
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [viewMode, setViewMode] = useState('Month') // 'Month' | 'Week'

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay() // 0 = Sun
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const days = []

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const dateObj = new Date(year, month - 1, d)
      days.push({
        dayNumber: d,
        date: dateObj,
        isCurrentMonth: false,
        dateKey: dateObj.toISOString().split('T')[0],
      })
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateObj = new Date(year, month, d)
      days.push({
        dayNumber: d,
        date: dateObj,
        isCurrentMonth: true,
        dateKey: dateObj.toISOString().split('T')[0],
      })
    }

    // Next month filler days to complete 35 or 42 grid
    const remaining = 35 - days.length >= 0 ? 35 - days.length : 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      const dateObj = new Date(year, month + 1, d)
      days.push({
        dayNumber: d,
        date: dateObj,
        isCurrentMonth: false,
        dateKey: dateObj.toISOString().split('T')[0],
      })
    }

    return days
  }, [year, month])

  // Map tasks to dates
  const tasksByDate = useMemo(() => {
    const map = {}
    tasks.forEach((t) => {
      if (!t.dueDate) return
      const dateKey = new Date(t.dueDate).toISOString().split('T')[0]
      if (!map[dateKey]) map[dateKey] = []
      map[dateKey].push(t)
    })
    return map
  }, [tasks])

  const [todayKey] = useState(() => new Date().toISOString().split('T')[0])

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Calendar Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Calendar
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            View and manage your tasks organized by schedule
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Month / Week Toggle */}
          <div className="inline-flex rounded-xl bg-[var(--bg-subtle)] p-0.5 border border-[var(--border-default)] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('Week')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'Week'
                  ? 'bg-[var(--accent-blue)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setViewMode('Month')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                viewMode === 'Month'
                  ? 'bg-[var(--accent-blue)] text-white shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Month Navigator Bar */}
      <div className="flex items-center justify-between bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl px-4 py-3 shadow-xs">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm sm:text-base text-[var(--text-primary)] min-w-[140px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleToday}
          className="text-xs font-semibold px-3 py-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-card">
        {/* Day Header Row */}
        <div className="grid grid-cols-7 border-b border-[var(--border-default)] text-center text-xs font-semibold text-[var(--text-secondary)] py-2.5 bg-[var(--bg-subtle)]">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Days Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[var(--border-subtle)]">
          {calendarDays.map((cell) => {
            const dayTasks = tasksByDate[cell.dateKey] || []
            const isToday = cell.dateKey === todayKey

            return (
              <div
                key={cell.dateKey}
                className={`min-h-[90px] sm:min-h-[115px] p-1.5 sm:p-2 flex flex-col justify-between group transition-colors relative ${
                  !cell.isCurrentMonth
                    ? 'bg-[var(--bg-canvas)]/40 text-[var(--text-tertiary)]'
                    : isToday
                    ? 'bg-blue-50/50 dark:bg-blue-950/20'
                    : 'hover:bg-[var(--bg-hover)]'
                }`}
              >
                {/* Day Header with + Quick Add */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center ${
                      isToday
                        ? 'bg-[var(--accent-blue)] text-white font-bold'
                        : cell.isCurrentMonth
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-tertiary)]'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  <button
                    type="button"
                    onClick={() => onNewTaskWithDate?.(cell.dateKey)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[var(--text-tertiary)] hover:text-[var(--accent-blue)] hover:bg-[var(--bg-subtle)] transition-all cursor-pointer"
                    title={`Add task for ${cell.dateKey}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Day Tasks List */}
                <div className="flex-1 space-y-1 overflow-hidden">
                  {dayTasks.slice(0, 3).map((task) => {
                    const isCompleted = task.status === 'Completed'
                    const priorityDot = task.priority === 'High' 
                      ? 'bg-rose-500' 
                      : task.priority === 'Medium' 
                      ? 'bg-amber-500' 
                      : 'bg-slate-400'

                    return (
                      <button
                        key={task.id || task._id}
                        type="button"
                        onClick={() => onTaskClick?.(task)}
                        className={`w-full text-left px-1.5 py-0.5 rounded text-[11px] font-medium truncate flex items-center space-x-1 cursor-pointer transition-colors ${
                          isCompleted
                            ? 'bg-[var(--tag-green-bg)] text-[var(--tag-green-text)] line-through opacity-80'
                            : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--border-default)]'
                        }`}
                        title={`${task.title} (${task.priority} Priority, ${task.status})`}
                      >
                        {isCompleted ? (
                          <Check className="w-2.5 h-2.5 flex-shrink-0" />
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityDot}`} />
                        )}
                        <span className="truncate">{task.title}</span>
                      </button>
                    )
                  })}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] text-[var(--text-tertiary)] font-medium pl-1">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
