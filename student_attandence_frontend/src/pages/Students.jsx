/**
 * Students.jsx
 * -------------
 * Full CRUD page for Students – Phase 3.
 *
 * APIs consumed (no invented endpoints):
 *   GET    /students          – list all students
 *   POST   /students          – create student
 *   PUT    /students/:id      – update student
 *   DELETE /students/:id      – delete student
 *   GET    /classes           – populate class dropdown
 *
 * Features:
 *   ✔ List with class name resolved from classes list
 *   ✔ Client-side search across all visible fields
 *   ✔ Add student (modal form)
 *   ✔ Edit student (modal form pre-filled)
 *   ✔ Delete with ConfirmDialog
 *   ✔ Loading spinner on initial fetch
 *   ✔ Per-action loading states (save, delete)
 *   ✔ Success & error toasts
 *   ✔ Backend validation errors displayed in form
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import Modal         from '../components/Modal'
import Table         from '../components/Table'
import Loader        from '../components/Loader'
import ConfirmDialog from '../components/ConfirmDialog'
import StudentForm   from '../components/StudentForm'
import studentService from '../services/studentService'
import classService   from '../services/classService'

// ── Students page ────────────────────────────────────────────────
const Students = ({ addToast }) => {
  // ── Data state ───────────────────────────────────────────────
  const [students, setStudents] = useState([])
  const [classes,  setClasses]  = useState([])
  const [loading,  setLoading]  = useState(true)   // initial page load
  const [error,    setError]    = useState(null)    // initial load error

  // ── Modal / form state ───────────────────────────────────────
  const [modalOpen,    setModalOpen]    = useState(false)
  const [editStudent,  setEditStudent]  = useState(null)  // null = add mode
  const [formLoading,  setFormLoading]  = useState(false)
  const [serverError,  setServerError]  = useState(null)

  // ── Delete dialog state ──────────────────────────────────────
  const [confirmOpen,    setConfirmOpen]    = useState(false)
  const [deleteTarget,   setDeleteTarget]   = useState(null)  // student object
  const [deleteLoading,  setDeleteLoading]  = useState(false)

  // ── Search ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')

  // ── Fetch students + classes on mount ───────────────────────
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch both in parallel for speed
      const [studentsRes, classesRes] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
      ])
      setStudents(studentsRes.data)
      setClasses(classesRes.data)
    } catch (err) {
      const msg = err.message || 'Failed to load students.'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { loadData() }, [loadData])

  // ── Resolve class name from class_id ─────────────────────────
  // Build a lookup map keyed by cls.class_id (backend primary key)
  const classMap = useMemo(() => {
    const map = {}
    classes.forEach((cls) => { map[cls.class_id] = `${cls.class_name}${cls.division ? ' - ' + cls.division : ''}` })
    return map
  }, [classes])

  // ── Client-side search filter ─────────────────────────────────
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students
    const q = searchQuery.toLowerCase()
    return students.filter((s) =>
      [
        s.roll_number,
        s.first_name,
        s.last_name,
        s.contact_number,
        s.email,
        classMap[s.class_id] ?? '',
      ].some((val) => String(val).toLowerCase().includes(q))
    )
  }, [students, searchQuery, classMap])

  // ── Open Add modal ───────────────────────────────────────────
  const handleAdd = () => {
    setEditStudent(null)
    setServerError(null)
    setModalOpen(true)
  }

  // ── Open Edit modal ──────────────────────────────────────────
  const handleEdit = (student) => {
    setEditStudent(student)
    setServerError(null)
    setModalOpen(true)
  }

  // ── Close modal ──────────────────────────────────────────────
  const handleCloseModal = () => {
    if (formLoading) return   // prevent accidental close mid-save
    setModalOpen(false)
    setEditStudent(null)
    setServerError(null)
  }

  // ── Submit form (Add or Edit) ────────────────────────────────
  const handleSubmit = async (formData) => {
    setFormLoading(true)
    setServerError(null)
    try {
      if (editStudent) {
        // ── Edit – use student_id (backend primary key) ───────
        await studentService.update(editStudent.student_id, formData)
        addToast('Student updated successfully.', 'success')
      } else {
        // ── Add ───────────────────────────────────────────────
        await studentService.create(formData)
        addToast('Student added successfully.', 'success')
      }
      setModalOpen(false)
      setEditStudent(null)
      loadData()   // refresh the list
    } catch (err) {
      const msg = err.message || 'An error occurred. Please try again.'
      setServerError(msg)
      addToast(msg, 'error')
    } finally {
      setFormLoading(false)
    }
  }

  // ── Confirm delete dialog ────────────────────────────────────
  const handleDeleteClick = (student) => {
    setDeleteTarget(student)
    setConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      // Use student_id (backend primary key), not generic .id
      await studentService.remove(deleteTarget.student_id)
      addToast(`Student "${deleteTarget.first_name} ${deleteTarget.last_name}" deleted.`, 'success')
      setConfirmOpen(false)
      setDeleteTarget(null)
      loadData()
    } catch (err) {
      const msg = err.message || 'Failed to delete student.'
      addToast(msg, 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDeleteCancel = () => {
    if (deleteLoading) return
    setConfirmOpen(false)
    setDeleteTarget(null)
  }

  // ── Table column definitions ─────────────────────────────────
  const columns = [
    {
      key:   'roll_number',
      label: 'Roll No.',
      render: (row) => (
        <span className="font-mono text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
          {row.roll_number}
        </span>
      ),
    },
    { key: 'first_name',  label: 'First Name' },
    { key: 'last_name',   label: 'Last Name' },
    {
      key: 'contact_number',
      label: 'Contact',
      render: (row) => row.contact_number || '—',
    },
    {
      key: 'email',
      label: 'Email',
      render: (row) => (
        <span className="text-primary-600">{row.email}</span>
      ),
    },
    {
      key: 'class_id',
      label: 'Class',
      render: (row) => (
        <span className="badge-blue">
          {classMap[row.class_id] ?? `ID: ${row.class_id}`}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {/* Edit */}
          <button
            onClick={() => handleEdit(row)}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            title="Edit student"
          >
            <svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>

          {/* Delete */}
          <button
            onClick={() => handleDeleteClick(row)}
            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
            title="Delete student"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      ),
    },
  ]

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage all student records
          </p>
        </div>

        <button
          id="add-student-btn"
          onClick={handleAdd}
          className="btn-primary self-start sm:self-auto"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Student
        </button>
      </div>

      {/* ── Initial load error ───────────────────────────────── */}
      {error && !loading && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={loadData} className="text-xs font-medium text-red-700 underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* ── Main card: search + table ────────────────────────── */}
      <div className="card">
        {/* Search bar + record count */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-gray-100">
          {/* Search input */}
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="student-search-input"
              type="text"
              placeholder="Search by name, roll number, email, class…"
              className="input pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Record count badge */}
          {!loading && (
            <span className="shrink-0 text-xs text-gray-500">
              {filteredStudents.length} of {students.length} record{students.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <Loader />
        ) : (
          <Table
            columns={columns}
            data={filteredStudents}
            emptyMsg={
              searchQuery
                ? `No students match "${searchQuery}".`
                : 'No students found. Click "Add Student" to create one.'
            }
          />
        )}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editStudent ? 'Edit Student' : 'Add New Student'}
        size="lg"
      >
        <StudentForm
          initialData={editStudent}
          classes={classes}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={formLoading}
          serverError={serverError}
        />
      </Modal>

      {/* ── Delete Confirmation Dialog ───────────────────────── */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Student"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.first_name} ${deleteTarget.last_name}" (${deleteTarget.roll_number})? This action cannot be undone.`
            : 'Are you sure you want to delete this student?'
        }
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
      />
    </div>
  )
}

export default Students
