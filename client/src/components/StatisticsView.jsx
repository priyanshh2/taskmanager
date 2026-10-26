import { useState, useMemo } from 'react'
import { isTaskOverdue } from '../utils/date.js'
import { CheckSquare, CheckCircle2, Clock, AlertCircle, PieChart, BarChart2 } from 'lucide-react'

export default function StatisticsView({ tasks }) {
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Available categories
  const categories = useMemo(() => {
    const set = new Set()
    tasks.forEach((t) => {
      if (t.category) set.add(t.category)
    })
    return ['All', ...Array.from(set)]
  }, [tasks])

  // Filter tasks if specific category is selected
  const activeTasks = useMemo(() => {
    if (selectedCategory === 'All') return tasks
    return tasks.filter((t) => t.category === selectedCategory)
  }, [tasks, selectedCategory])

  const total = activeTasks.length
  const completed = activeTasks.filter((t) => t.status === 'Completed').length
  const pending = activeTasks.filter((t) => t.status === 'Pending').length
  const overdue = activeTasks.filter((t) => isTaskOverdue(t)).length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  // Tasks by Category breakdown
  const categoryBreakdown = useMemo(() => {
    const counts = {}
    tasks.forEach((t) => {
      const cat = t.category || 'Uncategorized'
      counts[cat] = (counts[cat] || 0) + 1
    })
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      pct: tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0,
    })).sort((a, b) => b.count - a.count)
  }, [tasks])

  // Tasks by Priority breakdown
  const priorityBreakdown = useMemo(() => {
    const high = activeTasks.filter((t) => t.priority === 'High').length
    const medium = activeTasks.filter((t) => t.priority === 'Medium').length
    const low = activeTasks.filter((t) => t.priority === 'Low').length

    return [
      { name: 'High', count: high, color: 'bg-rose-500', barBg: 'bg-rose-100 dark:bg-rose-950/40', textColor: 'text-rose-600 dark:text-rose-400' },
      { name: 'Medium', count: medium, color: 'bg-amber-500', barBg: 'bg-amber-100 dark:bg-amber-950/40', textColor: 'text-amber-600 dark:text-amber-400' },
      { name: 'Low', count: low, color: 'bg-blue-500', barBg: 'bg-blue-100 dark:bg-blue-950/40', textColor: 'text-blue-600 dark:text-blue-400' },
    ]
  }, [activeTasks])

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Statistics & Analytics
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Overview of your productivity and task completion performance
          </p>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[var(--text-tertiary)] font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue-border)] cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Total Tasks */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Total Tasks</span>
            <div className="w-9 h-9 rounded-xl bg-[var(--box-blue-bg)] text-[var(--box-blue-text)] flex items-center justify-center">
              <CheckSquare className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-mono">{total}</span>
            <span className="text-[11px] text-[var(--text-tertiary)]">Recorded tasks</span>
          </div>
        </div>

        {/* Completed */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Completed</span>
            <div className="w-9 h-9 rounded-xl bg-[var(--box-green-bg)] text-[var(--box-green-text)] flex items-center justify-center">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-mono">{completed}</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{completionRate}% completion rate</span>
          </div>
        </div>

        {/* Pending */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Pending</span>
            <div className="w-9 h-9 rounded-xl bg-[var(--box-yellow-bg)] text-[var(--box-yellow-text)] flex items-center justify-center">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-mono">{pending}</span>
            <span className="text-[11px] text-[var(--text-tertiary)]">Awaiting completion</span>
          </div>
        </div>

        {/* Overdue */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-[var(--text-secondary)]">Overdue</span>
            <div className="w-9 h-9 rounded-xl bg-[var(--box-red-bg)] text-[var(--box-red-text)] flex items-center justify-center">
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-mono">{overdue}</span>
            <span className="text-[11px] text-rose-500 font-medium">{overdue > 0 ? 'Past due date' : 'Zero overdue'}</span>
          </div>
        </div>
      </div>

      {/* Two Breakdown Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tasks by Category Panel */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center space-x-2">
              <PieChart className="w-4 h-4 text-[var(--accent-blue)]" />
              <span>Tasks by Category</span>
            </h3>
            <span className="text-xs text-[var(--text-tertiary)]">{categoryBreakdown.length} categories</span>
          </div>

          {categoryBreakdown.length === 0 ? (
            <p className="text-xs text-[var(--text-tertiary)] py-8 text-center">No categories to display</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--text-secondary)]">{cat.name}</span>
                    <span className="text-[var(--text-tertiary)] font-mono">{cat.count} ({cat.pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent-blue)] rounded-full transition-all duration-300"
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tasks by Priority Panel */}
        <div className="p-5 sm:p-6 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-purple-500" />
              <span>Tasks by Priority</span>
            </h3>
            <span className="text-xs text-[var(--text-tertiary)]">Active tasks</span>
          </div>

          <div className="space-y-3 pt-1">
            {priorityBreakdown.map((item) => {
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${item.textColor}`}>{item.name} Priority</span>
                    <span className="text-[var(--text-tertiary)] font-mono">{item.count} tasks ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
