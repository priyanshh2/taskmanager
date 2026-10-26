import { isTaskOverdue } from '../utils/date.js'
import { CheckSquare, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export default function DashboardStats({ tasks, activeStatusFilter, onStatusFilterChange }) {
  const total = tasks.length
  const pending = tasks.filter((t) => t.status === 'Pending').length
  const completed = tasks.filter((t) => t.status === 'Completed').length
  const overdue = tasks.filter((t) => isTaskOverdue(t)).length

  const stats = [
    {
      id: 'All',
      label: 'Total Tasks',
      value: total,
      subtext: 'All time',
      icon: CheckSquare,
      boxBg: 'bg-[var(--box-blue-bg)]',
      boxColor: 'text-[var(--box-blue-text)]',
    },
    {
      id: 'Completed',
      label: 'Completed',
      value: completed,
      subtext: `${total > 0 ? Math.round((completed / total) * 100) : 0}% completion rate`,
      icon: CheckCircle2,
      boxBg: 'bg-[var(--box-green-bg)]',
      boxColor: 'text-[var(--box-green-text)]',
    },
    {
      id: 'Pending',
      label: 'Pending',
      value: pending,
      subtext: `${pending} remaining`,
      icon: Clock,
      boxBg: 'bg-[var(--box-yellow-bg)]',
      boxColor: 'text-[var(--box-yellow-text)]',
    },
    {
      id: 'Overdue',
      label: 'Overdue',
      value: overdue,
      subtext: overdue > 0 ? 'Requires attention' : 'All on track',
      icon: AlertCircle,
      boxBg: 'bg-[var(--box-red-bg)]',
      boxColor: 'text-[var(--box-red-text)]',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const isSelected = activeStatusFilter === stat.id

        return (
          <button
            key={stat.id}
            type="button"
            id={`stat-card-${stat.id.toLowerCase()}`}
            onClick={() => onStatusFilterChange?.(stat.id)}
            className={`text-left p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
              isSelected
                ? 'bg-[var(--bg-surface)] border-[var(--accent-blue)] ring-2 ring-[var(--accent-blue-border)] shadow-sm'
                : 'bg-[var(--bg-surface)] border-[var(--border-default)] hover:border-[var(--border-strong)] hover:shadow-card'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">
                {stat.label}
              </span>
              <div className={`w-9 h-9 rounded-xl ${stat.boxBg} ${stat.boxColor} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105`}>
                <Icon className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-mono">
                {stat.value}
              </span>
              <span className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                {stat.subtext}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
