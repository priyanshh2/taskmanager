import { Search, X, Filter, RotateCcw } from 'lucide-react'

const STATUS_OPTIONS = ['All', 'Pending', 'Completed']
const PRIORITY_OPTIONS = ['All', 'High', 'Medium', 'Low']

export default function TaskFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  onClearFilters,
  totalMatching,
  totalTasks,
}) {
  const isFiltered = searchQuery.trim() !== '' || statusFilter !== 'All' || priorityFilter !== 'All'

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 backdrop-blur-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="task-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title..."
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Clear Filters Button */}
        {isFiltered && (
          <button
            type="button"
            id="clear-filters-btn"
            onClick={onClearFilters}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-semibold transition-all cursor-pointer self-start md:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/60 text-xs">
        {/* Status Filters */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-slate-500 text-[11px] font-medium mr-1 flex items-center space-x-1">
            <Filter className="w-3 h-3" />
            <span>Status:</span>
          </span>
          {STATUS_OPTIONS.map((st) => {
            const isActive = statusFilter === st
            return (
              <button
                key={st}
                type="button"
                onClick={() => onStatusFilterChange(st)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {st}
              </button>
            )
          })}
          {statusFilter === 'Overdue' && (
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/20 border border-rose-500/30 text-rose-300">
              Overdue
            </span>
          )}
        </div>

        {/* Priority Filters */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-slate-500 text-[11px] font-medium mr-1">Priority:</span>
          {PRIORITY_OPTIONS.map((pr) => {
            const isActive = priorityFilter === pr
            return (
              <button
                key={pr}
                type="button"
                onClick={() => onPriorityFilterChange(pr)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {pr}
              </button>
            )
          })}
        </div>

        {/* Results Counter */}
        <div className="text-[11px] text-slate-500 font-mono">
          Showing <span className="text-slate-200 font-semibold">{totalMatching}</span> of {totalTasks} tasks
        </div>
      </div>
    </div>
  )
}
