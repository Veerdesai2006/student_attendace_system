/**
 * Attendance.jsx
 * ---------------
 * Full CRUD page for Attendance – Phase 7.
 *
 * APIs consumed:
 *   GET    /attendance
 *   POST   /attendance
 *   PUT    /attendance/:attendance_id
 *   DELETE /attendance/:attendance_id
 *   GET    /students
 *   GET    /subjects
 *   GET    /teachers
 *   GET    /attendance/percentage/:student_id
 *
 * Exact Backend Keys:
 *   attendance_id, student_id, subject_id, teacher_id
 *
 * Error handling:
 *   404 -> "Attendance record not found"
 *   400 -> Backend message
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import Modal             from '../components/Modal'
import Table             from '../components/Table'
import Loader            from '../components/Loader'
import ConfirmDialog     from '../components/ConfirmDialog'
import AttendanceForm    from '../components/AttendanceForm'
import attendanceService from '../services/attendanceService'
import studentService    from '../services/studentService'
import subjectService    from '../services/subjectService'
import teacherService    from '../services/teacherService'

const extractError = (err, fallback = 'An unexpected error occurred.') => {
  const msg = err?.message
  if (!msg) return fallback
  if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
    return 'Attendance record not found.'
  }
  return msg
}

const Attendance = ({ addToast }) => {
  // ── Data state ───────────────────────────────────────────────
  const [attendance, setAttendance] = useState([])
  const [students, setStudents]     = useState([])
  const [subjects, setSubjects]     = useState([])
  const [teachers, setTeachers]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  // ── Percentage state ─────────────────────────────────────────
  const [pctStudentId, setPctStudentId] = useState('')
  const [pctData, setPctData]           = useState(null)
  const [pctLoading, setPctLoading]     = useState(false)

  // ── Modal / form state ───────────────────────────────────────
  const [modalOpen, setModalOpen]       = useState(false)
  const [editRecord, setEditRecord]     = useState(null)
  const [formLoading, setFormLoading]   = useState(false)
  const [serverError, setServerError]   = useState(null)

  // ── Delete dialog state ──────────────────────────────────────
  const [confirmOpen, setConfirmOpen]     = useState(false)
  const [deleteTarget, setDeleteTarget]   = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ── Search ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')

  // ── Fetch all data on mount ──────────────────────────────────
  const loadInitialData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [attRes, stuRes, subRes, tchRes] = await Promise.all([
        attendanceService.getAll(),
        studentService.getAll(),
        subjectService.getAll(),
        teacherService.getAll(),
      ])
      setAttendance(attRes.data)
      setStudents(stuRes.data)
      setSubjects(subRes.data)
      setTeachers(tchRes.data)
    } catch (err) {
      const msg = extractError(err, 'Failed to load initial data.')
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { loadInitialData() }, [loadInitialData])

  // Refetch only attendance list after mutations
  const loadAttendance = async () => {
    try {
      const res = await attendanceService.getAll()
      setAttendance(res.data)
    } catch (err) {
      addToast('Failed to refresh attendance list.', 'error')
    }
  }

  // ── Client-side search ───────────────────────────────────────
  const filteredAttendance = useMemo(() => {
    if (!searchQuery.trim()) return attendance
    const q = searchQuery.toLowerCase()
    return attendance.filter((a) => {
      const stuName = `${a.first_name || ''} ${a.last_name || ''}`.trim()
      const tchName = `${a.teacher_first_name || ''} ${a.teacher_last_name || ''}`.trim()
      
      return [
        stuName,
        tchName,
        a.subject_name ?? '',
        a.status ?? '',
      ].some((val) => val.toLowerCase().includes(q))
    })
  }, [attendance, searchQuery])

  // ── Handle Percentage ────────────────────────────────────────
  const fetchPercentage = async () => {
    if (!pctStudentId) {
      addToast('Please select a student to check percentage.', 'error')
      return
    }
    setPctLoading(true)
    setPctData(null)
    try {
      const res = await attendanceService.getPercentage(pctStudentId)
      // Standardize the shape defensively just in case backend keys are slightly different
      setPctData({
        student_name: res.data.student_name || 'Student',
        total_classes: res.data.total_classes || 0,
        present_classes: res.data.present_classes || 0,
        absent_classes: res.data.absent_classes || 0,
        attendance_percentage: res.data.attendance_percentage || 0
      })
    } catch (err) {
      addToast(extractError(err, 'Failed to fetch attendance percentage.'), 'error')
    } finally {
      setPctLoading(false)
    }
  }

  // ── Modal Actions ────────────────────────────────────────────
  const handleAdd = () => {
    setEditRecord(null)
    setServerError(null)
    setModalOpen(true)
  }

  const handleEdit = (record) => {
    if (!record.attendance_id) {
      addToast('Cannot edit: attendance_id missing.', 'error')
      return
    }
    setEditRecord(record)
    setServerError(null)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    if (formLoading) return
    setModalOpen(false)
    setEditRecord(null)
    setServerError(null)
  }

  const handleSubmit = async (formData) => {
    setFormLoading(true)
    setServerError(null)
    try {
      if (editRecord) {
        await attendanceService.update(editRecord.attendance_id, formData)
        addToast('Attendance updated successfully', 'success')
      } else {
        await attendanceService.create(formData)
        addToast('Attendance added successfully', 'success')
      }
      setModalOpen(false)
      setEditRecord(null)
      loadAttendance() // Refresh main table
      if (pctStudentId) fetchPercentage() // refresh stats if visible
    } catch (err) {
      const msg = extractError(err)
      setServerError(msg)
      addToast(msg, 'error')
    } finally {
      setFormLoading(false)
    }
  }

  // ── Delete Actions ───────────────────────────────────────────
  const handleDeleteClick = (record) => {
    setDeleteTarget(record)
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    if (!deleteTarget.attendance_id) {
      addToast('Cannot delete: attendance_id missing.', 'error')
      setConfirmOpen(false)
      return
    }

    setDeleteLoading(true)
    try {
      await attendanceService.remove(deleteTarget.attendance_id)
      addToast('Attendance deleted successfully', 'success')
      setConfirmOpen(false)
      setDeleteTarget(null)
      loadAttendance()
      if (pctStudentId) fetchPercentage()
    } catch (err) {
      addToast(extractError(err, 'Failed to delete attendance.'), 'error')
      setConfirmOpen(false)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    if (deleteLoading) return
    setConfirmOpen(false)
    setDeleteTarget(null)
  }

  // ── Columns ──────────────────────────────────────────────────
  const columns = [
    {
      key: 'attendance_id',
      label: 'ID',
      render: (row) => (
        <span className="font-mono text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          {row.attendance_id}
        </span>
      ),
    },
    {
      key: 'student_name',
      label: 'Student',
      render: (row) => (
        <span className="font-medium">
          {`${row.first_name || ''} ${row.last_name || ''}`.trim() || '—'}
        </span>
      ),
    },
    { 
      key: 'teacher_name', 
      label: 'Teacher',
      render: (row) => (
        <span>
          {`${row.teacher_first_name || ''} ${row.teacher_last_name || ''}`.trim() || '—'}
        </span>
      )
    },
    {
      key: 'subject_name',
      label: 'Subject',
      render: (row) => <span className="badge-blue">{row.subject_name}</span>,
    },
    {
      key: 'attendance_date',
      label: 'Date',
      render: (row) => (
        <span className="text-gray-600">
          {row.attendance_date ? new Date(row.attendance_date).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const isPresent = row.status?.toLowerCase() === 'present'
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              isPresent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {row.status}
          </span>
        )
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            id={`edit-attendance-${row.attendance_id}`}
            onClick={() => handleEdit(row)}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            id={`delete-attendance-${row.attendance_id}`}
            onClick={() => handleDeleteClick(row)}
            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage daily student attendance records
          </p>
        </div>
        <button
          id="add-attendance-btn"
          onClick={handleAdd}
          className="btn-primary self-start sm:self-auto"
          disabled={loading}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Attendance
        </button>
      </div>

      {error && !loading && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={loadInitialData} className="text-xs font-medium text-red-700 underline hover:no-underline shrink-0">
            Retry
          </button>
        </div>
      )}

      {/* ── Percentage Card ──────────────────────────────────── */}
      <div className="card p-5 border-l-4 border-primary-500">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Check Student Attendance Percentage</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full max-w-sm">
            <label htmlFor="pct_student_id" className="label">Select Student</label>
            <select
              id="pct_student_id"
              className="input mt-1"
              value={pctStudentId}
              onChange={(e) => setPctStudentId(e.target.value)}
              disabled={loading || pctLoading}
            >
              <option value="">— Choose a student —</option>
              {students.map((stu) => (
                <option key={stu.student_id} value={String(stu.student_id)}>
                  {stu.roll_number} - {stu.first_name} {stu.last_name}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn-primary"
            onClick={fetchPercentage}
            disabled={!pctStudentId || loading || pctLoading}
          >
            {pctLoading ? 'Checking...' : 'Check Percentage'}
          </button>
        </div>

        {/* Display Results */}
        {pctData && !pctLoading && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-gray-500">Student Name</h3>
                <p className="text-lg font-semibold text-gray-900">{pctData.student_name}</p>
              </div>
              <div className="flex gap-8">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total</h3>
                  <p className="text-xl font-bold text-gray-800">{pctData.total_classes}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Present</h3>
                  <p className="text-xl font-bold text-green-600">{pctData.present_classes}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Absent</h3>
                  <p className="text-xl font-bold text-red-600">{pctData.absent_classes}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">Attendance Percentage</span>
                <span className="text-sm font-bold text-gray-900">{pctData.attendance_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full ${
                    pctData.attendance_percentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, pctData.attendance_percentage))}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main card: search + table ─────────────────────────── */}
      <div className="card">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-gray-100">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="attendance-search-input"
              type="text"
              placeholder="Search by student, teacher, subject or status…"
              className="input pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {!loading && (
            <span className="shrink-0 text-xs text-gray-500">
              {filteredAttendance.length} of {attendance.length} record{attendance.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <Loader />
        ) : (
          <Table
            columns={columns}
            data={filteredAttendance}
            emptyMsg={
              searchQuery
                ? `No records match "${searchQuery}".`
                : 'No attendance records found.'
            }
          />
        )}
      </div>

      {/* ── Add / Edit Modal ──────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editRecord ? 'Update Attendance Status' : 'Add New Attendance'}
        size="lg"
      >
        <AttendanceForm
          initialData={editRecord}
          students={students}
          subjects={subjects}
          teachers={teachers}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={formLoading}
          serverError={serverError}
        />
      </Modal>

      {/* ── Delete Confirmation Dialog ────────────────────────── */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Attendance Record"
        message="Are you sure you want to delete this attendance record? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
      />
    </div>
  )
}

export default Attendance
