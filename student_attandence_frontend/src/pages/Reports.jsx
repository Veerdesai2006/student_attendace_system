/**
 * Reports.jsx
 * ------------
 * Phase 9 – Analytics & Reports Dashboard
 *
 * A premium, Power-BI-inspired analytics dashboard built on real Flask data.
 *
 * Backend endpoints used (all confirmed live):
 *   GET /api/dashboard              → KPI stats
 *   GET /api/reports/student/<id>   → student attendance rows
 *   GET /api/reports/subject/<id>   → subject attendance rows
 *   GET /api/reports/teacher/<id>   → teacher attendance rows
 *   GET /api/reports/daily/<date>   → daily attendance rows
 *   GET /api/reports/date-range/s/e → date-range attendance rows
 *   GET /api/export/attendance      → CSV blob
 *
 * Sections:
 *   1. KPI Cards (animated counters from /dashboard)
 *   2. Charts derived client-side from report data
 *      – Present vs Absent pie  (from any report)
 *      – Attendance by Subject bar
 *      – Attendance by Teacher bar
 *      – Daily trend line/area
 *   3. Report Tables (Student / Subject / Teacher / Daily / Date-Range)
 *   4. Export CSV button
 */

import {
  useState, useEffect, useCallback, useMemo, useRef
} from 'react'
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts'
import reportService    from '../services/reportService'
import studentService   from '../services/studentService'
import teacherService   from '../services/teacherService'
import subjectService   from '../services/subjectService'
import { exportToCsv, exportToExcel, captureChartImages } from '../utils/exportUtils'

// ─── Design tokens ────────────────────────────────────────────────
const COLORS = {
  present : '#22c55e',
  absent  : '#ef4444',
  blue    : '#3b82f6',
  violet  : '#8b5cf6',
  amber   : '#f59e0b',
  teal    : '#14b8a6',
  rose    : '#f43f5e',
  indigo  : '#6366f1',
}

const PIE_COLORS  = [COLORS.present, COLORS.absent]
const BAR_PALETTE = [COLORS.blue, COLORS.violet, COLORS.amber, COLORS.teal, COLORS.rose, COLORS.indigo]

// ─── Utility: format "Thu, 16 Jul 2026 00:00:00 GMT" → "16 Jul 2026" ──
const fmtDate = (raw) => {
  if (!raw) return '—'
  const d = new Date(raw)
  return isNaN(d) ? raw : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Utility: derive chart data from raw report rows ──────────────
const deriveCharts = (rows) => {
  if (!rows || rows.length === 0) return null

  // Present / Absent counts
  let present = 0, absent = 0
  rows.forEach(r => { r.status === 'Present' ? present++ : absent++ })
  const pieData = [
    { name: 'Present', value: present },
    { name: 'Absent',  value: absent  },
  ]

  // Attendance by Subject
  const bySubject = {}
  rows.forEach(r => {
    const k = r.subject || 'Unknown'
    if (!bySubject[k]) bySubject[k] = { subject: k, Present: 0, Absent: 0 }
    bySubject[k][r.status]++
  })
  const subjectData = Object.values(bySubject)

  // Attendance by Teacher
  const byTeacher = {}
  rows.forEach(r => {
    const k = r.teacher || 'Unknown'
    if (!byTeacher[k]) byTeacher[k] = { teacher: k, Present: 0, Absent: 0 }
    byTeacher[k][r.status]++
  })
  const teacherData = Object.values(byTeacher)

  // Daily trend (only if attendance_date exists)
  const byDate = {}
  rows.forEach(r => {
    const raw = r.attendance_date
    if (!raw) return
    const day = fmtDate(raw)
    if (!byDate[day]) byDate[day] = { date: day, Present: 0, Absent: 0, rawDate: new Date(raw) }
    byDate[day][r.status]++
  })
  const trendData = Object.values(byDate).sort((a, b) => a.rawDate - b.rawDate)

  return { pieData, subjectData, teacherData, trendData }
}

// ═══════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════

// ─── Animated counter ─────────────────────────────────────────────
const AnimatedNumber = ({ value, duration = 800 }) => {
  const [display, setDisplay] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    const start = performance.now()
    const from  = 0
    const to    = Number(value) || 0
    const step  = (ts) => {
      const p = Math.min((ts - start) / duration, 1)
      setDisplay(Math.round(from + (to - from) * p))
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration])
  return <>{display}</>
}

