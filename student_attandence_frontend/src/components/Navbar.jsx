/**
 * Navbar.jsx
 * -----------
 * Top navigation bar.
 * Shows the application name and can be extended with user info / profile.
 *
 * Props:
 *   onToggleSidebar {Function} – called when the hamburger icon is clicked
 *                                (used on mobile to show/hide sidebar)
 */

const Navbar = ({ onToggleSidebar }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white border-b border-gray-200 px-4 lg:px-6 shadow-sm">
      {/* Left – hamburger (mobile) + brand */}
      <div className="flex items-center gap-3">
        {/* Hamburger – visible on mobile only */}
        <button
          id="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2">
          {/* Simple icon */}
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <span className="hidden sm:block font-semibold text-gray-900 text-sm">
            Student Attendance System
          </span>
        </div>
      </div>

      {/* Right – status indicator */}
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-green-500" title="Backend connected" />
        <span className="text-xs text-gray-500 hidden sm:block">Live</span>
      </div>
    </header>
  )
}

export default Navbar
