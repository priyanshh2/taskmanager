import { Search, X, RotateCcw, Filter } from 'lucide-react'

const STATUS_OPTIONS = ['All', 'Pending', 'Completed']
const PRIORITY_OPTIONS = ['All', 'High', 'Medium', 'Low']

export default function TaskFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  categoryFilter = 'All',
  onCategoryFilterChange,
  categories = ['All'],
  onClearFilters,
  totalMatching,
  totalTasks,
}) {
  const isFiltered = searchQuery.trim() !== '' || statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All'

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-2xl p-4 sm:p-5 space-y-4 shadow-card">
      {/* Top Row: Search and Quick Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="task-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)] focus:border-[var(--accent-blue)] text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue-border)] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Counter and Reset */}
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          {isFiltered && (
            <button
              type="button"
              id="clear-filters-btn"
              onClick={onClearFilters}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--accent-blue-text)] text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}

          <div className="text-xs text-[var(--text-tertiary)] font-mono">
            Showing <strong className="text-[var(--text-primary)]">{totalMatching}</strong> of {totalTasks}
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)] text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Segment */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)] flex items-center space-x-1">
              <Filter className="w-3 h-3 text-[var(--text-tertiary)]" />
              <span>Status:</span>
            </span>
            <div className="inline-flex rounded-xl bg-[var(--bg-subtle)] p-0.5 border border-[var(--border-default)]">
              {STATUS_OPTIONS.map((st) => {
                const isActive = statusFilter === st
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onStatusFilterChange(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[var(--bg-surface)] text-[var(--accent-blue-text)] shadow-xs font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {st}
                  </button>
                )
              })}
              {statusFilter === 'Overdue' && (
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
                  Overdue
                </span>
              )}
            </div>
          </div>

          {/* Priority Segment */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-medium text-[var(--text-secondary)]">Priority:</span>
            <div className="inline-flex rounded-xl bg-[var(--bg-subtle)] p-0.5 border border-[var(--border-default)]">
              {PRIORITY_OPTIONS.map((pr) => {
                const isActive = priorityFilter === pr
                return (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => onPriorityFilterChange(pr)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[var(--bg-surface)] text-[var(--accent-blue-text)] shadow-xs font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {pr}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Category Filter Dropdown (Optional / dynamic) */}
          {categories.length > 2 && onCategoryFilterChange && (
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => onCategoryFilterChange(e.target.value)}
                className="px-2.5 py-1 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)] cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