// ─── Skeleton loader ──────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
)

// ─── KPI Card ─────────────────────────────────────────────────────
const KpiCard = ({ title, value, icon, gradient, sub, loading }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg
                   transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl
                   bg-gradient-to-br ${gradient}`}>
    {/* Background decoration */}
    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
    <div className="absolute -right-2 bottom-2 h-16 w-16 rounded-full bg-white/5" />

    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-white/80">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
          {icon}
        </div>
      </div>
      {loading
        ? <Skeleton className="h-9 w-20 bg-white/30" />
        : <p className="text-3xl font-bold tracking-tight">
            <AnimatedNumber value={value} />
          </p>
      }
      {sub && !loading && (
        <p className="mt-1 text-xs text-white/70">{sub}</p>
      )}
    </div>
  </div>
)

// ─── Chart Card wrapper ───────────────────────────────────────────
// innerRef: forwarded to the outer div for html2canvas chart capture
// data-chart-title: read by captureChartImages() for Excel sheet labels
const ChartCard = ({ title, subtitle, children, loading, isEmpty, innerRef }) => (
  <div ref={innerRef} data-chart-title={title} className="card p-6 flex flex-col gap-3">
    <div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {loading ? (
      <Skeleton className="h-52 w-full" />
    ) : isEmpty ? (
      <div className="flex flex-col items-center justify-center h-52 text-gray-300 gap-2">
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-sm font-medium text-gray-400">No data to display</p>
      </div>
    ) : children}
  </div>
)

// ─── Status badge ─────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
  status === 'Present'
    ? <span className="badge-green">Present</span>
    : <span className="badge-red">Absent</span>
)

// ─── Sortable, searchable, paginated table ────────────────────────
const ReportTable = ({ columns, data, loading, pageSize = 10 }) => {
  const [query,  setQuery]  = useState('')
  const [sortK,  setSortK]  = useState(null)
  const [sortD,  setSortD]  = useState('asc')
  const [page,   setPage]   = useState(1)

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.toLowerCase()
    return data.filter(row =>
      columns.some(col => String(row[col.key] ?? '').toLowerCase().includes(q))
    )
  }, [data, query, columns])

  const sorted = useMemo(() => {
    if (!sortK) return filtered
    return [...filtered].sort((a, b) => {
      const av = String(a[sortK] ?? '')
      const bv = String(b[sortK] ?? '')
      return sortD === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }, [filtered, sortK, sortD])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated  = sorted.slice((page - 1) * pageSize, page * pageSize)

  const toggleSort = (key) => {
    if (sortK === key) setSortD(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortK(key); setSortD('asc') }
    setPage(1)
  }

  useEffect(() => { setPage(1) }, [query])

  if (loading) return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
    </div>
  )

  if (!data || data.length === 0) return (
    <div className="flex flex-col items-center py-12 text-gray-400 gap-2">
      <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z" />
      </svg>
      <p className="text-sm font-medium text-gray-500">No records found</p>
      <p className="text-xs">Run a report to see attendance data here.</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filter results…"
            className="input pl-9 text-xs py-1.5"
          />
        </div>
        <p className="text-xs text-gray-400 ml-auto">
          {filtered.length} of {data.length} records
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && toggleSort(col.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide
                              whitespace-nowrap select-none
                              ${col.sortable !== false ? 'cursor-pointer hover:text-gray-900 hover:bg-gray-100' : ''}`}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && sortK === col.key && (
                      <svg className="h-3 w-3 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                          d={sortD === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                      </svg>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No matching records.
                </td>
              </tr>
            ) : paginated.map((row, i) => (
              <tr key={i} className={`hover:bg-primary-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-gray-800 whitespace-nowrap">
                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-1">
            <button onClick={() => setPage(1)} disabled={page === 1}
              className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">«</button>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
              className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">‹</button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              if (pg < 1 || pg > totalPages) return null
              return (
                <button key={pg} onClick={() => setPage(pg)}
                  className={`px-2.5 py-1 text-xs rounded border ${
                    pg === page
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}>{pg}</button>
              )
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
              className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">›</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
              className="px-2 py-1 text-xs rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50">»</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────
const SectionHeader = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600 shrink-0">
      {icon}
    </div>
    <div>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  </div>
)

// ─── Custom Recharts tooltip ──────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-xl px-4 py-2 text-xs">
      {label && <p className="font-semibold text-gray-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

// ─── KPI icon SVGs ────────────────────────────────────────────────
const icons = {
  students : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  teachers : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>,
  subjects : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>,
  classes  : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>,
  present  : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  absent   : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  total    : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
  chart    : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
  report   : <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0119 9.414V19a2 2 0 01-2 2z"/></svg>,
  download : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>,
  calendar : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  filter   : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"/></svg>,
}

// ─── Report type configs ──────────────────────────────────────────
const REPORT_TYPES = [
  { id: 'daily',      label: 'Daily Report',      description: 'All attendance for a single date' },
  { id: 'dateRange',  label: 'Date Range Report',  description: 'Attendance between two dates' },
  { id: 'student',    label: 'Student Report',     description: 'Full attendance history for a student' },
  { id: 'teacher',    label: 'Teacher Report',     description: 'All sessions recorded by a teacher' },
  { id: 'subject',    label: 'Subject Report',     description: 'Attendance data for a subject' },
]

// ─── Column configs per report type ──────────────────────────────
const DAILY_COLS = [
  { key: 'student', label: 'Student' },
  { key: 'subject', label: 'Subject' },
  { key: 'teacher', label: 'Teacher' },
  { key: 'status',  label: 'Status', render: r => <StatusBadge status={r.status} /> },
]

const RANGE_COLS = [
  { key: 'attendance_date', label: 'Date', render: r => fmtDate(r.attendance_date) },
  { key: 'student', label: 'Student' },
  { key: 'subject', label: 'Subject' },
  { key: 'teacher', label: 'Teacher' },
  { key: 'status',  label: 'Status', render: r => <StatusBadge status={r.status} /> },
]

const STUDENT_COLS = [
  { key: 'attendance_date', label: 'Date', render: r => fmtDate(r.attendance_date) },
  { key: 'subject', label: 'Subject' },
  { key: 'teacher', label: 'Teacher' },
  { key: 'status',  label: 'Status', render: r => <StatusBadge status={r.status} /> },
]

const TEACHER_COLS = [
  { key: 'attendance_date', label: 'Date', render: r => fmtDate(r.attendance_date) },
  { key: 'student', label: 'Student' },
  { key: 'subject', label: 'Subject' },
  { key: 'status',  label: 'Status', render: r => <StatusBadge status={r.status} /> },
]

const SUBJECT_COLS = [
  { key: 'attendance_date', label: 'Date', render: r => fmtDate(r.attendance_date) },
  { key: 'student', label: 'Student' },
  { key: 'teacher', label: 'Teacher' },
  { key: 'status',  label: 'Status', render: r => <StatusBadge status={r.status} /> },
]

// ─── Today's date for date input defaults ─────────────────────────
const todayISO = new Date().toISOString().slice(0, 10)
const thirtyDaysAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString().slice(0, 10)


// ═══════════════════════════════════════════════════════════════════
// Main Reports Page
// ═══════════════════════════════════════════════════════════════════
const Reports = ({ addToast }) => {

  // ── KPI state ────────────────────────────────────────────────
  const [kpi, setKpi]           = useState(null)
  const [kpiLoading, setKpiLoading] = useState(true)

  // ── Entity lists for dropdowns ────────────────────────────────
  const [students,  setStudents]  = useState([])
  const [teachers,  setTeachers]  = useState([])
  const [subjects,  setSubjects]  = useState([])

  // ── Report type & filter state ────────────────────────────────
  const [reportType,  setReportType]  = useState('daily')
  const [reportDate,  setReportDate]  = useState(todayISO)
  const [startDate,   setStartDate]   = useState(thirtyDaysAgo)
  const [endDate,     setEndDate]     = useState(todayISO)
  const [studentId,   setStudentId]   = useState('')
  const [teacherId,   setTeacherId]   = useState('')
  const [subjectId,   setSubjectId]   = useState('')

  // ── Report results ────────────────────────────────────────────
  const [reportData,    setReportData]    = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [hasRun,        setHasRun]        = useState(false)

  // ── Export state ──────────────────────────────────────────────
  const [exporting,      setExporting]      = useState(false)
  const [excelExporting, setExcelExporting] = useState(false)

  // ── Chart container refs (for html2canvas capture) ────────────
  const chartRefs = {
    pie     : useRef(null),
    subject : useRef(null),
    teacher : useRef(null),
    trend   : useRef(null),
  }

  // ─ Load KPI + entity lists on mount ──────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const [kpiRes, stuRes, tchRes, subRes] = await Promise.all([
          reportService.getDashboard(),
          studentService.getAll(),
          teacherService.getAll(),
          subjectService.getAll(),
        ])
        setKpi(kpiRes.data)
        setStudents(stuRes.data)
        setTeachers(tchRes.data)
        setSubjects(subRes.data)
      } catch (err) {
        addToast(err.message || 'Failed to load dashboard data.', 'error')
      } finally {
        setKpiLoading(false)
      }
    }
    load()
  }, [addToast])

  // ─ Auto-run daily report on first load ───────────────────────
  useEffect(() => {
    runReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─ Run report ─────────────────────────────────────────────────
  const runReport = useCallback(async () => {
    setReportLoading(true)
    setHasRun(true)
    setReportData(null)
    try {
      let res
      if (reportType === 'daily')     res = await reportService.getDailyReport(reportDate)
      else if (reportType === 'dateRange') res = await reportService.getDateRangeReport(startDate, endDate)
      else if (reportType === 'student' && studentId) res = await reportService.getStudentReport(studentId)
      else if (reportType === 'teacher' && teacherId) res = await reportService.getTeacherReport(teacherId)
      else if (reportType === 'subject' && subjectId) res = await reportService.getSubjectReport(subjectId)
      else {
        addToast('Please select a filter value to run this report.', 'warning')
        setReportLoading(false)
        return
      }
      setReportData(res.data)
    } catch (err) {
      addToast(err.message || 'Failed to load report.', 'error')
      setReportData([])
    } finally {
      setReportLoading(false)
    }
  }, [reportType, reportDate, startDate, endDate, studentId, teacherId, subjectId, addToast])

  // ─ Export CSV (client-side, respects current filters) ─────────
  const handleCsvExport = () => {
    if (!reportData || reportData.length === 0) {
      addToast('Run a report first, then export CSV.', 'warning')
      return
    }
    try {
      exportToCsv(reportData, reportTitle)
      addToast('CSV exported successfully.', 'success')
    } catch (err) {
      addToast(err.message || 'CSV export failed.', 'error')
    }
  }

  // ─ Export Excel (.xlsx) – 3 sheets + chart screenshots ────────
  const handleExcelExport = async () => {
    if (!reportData || reportData.length === 0) {
      addToast('Run a report first, then export Excel.', 'warning')
      return
    }
    setExcelExporting(true)
    addToast('Generating Excel report — capturing charts…', 'info')
    try {
      // Collect live chart DOM nodes
      const chartElements = Object.values(chartRefs)
        .map(r => r.current)
        .filter(Boolean)

      const chartImages = await captureChartImages(chartElements)

      await exportToExcel({
        kpi,
        reportData,
        reportTitle,
        chartImages,
      })

      addToast(`Excel report downloaded (${chartImages.length} chart${chartImages.length !== 1 ? 's' : ''} embedded).`, 'success')
    } catch (err) {
      console.error('Excel export error:', err)
      addToast(err.message || 'Excel export failed.', 'error')
    } finally {
      setExcelExporting(false)
    }
  }

  // ─ Derive chart data from report rows ─────────────────────────
  const charts = useMemo(() => deriveCharts(reportData), [reportData])

  // ─ Attendance % for KPI ───────────────────────────────────────
  const attendancePct = useMemo(() => {
    if (!kpi || !kpi.today_attendance) return null
    return Math.round((kpi.present_today / kpi.today_attendance) * 100)
  }, [kpi])

  // ─ Pick correct columns per report type ───────────────────────
  const reportColumns = useMemo(() => {
    switch (reportType) {
      case 'daily':     return DAILY_COLS
      case 'dateRange': return RANGE_COLS
      case 'student':   return STUDENT_COLS
      case 'teacher':   return TEACHER_COLS
      case 'subject':   return SUBJECT_COLS
      default:          return RANGE_COLS
    }
  }, [reportType])

  // ─ Selected entity name for table heading ─────────────────────
  const reportTitle = useMemo(() => {
    const t = REPORT_TYPES.find(r => r.id === reportType)
    if (!t) return 'Report'
    if (reportType === 'student') {
      const s = students.find(x => String(x.student_id) === String(studentId))
      return s ? `Student Report – ${s.first_name} ${s.last_name}` : t.label
    }
    if (reportType === 'teacher') {
      const t2 = teachers.find(x => String(x.teacher_id) === String(teacherId))
      return t2 ? `Teacher Report – ${t2.first_name} ${t2.last_name}` : t.label
    }
    if (reportType === 'subject') {
      const s = subjects.find(x => String(x.subject_id) === String(subjectId))
      return s ? `Subject Report – ${s.subject_name}` : t.label
    }
    return t.label
  }, [reportType, students, teachers, subjects, studentId, teacherId, subjectId])

  // ─ KPI cards config ───────────────────────────────────────────
  const kpiCards = [
    { title: 'Total Students',  value: kpi?.total_students,  gradient: 'from-blue-600 to-blue-700',    icon: icons.students },
    { title: 'Total Teachers',  value: kpi?.total_teachers,  gradient: 'from-violet-600 to-violet-700', icon: icons.teachers },
    { title: 'Total Subjects',  value: kpi?.total_subjects,  gradient: 'from-teal-500 to-teal-600',    icon: icons.subjects },
    { title: 'Total Classes',   value: kpi?.total_classes,   gradient: 'from-amber-500 to-amber-600',  icon: icons.classes },
    { title: 'Today\'s Records',value: kpi?.today_attendance,gradient: 'from-slate-600 to-slate-700',  icon: icons.total },
    { title: 'Present Today',   value: kpi?.present_today,   gradient: 'from-emerald-500 to-emerald-600', icon: icons.present,
      sub: attendancePct !== null ? `${attendancePct}% attendance rate` : undefined },
    { title: 'Absent Today',    value: kpi?.absent_today,    gradient: 'from-rose-500 to-rose-600',    icon: icons.absent },
  ]

  // ─── RENDER ───────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Reports &amp; Analytics
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor attendance trends, student performance, and institutional insights in real time.
          </p>
        </div>
        {/* Export buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* CSV — filtered current data */}
          <button
            id="btn-export-csv"
            onClick={handleCsvExport}
            disabled={exporting || !reportData || reportData.length === 0}
            title="Export current filtered data as CSV"
            className="btn-secondary"
          >
            {icons.download}
            Export CSV
          </button>

          {/* Excel — 3 sheets with charts */}
          <button
            id="btn-export-excel"
            onClick={handleExcelExport}
            disabled={excelExporting || !reportData || reportData.length === 0}
            title="Export Excel report with 3 sheets and embedded charts"
            className="btn-primary"
          >
            {excelExporting ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
              </svg>
            )}
            {excelExporting ? 'Generating…' : 'Export Excel'}
          </button>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────── */}
      <section aria-label="Key performance indicators">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {kpiCards.map(card => (
            <KpiCard key={card.title} {...card} loading={kpiLoading} />
          ))}
        </div>
      </section>

      {/* ── Filter Panel ────────────────────────────────────── */}
      <section aria-label="Report filters">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-500">{icons.filter}</span>
            <h2 className="text-sm font-semibold text-gray-900">Report Filters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Report type */}
            <div>
              <label className="label" htmlFor="select-report-type">Report Type</label>
              <select
                id="select-report-type"
                value={reportType}
                onChange={e => { setReportType(e.target.value); setReportData(null); setHasRun(false) }}
                className="input"
              >
                {REPORT_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Daily date picker */}
            {reportType === 'daily' && (
              <div>
                <label className="label" htmlFor="input-daily-date">Date</label>
                <input id="input-daily-date" type="date" value={reportDate}
                  onChange={e => setReportDate(e.target.value)}
                  max={todayISO} className="input" />
              </div>
            )}

            {/* Date range pickers */}
            {reportType === 'dateRange' && (<>
              <div>
                <label className="label" htmlFor="input-start-date">Start Date</label>
                <input id="input-start-date" type="date" value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  max={endDate} className="input" />
              </div>
              <div>
                <label className="label" htmlFor="input-end-date">End Date</label>
                <input id="input-end-date" type="date" value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  min={startDate} max={todayISO} className="input" />
              </div>
            </>)}

            {/* Student selector */}
            {reportType === 'student' && (
              <div>
                <label className="label" htmlFor="select-student">Student</label>
                <select id="select-student" value={studentId}
                  onChange={e => setStudentId(e.target.value)} className="input">
                  <option value="">Select student…</option>
                  {students.map(s => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.first_name} {s.last_name} ({s.roll_number})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Teacher selector */}
            {reportType === 'teacher' && (
              <div>
                <label className="label" htmlFor="select-teacher">Teacher</label>
                <select id="select-teacher" value={teacherId}
                  onChange={e => setTeacherId(e.target.value)} className="input">
                  <option value="">Select teacher…</option>
                  {teachers.map(t => (
                    <option key={t.teacher_id} value={t.teacher_id}>
                      {t.first_name} {t.last_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subject selector */}
            {reportType === 'subject' && (
              <div>
                <label className="label" htmlFor="select-subject">Subject</label>
                <select id="select-subject" value={subjectId}
                  onChange={e => setSubjectId(e.target.value)} className="input">
                  <option value="">Select subject…</option>
                  {subjects.map(s => (
                    <option key={s.subject_id} value={s.subject_id}>
                      {s.subject_name} ({s.subject_code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Run button */}
            <div className="flex items-end">
              <button
                id="btn-run-report"
                onClick={runReport}
                disabled={reportLoading}
                className="btn-primary w-full justify-center"
              >
                {reportLoading
                  ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Running…</>
                  : <>{icons.chart} Run Report</>
                }
              </button>
            </div>
          </div>

          {/* Report type description */}
          {REPORT_TYPES.find(r => r.id === reportType)?.description && (
            <p className="mt-3 text-xs text-gray-400">
              ℹ️ {REPORT_TYPES.find(r => r.id === reportType).description}
            </p>
          )}
        </div>
      </section>

      {/* ── Charts Section ──────────────────────────────────── */}
      {hasRun && (
        <section aria-label="Analytics charts">
          <div className="flex items-center gap-2 mb-4">
            <SectionHeader
              icon={icons.chart}
              title="Visual Analytics"
              subtitle="Charts generated from the current report data"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">

            {/* Chart 1: Present vs Absent Pie */}
            <ChartCard
              title="Present vs Absent"
              subtitle="Overall attendance breakdown"
              loading={reportLoading}
              isEmpty={!charts}
              innerRef={chartRefs.pie}
            >
              {charts && (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={charts.pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      paddingAngle={4} dataKey="value" label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      } labelLine={false}>
                      {charts.pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <ReTooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Chart 2: Attendance by Subject */}
            <ChartCard
              title="Attendance by Subject"
              subtitle="Present & absent count per subject"
              loading={reportLoading}
              isEmpty={!charts || charts.subjectData.length === 0}
              innerRef={chartRefs.subject}
            >
              {charts && charts.subjectData.length > 0 && (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={charts.subjectData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <ReTooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Present" fill={COLORS.present} radius={[4,4,0,0]} />
                    <Bar dataKey="Absent"  fill={COLORS.absent}  radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Chart 3: Attendance by Teacher */}
            <ChartCard
              title="Attendance by Teacher"
              subtitle="Present & absent count per teacher"
              loading={reportLoading}
              isEmpty={!charts || charts.teacherData.length === 0}
              innerRef={chartRefs.teacher}
            >
              {charts && charts.teacherData.length > 0 && (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={charts.teacherData} layout="vertical"
                    margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="teacher" width={90} tick={{ fontSize: 10 }} />
                    <ReTooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Present" fill={COLORS.teal}   radius={[0,4,4,0]} />
                    <Bar dataKey="Absent"  fill={COLORS.rose}   radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Chart 4: Daily Trend (only for reports with dates) */}
            {charts && charts.trendData.length > 1 && (
              <div className="lg:col-span-2 xl:col-span-3">
                <ChartCard
                  title="Attendance Trend Over Time"
                  subtitle="Daily present & absent count across the selected period"
                  loading={reportLoading}
                  isEmpty={false}
                  innerRef={chartRefs.trend}
                >
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={charts.trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={COLORS.present} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.present} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={COLORS.absent}  stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.absent}  stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <ReTooltip content={<CustomTooltip />} />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                      <Area type="monotone" dataKey="Present" stroke={COLORS.present}
                        fill="url(#gradPresent)" strokeWidth={2} dot={{ r: 3 }} />
                      <Area type="monotone" dataKey="Absent"  stroke={COLORS.absent}
                        fill="url(#gradAbsent)"  strokeWidth={2} dot={{ r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Report Table ─────────────────────────────────────── */}
      {hasRun && (
        <section aria-label="Report data table">
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <SectionHeader
                icon={icons.report}
                title={reportTitle}
                subtitle={reportData ? `${reportData.length} record${reportData.length !== 1 ? 's' : ''}` : undefined}
              />
              {/* Summary badges */}
              {reportData && reportData.length > 0 && (
                <div className="flex gap-2 shrink-0">
                  <span className="badge-green">
                    ✓ {reportData.filter(r => r.status === 'Present').length} Present
                  </span>
                  <span className="badge-red">
                    ✗ {reportData.filter(r => r.status === 'Absent').length} Absent
                  </span>
                </div>
              )}
            </div>

            <ReportTable
              columns={reportColumns}
              data={reportData}
              loading={reportLoading}
              pageSize={12}
            />
          </div>
        </section>
      )}

      {/* ── Welcome state (before first run) ────────────────── */}
      {!hasRun && (
        <div className="card p-12 flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-400">
            {icons.chart}
          </div>
          <h3 className="text-base font-semibold text-gray-700">Ready to generate a report</h3>
          <p className="text-sm text-gray-400 max-w-sm">
            Select a report type and date or entity above, then click
            <strong> Run Report</strong> to see live analytics and data.
          </p>
        </div>
      )}
    </div>
  )
}

export default Reports
