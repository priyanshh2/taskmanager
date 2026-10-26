import { useEffect } from 'react'
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react'

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, task, isDeleting }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isDeleting, onClose])

  if (!isOpen || !task) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity"
        onClick={!isDeleting ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm rounded-[10px] bg-[var(--bg-surface)] border border-[var(--border-default)] p-5 shadow-modal z-10 space-y-4 animate-fadeIn">
        <div className="flex items-start justify-between">
          <div className="w-8 h-8 rounded-[6px] bg-[var(--tag-red-bg)] border border-[var(--tag-red-border)] text-[var(--tag-red-text)] flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-[4px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">Delete Task?</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-[var(--text-primary)]">"{task.title}"</strong>? This action cannot be undone.
          </p>
        </div>

        <div className="p-2.5 rounded-[6px] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-tertiary)]">Category:</span>
            <span className="font-medium text-[var(--text-primary)]">{task.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-tertiary)]">Status:</span>
            <span className="font-medium text-[var(--text-primary)]">{task.status}</span>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3 py-1.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-delete-btn"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-3 py-1.5 rounded-[6px] bg-[var(--tag-red-text)] hover:opacity-90 active:opacity-100 text-white text-xs font-medium shadow-xs transition-opacity flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3 h-3" />
                <span>Delete Task</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
