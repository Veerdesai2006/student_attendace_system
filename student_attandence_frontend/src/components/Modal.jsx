/**
 * Modal.jsx
 * ----------
 * General-purpose modal wrapper for forms (Add / Edit).
 *
 * Props:
 *   isOpen   {boolean}    – controls visibility
 *   onClose  {Function}   – called to close the modal
 *   title    {string}     – header title
 *   children {ReactNode}  – form content rendered inside
 *   size     {string}     – 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 */

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4 py-6 overflow-y-auto"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      {/* Panel */}
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${sizeMap[size]} my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 id="modal-title" className="text-base font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export default Modal
