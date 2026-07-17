/**
 * Layout.jsx
 * -----------
 * Root layout wrapper that composes Navbar + Sidebar + page content.
 * Also renders the Toast notification stack at the global level.
 *
 * This component is the single source of truth for:
 *   - Sidebar open/close state
 *   - Toast notification state
 *
 * Toast functions are passed down via props.  Pages call addToast()
 * which they receive from the parent App.jsx via the Outlet context.
 *
 * Props:
 *   toasts    {Array}    – from useToast()
 *   onRemove  {Function} – removeToast from useToast()
 *   children  {ReactNode}
 */
import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Toast from './Toast'

const Layout = ({ toasts, onRemove, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Page content – scrollable */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Toast notifications (global overlay) */}
      <Toast toasts={toasts} onRemove={onRemove} />
    </div>
  )
}

export default Layout
