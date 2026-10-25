import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { taskAPI } from '../services/api.js'
import { isTaskOverdue } from '../utils/date.js'
import DashboardStats from './DashboardStats.jsx'
import TaskFilters from './TaskFilters.jsx'
import TaskCard from './TaskCard.jsx'
import TaskModal from './TaskModal.jsx'
import DeleteConfirmModal from './DeleteConfirmModal.jsx'
import { 
  Plus, 
  LogOut, 
  Shield, 
  User, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Inbox, 
  SearchX,
  Sparkles
} from 'lucide-react'

export default function ProtectedDashboard() {
  const { user, logout, handleUnauthorized } = useAuth()

  // Task list & API states
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedbackMessage, setFeedbackMessage] = useState(null)

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All') // 'All' | 'Pending' | 'Completed' | 'Overdue'
  const [priorityFilter, setPriorityFilter] = useState('All') // 'All' | 'Low' | 'Medium' | 'High'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState(null)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [togglingTaskId, setTogglingTaskId] = useState(null)

  // Fetch tasks for the authenticated user
  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await taskAPI.getTasks(handleUnauthorized)
      if (response.success && Array.isArray(response.tasks)) {
        setTasks(response.tasks)
      } else {
        setTasks([])
      }
    } catch (err) {
      setError(err.message || 'Failed to load your tasks. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [handleUnauthorized])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Clear feedback message after 4 seconds
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => setFeedbackMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [feedbackMessage])

  // Create or Update task handler
  const handleSaveTask = async (taskPayload, taskIdToUpdate) => {
    if (taskIdToUpdate) {
      // Edit existing task
      const response = await taskAPI.updateTask(taskIdToUpdate, taskPayload, handleUnauthorized)
      if (response.success && response.task) {
        setTasks((prev) =>
          prev.map((t) => ((t.id || t._id) === taskIdToUpdate ? response.task : t))
        )
        setFeedbackMessage('Task updated successfully!')
      }
    } else {
      // Create new task
      const response = await taskAPI.createTask(taskPayload, handleUnauthorized)
      if (response.success && response.task) {
        setTasks((prev) => [response.task, ...prev])
        setFeedbackMessage('New task created successfully!')
      }
    }
  }

  // Quick toggle status (Pending <-> Completed)
  const handleStatusToggle = async (task) => {
    const taskId = task.id || task._id
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed'

    setTogglingTaskId(taskId)
    try {
      const response = await taskAPI.updateTaskStatus(taskId, nextStatus, handleUnauthorized)
      if (response.success && response.task) {
        setTasks((prev) =>
          prev.map((t) => ((t.id || t._id) === taskId ? response.task : t))
        )
        setFeedbackMessage(
          nextStatus === 'Completed' ? 'Task marked as completed! 🎉' : 'Task reopened as pending.'
        )
      }
    } catch (err) {
      setFeedbackMessage(`Failed to update status: ${err.message}`)
    } finally {
      setTogglingTaskId(null)
    }
  }

  // Delete task confirmation
  const handleConfirmDelete = async () => {
    if (!taskToDelete) return
    const taskId = taskToDelete.id || taskToDelete._id

    setIsDeleting(true)
    try {
      await taskAPI.deleteTask(taskId, handleUnauthorized)
      setTasks((prev) => prev.filter((t) => (t.id || t._id) !== taskId))
      setFeedbackMessage('Task deleted successfully.')
      setTaskToDelete(null)
    } catch (err) {
      setFeedbackMessage(`Failed to delete task: ${err.message}`)
    } finally {
      setIsDeleting(false)
    }
  }

  // Combined Search & Filter Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search Query filter (case-insensitive title match)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchesTitle = task.title?.toLowerCase().includes(query)
        const matchesCategory = task.category?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesCategory) return false
      }

      // 2. Status filter
      if (statusFilter !== 'All') {
        if (statusFilter === 'Overdue') {
          if (!isTaskOverdue(task)) return false
        } else if (task.status !== statusFilter) {
          return false
        }
      }

      // 3. Priority filter
      if (priorityFilter !== 'All') {
        if (task.priority !== priorityFilter) return false
      }

      return true
    })
  }, [tasks, searchQuery, statusFilter, priorityFilter])

  // Clear all active filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('All')
    setPriorityFilter('All')
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px]"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px]"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-[128px]"></div>
      </div>

      {/* Top Navigation */}
      <header className="relative z-10 border-b border-slate-800/80 backdrop-blur-md bg-[#090d16]/80 sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white">TaskFlow</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20">
                Phase 4
              </span>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-slate-200 font-medium leading-none">{user?.name}</span>
                <span className="text-[10px] text-slate-500 truncate max-w-[140px] mt-0.5">{user?.email}</span>
              </div>
            </div>

            <button
              id="logout-btn"
              onClick={logout}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/30 border border-slate-700/80 text-slate-300 transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="Sign out of TaskFlow"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Header Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Task Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Organize, prioritize, and track your daily productivity
            </p>
          </div>

          {/* Create Task Button */}
          <button
            id="create-task-btn"
            type="button"
            onClick={() => {
              setTaskToEdit(null)
              setIsModalOpen(true)
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Feedback / Notification Banner */}
        {feedbackMessage && (
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center justify-between animate-fadeIn shadow-sm">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="text-slate-400 hover:text-slate-200 text-xs ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* 1. Statistics Cards */}
        <DashboardStats
          tasks={tasks}
          activeStatusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* 2. Search & Filters Bar */}
        <TaskFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          onClearFilters={handleClearFilters}
          totalMatching={filteredTasks.length}
          totalTasks={tasks.length}
        />

        {/* 3. Task List Section */}
        <div className="space-y-4">
          {/* Loading State */}
          {loading ? (
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Loading your personal tasks...</p>
            </div>
          ) : error ? (
            /* Error State with Retry */
            <div className="p-8 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-sm font-semibold text-rose-200">Failed to load tasks</p>
              <p className="text-xs text-rose-300/80 max-w-md mx-auto">{error}</p>
              <button
                type="button"
                onClick={fetchTasks}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : tasks.length === 0 ? (
            /* Empty State (User has 0 tasks) */
            <div className="p-12 sm:p-16 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                <Inbox className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No tasks created yet</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You don't have any tasks in your personal workspace. Create your first task to begin tracking your productivity.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTaskToEdit(null)
                  setIsModalOpen(true)
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Your First Task</span>
              </button>
            </div>
          ) : filteredTasks.length === 0 ? (
            /* No Matching Filter Results State */
            <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <SearchX className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">No matching tasks found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No tasks matched your current search and filter combination. Try adjusting your query or clear the active filters.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold transition-all inline-flex items-center space-x-2 cursor-pointer"
              >
                <span>Clear Filters</span>
              </button>
            </div>
          ) : (
            /* Task Cards Grid */
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id || task._id}
                  task={task}
                  onStatusToggle={handleStatusToggle}
                  onEdit={(t) => {
                    setTaskToEdit(t)
                    setIsModalOpen(true)
                  }}
                  onDelete={(t) => setTaskToDelete(t)}
                  isTogglingStatus={togglingTaskId === (task.id || task._id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>TaskFlow — Full-Stack Personal Task Manager</span>
          <div className="flex items-center space-x-4 text-slate-400 font-mono text-[11px]">
            <span>{tasks.length} Total Tasks</span>
            <span>User: {user?.email}</span>
          </div>
        </div>
      </footer>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setTaskToEdit(null)
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      {/* Task Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
        task={taskToDelete}
        isDeleting={isDeleting}
      />
    </div>
  )
}
