/**
 * ConfirmDialog.jsx
 * ------------------
 * Modal-style confirmation dialog.
 * Used before any destructive action (e.g. delete).
 *
 * Props:
 *   isOpen    {boolean}  – controls visibility
 *   title     {string}   – dialog title
 *   message   {string}   – dialog body text
 *   onConfirm {Function} – called when user clicks "Confirm"
 *   onCancel  {Function} – called when user clicks "Cancel" or backdrop
 *   loading   {boolean}  – disables buttons while operation is running
 */

const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={!loading ? onCancel : undefined}
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-title"
    >
      {/* Dialog panel – stop click propagation so backdrop doesn't close it */}
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon + Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h3 id="confirm-title" className="text-base font-semibold text-gray-900">
            {title}
          </h3>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-6 ml-13">{message}</p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            id="confirm-cancel-btn"
            className="btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            id="confirm-proceed-btn"
            className="btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Deleting…
              </span>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
