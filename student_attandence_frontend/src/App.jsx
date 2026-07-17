/**
 * App.jsx
 * --------
 * Root component.
 * Sets up React Router, the shared Layout, and passes addToast to every page.
 *
 * Toast state lives here so any page can trigger a notification without
 * prop-drilling through multiple layers.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import useToast from './hooks/useToast'

// ── Page imports ─────────────────────────────────────────────────
import Dashboard  from './pages/Dashboard'
import Students   from './pages/Students'
import Classes    from './pages/Classes'
import Subjects   from './pages/Subjects'
import Teachers   from './pages/Teachers'
import Attendance from './pages/Attendance'
import Search     from './pages/Search'
import Reports    from './pages/Reports'
import Export     from './pages/Export'

const App = () => {
  const { toasts, addToast, removeToast } = useToast()

  return (
    <BrowserRouter>
      <Layout toasts={toasts} onRemove={removeToast}>
        <Routes>
          {/* Dashboard */}
          <Route path="/"           element={<Dashboard  addToast={addToast} />} />

          {/* CRUD pages */}
          <Route path="/students"   element={<Students   addToast={addToast} />} />
          <Route path="/classes"    element={<Classes    addToast={addToast} />} />
          <Route path="/subjects"   element={<Subjects   addToast={addToast} />} />
          <Route path="/teachers"   element={<Teachers   addToast={addToast} />} />
          <Route path="/attendance" element={<Attendance addToast={addToast} />} />

          {/* Search & Reports – UI only until endpoints are confirmed */}
          <Route path="/search"     element={<Search     addToast={addToast} />} />
          <Route path="/reports"    element={<Reports    addToast={addToast} />} />

          {/* Export */}
          <Route path="/export"     element={<Export     addToast={addToast} />} />

          {/* Catch-all – redirect to dashboard */}
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
