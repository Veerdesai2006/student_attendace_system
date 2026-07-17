/**
 * Dashboard.jsx
 * --------------
 * Main dashboard page – Phase 2.
 *
 * API consumed: GET /dashboard  (single request, no invented endpoints)
 *
 * Expected response shape from Flask backend:
 * {
 *   "total_students":    <number>,
 *   "total_classes":     <number>,
 *   "total_subjects":    <number>,
 *   "total_teachers":    <number>,
 *   "today_attendance":  <number>,   // total records today
 *   "present_today":     <number>,
 *   "absent_today":      <number>
 * }
 *
 * NOTE: If your backend uses different field names, update the field
 *       references in the `cards` array below – nowhere else.
 */
import { useState, useEffect, useCallback } from 'react'
import DashboardCard from '../components/DashboardCard'
import dashboardService from '../services/dashboardService'

// ── Icon components (inline SVG, no external dependency) ─────────
const Icons = {
  Students: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Classes: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Subjects: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Teachers: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Attendance: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  Present: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 13l4 4L19 7" />
    </svg>
  ),
  Absent: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}

// ── Dashboard component ──────────────────────────────────────────
const Dashboard = ({ addToast }) => {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // ── Fetch dashboard stats from Flask backend ─────────────────
  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await dashboardService.getStats()
      setStats(response.data)
    } catch (err) {
      const msg = err.message || 'Failed to load dashboard data.'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // ── Card configuration ───────────────────────────────────────
  // Update field names here if your backend uses different keys.
  const cards = [
    {
      id:    'total_students',
      title: 'Total Students',
      value: stats?.total_students,
      icon:  Icons.Students,
      color: 'blue',
    },
    {
      id:    'total_classes',
      title: 'Total Classes',
      value: stats?.total_classes,
      icon:  Icons.Classes,
      color: 'purple',
    },
    {
      id:    'total_subjects',
      title: 'Total Subjects',
      value: stats?.total_subjects,
      icon:  Icons.Subjects,
      color: 'orange',
    },
    {
      id:    'total_teachers',
      title: 'Total Teachers',
      value: stats?.total_teachers,
      icon:  Icons.Teachers,
      color: 'teal',
    },
    {
      id:    'today_attendance',
      title: "Today's Attendance",
      value: stats?.today_attendance,
      icon:  Icons.Attendance,
      color: 'blue',
    },
    {
      id:    'present_today',
      title: 'Present Today',
      value: stats?.present_today,
      icon:  Icons.Present,
      color: 'green',
    },
    {
      id:    'absent_today',
      title: 'Absent Today',
      value: stats?.absent_today,
      icon:  Icons.Absent,
      color: 'red',
    },
  ]

  // ── Attendance percentage (derived, not a separate API call) ──
  const attendancePct =
    stats?.today_attendance > 0
      ? Math.round((stats.present_today / stats.today_attendance) * 100)
      : null

  // ── Today's date label ────────────────────────────────────────
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">{today}</p>
        </div>

        {/* Refresh button */}
        <button
          id="dashboard-refresh-btn"
          onClick={fetchStats}
          disabled={loading}
          className="btn-secondary self-start sm:self-auto"
        >
          <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Error banner ─────────────────────────────────────── */}
      {error && !loading && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-800">Failed to load dashboard</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
          <button
            onClick={fetchStats}
            className="ml-auto text-xs font-medium text-red-700 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Stat cards grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <DashboardCard
            key={card.id}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            loading={loading}
          />
        ))}
      </div>

      {/* ── Attendance summary bar (shown only when data is loaded) ── */}
      {!loading && !error && stats && attendancePct !== null && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              Today's Attendance Rate
            </h2>
            <span className={`text-lg font-bold ${
              attendancePct >= 75 ? 'text-green-600' :
              attendancePct >= 50 ? 'text-orange-500' : 'text-red-600'
            }`}>
              {attendancePct}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                attendancePct >= 75 ? 'bg-green-500' :
                attendancePct >= 50 ? 'bg-orange-400' : 'bg-red-500'
              }`}
              style={{ width: `${attendancePct}%` }}
              role="progressbar"
              aria-valuenow={attendancePct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Legend */}
          <div className="flex gap-6 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
              Present: {stats.present_today ?? 0}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
              Absent: {stats.absent_today ?? 0}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-gray-400 inline-block" />
              Total: {stats.today_attendance ?? 0}
            </span>
          </div>
        </div>
      )}

      {/* ── Empty state (data loaded but no attendance today) ── */}
      {!loading && !error && stats && attendancePct === null && (
        <div className="card p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-3 text-sm text-gray-500">No attendance records for today yet.</p>
        </div>
      )}
    </div>
  )
}

export default Dashboard
