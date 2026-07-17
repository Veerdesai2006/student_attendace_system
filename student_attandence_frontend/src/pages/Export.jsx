/**
 * Export.jsx
 * -----------
 * Export Data page – full CSV + Excel export from the backend.
 *
 * Two export options:
 *  1. Export Full Database CSV  → GET /api/export/attendance (backend, all records)
 *  2. Go to Reports page for filtered exports (CSV & Excel with charts)
 *
 * Note: Filtered CSV and Excel with charts are available on the Reports page
 * because they require an active report context (filters + rendered charts).
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import exportService from '../services/exportService'

const Export = ({ addToast }) => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const extractBlobError = async (err) => {
    let msg = 'Failed to export.'
    if (err.response && err.response.data instanceof Blob) {
      try {
        const text = await err.response.data.text()
        const json = JSON.parse(text)
        msg = json.message || msg
      } catch (_) { /* ignore */ }
    } else if (err.message) {
      msg = err.message
    }
    if (msg.toLowerCase().includes('network error')) {
      return 'Could not connect to the backend server.'
    }
    return msg
  }

  const handleExportAll = async () => {
    setLoading(true)
    try {
      const response    = await exportService.downloadAttendanceCsv()
      const blob        = new Blob([response.data], { type: 'text/csv' })
      const downloadUrl = window.URL.createObjectURL(blob)
      const link        = Object.assign(document.createElement('a'), {
        href     : downloadUrl,
        download : 'attendance_full.csv',
      })
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)
      addToast('Full attendance CSV exported successfully.', 'success')
    } catch (err) {
      const errorMsg = await extractBlobError(err)
      addToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* ── Page Header ────────────────────────────────────────── */}
      <div>
        <h1 className="page-title">Export Data</h1>
        <p className="mt-1 text-sm text-gray-500">
          Download attendance records for offline use, backup, or reporting.
        </p>
      </div>

      {/* ── Option 1: Full Database CSV ──────────────────────── */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Export Full Attendance CSV</h2>
              <p className="mt-1 text-sm text-gray-600 max-w-lg">
                Download the complete attendance database as a CSV file — every record, all students,
                all dates, all subjects. Powered directly by the backend.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="badge-green">All records</span>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">UTF-8</span>
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Backend CSV</span>
              </div>
            </div>
          </div>

          <button
            id="btn-export-attendance"
            onClick={handleExportAll}
            disabled={loading}
            className="btn-primary shrink-0 min-w-[180px] justify-center"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Exporting…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Export All CSV
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Option 2: Filtered Reports + Excel ──────────────── */}
      <div className="card p-6 border-2 border-primary-200 bg-primary-50/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">Filtered CSV & Excel Report</h2>
                <span className="inline-flex items-center rounded-full bg-primary-600 px-2 py-0.5 text-xs font-bold text-white">⭐ New</span>
              </div>
              <p className="mt-1 text-sm text-gray-600 max-w-lg">
                Export data filtered by date, student, teacher, or subject. Includes a
                professional <strong>Excel (.xlsx)</strong> workbook with 3 sheets:
                Dashboard Summary, Attendance Data, and Charts (embedded screenshots of
                the live analytics charts).
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="badge-green">Filtered data</span>
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Excel .xlsx</span>
                <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700">3 Sheets</span>
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Charts Embedded</span>
              </div>
            </div>
          </div>

          <button
            id="btn-goto-reports"
            onClick={() => navigate('/reports')}
            className="btn-secondary shrink-0 min-w-[180px] justify-center"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
            Open Reports
          </button>
        </div>
      </div>

      {/* ── Info panel ───────────────────────────────────────── */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">📊 Excel Report Contents</p>
        <ul className="list-disc list-inside space-y-0.5 text-blue-700">
          <li><strong>Sheet 1 – Dashboard Summary:</strong> KPI cards, institution overview, today's attendance</li>
          <li><strong>Sheet 2 – Attendance Data:</strong> Styled table with frozen headers, auto-filter, alt rows, status colouring</li>
          <li><strong>Sheet 3 – Charts:</strong> Live screenshots of Present vs Absent, By Subject, By Teacher, and Trend charts</li>
        </ul>
        <p className="mt-2 text-xs text-blue-600">
          Go to the <strong>Reports</strong> page, run any report, then click <strong>Export Excel</strong>.
        </p>
      </div>

    </div>
  )
}

export default Export
