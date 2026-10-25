import { isTaskOverdue } from '../utils/date.js'
import { CheckCircle2, Clock, AlertCircle, Layers } from 'lucide-react'

export default function DashboardStats({ tasks, activeStatusFilter, onStatusFilterChange }) {
  const total = tasks.length
  const pending = tasks.filter((t) => t.status === 'Pending').length
  const completed = tasks.filter((t) => t.status === 'Completed').length
  const overdue = tasks.filter((t) => isTaskOverdue(t)).length

  const stats = [
    {
      id: 'all',
      label: 'Total Tasks',
      value: total,
      icon: Layers,
      color: 'indigo',
      borderColor: activeStatusFilter === 'All' ? 'border-indigo-500' : 'border-slate-800',
      textColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      glowColor: 'group-hover:border-indigo-500/50',
      filterValue: 'All',
    },
    {
      id: 'pending',
      label: 'Pending',
      value: pending,
      icon: Clock,
      color: 'amber',
      borderColor: activeStatusFilter === 'Pending' ? 'border-amber-500' : 'border-slate-800',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      glowColor: 'group-hover:border-amber-500/50',
      filterValue: 'Pending',
    },
    {
      id: 'completed',
      label: 'Completed',
      value: completed,
      icon: CheckCircle2,
      color: 'emerald',
      borderColor: activeStatusFilter === 'Completed' ? 'border-emerald-500' : 'border-slate-800',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      glowColor: 'group-hover:border-emerald-500/50',
      filterValue: 'Completed',
    },
    {
      id: 'overdue',
      label: 'Overdue',
      value: overdue,
      icon: AlertCircle,
      color: 'rose',
      borderColor: activeStatusFilter === 'Overdue' ? 'border-rose-500' : 'border-slate-800',
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      glowColor: 'group-hover:border-rose-500/50',
      filterValue: 'Overdue',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const isSelected = activeStatusFilter === stat.filterValue

        return (
          <button
            key={stat.id}
            type="button"
            onClick={() => onStatusFilterChange(stat.filterValue)}
            className={`group text-left p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-950/80 border transition-all duration-200 backdrop-blur-sm cursor-pointer shadow-lg hover:shadow-xl ${
              stat.borderColor
            } ${stat.glowColor} ${isSelected ? 'ring-1 ring-indigo-500/30 bg-slate-900' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
                {stat.label}
              </span>
              <div className={`w-8 h-8 rounded-xl ${stat.bgColor} flex items-center justify-center transition-transform group-hover:scale-105`}>
                <Icon className={`w-4 h-4 ${stat.textColor}`} />
              </div>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
                {stat.value}
              </span>
              <span className="text-[11px] text-slate-500">
                {stat.id === 'total' ? 'tasks' : `${Math.round(total > 0 ? (stat.value / total) * 100 : 0)}%`}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
