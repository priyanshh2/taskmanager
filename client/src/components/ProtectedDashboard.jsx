import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { taskAPI } from '../services/api.js'
import { isTaskOverdue } from '../utils/date.js'
import Sidebar from './Sidebar.jsx'
import DashboardStats from './DashboardStats.jsx'
import TaskFilters from './TaskFilters.jsx'
import TaskCard from './TaskCard.jsx'
import TaskModal from './TaskModal.jsx'
import DeleteConfirmModal from './DeleteConfirmModal.jsx'
import CalendarView from './CalendarView.jsx'
import StatisticsView from './StatisticsView.jsx'
import { 
  Plus, 
  Menu, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  Bell, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  BarChart2, 
  ArrowRight,
  SearchX
} from 'lucide-react'

export default function ProtectedDashboard() {
  const { user, logout, handleUnauthorized } = useAuth()

  // Navigation View: 'dashboard' | 'tasks' | 'calendar' | 'statistics'
  const [currentView, setCurrentView] = useState('dashboard')

  // Task list & API states
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedbackMessage, setFeedbackMessage] = useState(null)

  // Mobile sidebar drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Filter & Search states (for Tasks page)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All') // 'All' | 'Pending' | 'Completed' | 'Overdue'
  const [priorityFilter, setPriorityFilter] = useState('All') // 'All' | 'Low' | 'Medium' | 'High'
  const [categoryFilter, setCategoryFilter] = useState('All')

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

  // Initial fetch on mount
  useEffect(() => {
    let isMounted = true
    taskAPI.getTasks(handleUnauthorized)
      .then((response) => {
        if (!isMounted) return
        if (response.success && Array.isArray(response.tasks)) {
          setTasks(response.tasks)
        } else {
          setTasks([])
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load your tasks. Please try again.')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [handleUnauthorized])

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
        setFeedbackMessage('Task updated successfully.')
      }
    } else {
      // Create new task
      const response = await taskAPI.createTask(taskPayload, handleUnauthorized)
      if (response.success && response.task) {
        setTasks((prev) => [response.task, ...prev])
        setFeedbackMessage('New task created successfully.')
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
          nextStatus === 'Completed' ? 'Task marked as completed.' : 'Task reopened as pending.'
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

  // Task Counts for Sidebar and Dashboard
  const counts = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'Pending').length,
      completed: tasks.filter((t) => t.status === 'Completed').length,
      overdue: tasks.filter((t) => isTaskOverdue(t)).length,
    }
  }, [tasks])

  // Dynamic categories
  const categories = useMemo(() => {
    const set = new Set()
    tasks.forEach((t) => {
      if (t.category) set.add(t.category)
    })
    return ['All', ...Array.from(set)]
  }, [tasks])

  // Filtered Tasks for Tasks View
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchesTitle = task.title?.toLowerCase().includes(query)
        const matchesCategory = task.category?.toLowerCase().includes(query)
        if (!matchesTitle && !matchesCategory) return false
      }

      if (statusFilter !== 'All') {
        if (statusFilter === 'Overdue') {
          if (!isTaskOverdue(task)) return false
        } else if (task.status !== statusFilter) {
          return false
        }
      }

      if (priorityFilter !== 'All') {
        if (task.priority !== priorityFilter) return false
      }

      if (categoryFilter !== 'All') {
        if (task.category !== categoryFilter) return false
      }

      return true
    })
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter])

  // Clear active filters
  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('All')
    setPriorityFilter('All')
    setCategoryFilter('All')
  }

  // Time-appropriate greeting
  const [greeting] = useState(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  })

  // Open task modal with prefilled date
  const handleNewTaskWithDate = (dateString) => {
    setTaskToEdit({ dueDate: dateString })
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen flex bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* 1. Persistent Sidebar Navigation */}
      <Sidebar
        user={user}
        onLogout={logout}
        currentView={currentView}
        onSelectView={setCurrentView}
        counts={counts}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* 2. Main Content View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-[var(--border-default)] bg-[var(--bg-surface)] sticky top-0 z-20">
          <button
            type="button"
            id="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">
            TaskFlow
          </span>

          <button
            type="button"
            onClick={() => {
              setTaskToEdit(null)
              setIsModalOpen(true)
            }}
            className="p-1.5 rounded-lg bg-[var(--accent-blue)] text-white hover:bg-[var(--accent-blue-hover)] cursor-pointer"
            aria-label="Quick Add Task"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </header>

        {/* Main Content Container */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-6">
          {/* Universal Header with Top Right Quick Add Task & Bell */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
            <div>
              {currentView === 'dashboard' ? (
                <>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                    {greeting}, {user?.name || 'there'}!
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                    Plan your work and keep moving forward
                  </p>
                </>
              ) : currentView === 'tasks' ? (
                <>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                    Tasks
                  </h1>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                    Manage your tasks and stay organized
                  </p>
                </>
              ) : currentView === 'calendar' ? null : null}
            </div>

            {/* Top Right Actions: Bell & Quick Add Task Button */}
            <div className="hidden sm:flex items-center space-x-3 self-end sm:self-auto">
              <div 
                className="p-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
              </div>

              <button
                id="quick-add-task-btn"
                type="button"
                onClick={() => {
                  setTaskToEdit(null)
                  setIsModalOpen(true)
                }}
                className="px-4 py-2 rounded-xl bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Quick Add Task</span>
              </button>
            </div>
          </div>

          {/* Feedback / Notification Banner */}
          {feedbackMessage && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[var(--accent-blue-text)] text-xs flex items-center justify-between animate-fadeIn shadow-xs">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium">{feedbackMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeedbackMessage(null)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] text-xs ml-2 cursor-pointer"
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          )}

          {/* VIEW 1: DASHBOARD */}
          {currentView === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Summary Statistics Cards */}
              <DashboardStats
                tasks={tasks}
                activeStatusFilter={statusFilter}
                onStatusFilterChange={(st) => {
                  setStatusFilter(st)
                  setCurrentView('tasks')
                }}
              />

              {/* Tasks or Empty State */}
              {loading ? (
                <div className="py-16 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-center space-y-3 shadow-card">
                  <Loader2 className="w-6 h-6 text-[var(--accent-blue)] animate-spin mx-auto" />
                  <p className="text-xs text-[var(--text-secondary)] font-mono">Loading your workspace...</p>
                </div>
              ) : error ? (
                <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-center space-y-2.5">
                  <AlertCircle className="w-6 h-6 text-rose-500 mx-auto" />
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400">Failed to load tasks</p>
                  <p className="text-xs text-[var(--text-secondary)]">{error}</p>
                  <button
                    type="button"
                    onClick={fetchTasks}
                    className="px-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold hover:bg-[var(--bg-hover)] transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                </div>
              ) : tasks.length === 0 ? (
                /* Ready to get started empty state from Life Manager Image 4 */
                <div className="py-14 px-6 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-center space-y-4 shadow-card">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[var(--accent-blue)] flex items-center justify-center mx-auto shadow-inner">
                    <CheckSquare className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">Ready to get started?</h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
                      Create your first task and start organizing your day.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTaskToEdit(null)
                      setIsModalOpen(true)
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors inline-flex items-center space-x-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Create Your First Task</span>
                  </button>
                </div>
              ) : (
                /* Upcoming & Pending Tasks Overview */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                      Upcoming Tasks
                    </h2>
                    <button
                      type="button"
                      onClick={() => setCurrentView('tasks')}
                      className="text-xs font-semibold text-[var(--accent-blue)] hover:underline inline-flex items-center space-x-1 cursor-pointer"
                    >
                      <span>View all tasks</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {tasks.slice(0, 5).map((task) => (
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
                </div>
              )}

              {/* 3 Feature Navigation Cards from Life Manager Image 4 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                {/* 1. Manage Tasks */}
                <button
                  type="button"
                  onClick={() => setCurrentView('tasks')}
                  className="p-4 sm:p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] hover:shadow-card transition-all text-left flex items-center space-x-3.5 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[var(--accent-blue)] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <CheckSquare className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Manage Tasks</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">View and manage all your tasks</p>
                  </div>
                </button>

                {/* 2. Calendar View */}
                <button
                  type="button"
                  onClick={() => setCurrentView('calendar')}
                  className="p-4 sm:p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] hover:shadow-card transition-all text-left flex items-center space-x-3.5 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <CalendarIcon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Calendar View</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">See your tasks on calendar</p>
                  </div>
                </button>

                {/* 3. Statistics */}
                <button
                  type="button"
                  onClick={() => setCurrentView('statistics')}
                  className="p-4 sm:p-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] hover:shadow-card transition-all text-left flex items-center space-x-3.5 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <BarChart2 className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">Statistics</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">View your productivity stats</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* VIEW 2: TASKS */}
          {currentView === 'tasks' && (
            <div className="space-y-4 animate-fadeIn">
              <TaskFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                priorityFilter={priorityFilter}
                onPriorityFilterChange={setPriorityFilter}
                categoryFilter={categoryFilter}
                onCategoryFilterChange={setCategoryFilter}
                categories={categories}
                onClearFilters={handleClearFilters}
                totalMatching={filteredTasks.length}
                totalTasks={tasks.length}
              />

              {loading ? (
                <div className="py-16 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-center space-y-3 shadow-card">
                  <Loader2 className="w-6 h-6 text-[var(--accent-blue)] animate-spin mx-auto" />
                  <p className="text-xs text-[var(--text-secondary)] font-mono">Loading tasks...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="py-14 px-6 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-center space-y-3 shadow-card">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-tertiary)] flex items-center justify-center mx-auto">
                    <SearchX className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">No matching tasks found</h3>
                    <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                      Try adjusting your search query, status, or priority filters.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--accent-blue-text)] text-xs font-semibold transition-colors inline-flex items-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Reset Filters</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
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
          )}

          {/* VIEW 3: CALENDAR */}
          {currentView === 'calendar' && (
            <CalendarView
              tasks={tasks}
              onTaskClick={(t) => {
                setTaskToEdit(t)
                setIsModalOpen(true)
              }}
              onNewTaskWithDate={handleNewTaskWithDate}
            />
          )}

          {/* VIEW 4: STATISTICS */}
          {currentView === 'statistics' && (
            <StatisticsView tasks={tasks} />
          )}
        </main>
      </div>

      {/* Task Create / Edit Modal Dialog */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setTaskToEdit(null)
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />

      {/* Delete Confirmation Modal Dialog */}
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
