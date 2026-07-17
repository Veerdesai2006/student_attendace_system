/**
 * Loader.jsx
 * -----------
 * Full-page or inline loading spinner.
 *
 * Props:
 *   fullPage {boolean} – centres the spinner in the viewport (default: false)
 *   size     {string}  – 'sm' | 'md' | 'lg' (default: 'md')
 */

const sizeMap = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
}

const Loader = ({ fullPage = false, size = 'md' }) => {
  const spinner = (
    <div
      className={`animate-spin rounded-full border-primary-200 border-t-primary-600 ${sizeMap[size]}`}
      role="status"
      aria-label="Loading"
    />
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  )
}

export default Loader
