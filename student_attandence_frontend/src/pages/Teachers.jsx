/**
 * Teachers.jsx
 * -------------
 * Full CRUD page for Teachers – Phase 6.
 *
 * APIs consumed (no invented endpoints):
 *   GET    /teachers                  – list all teachers
 *   POST   /teachers                  – create a teacher
 *   PUT    /teachers/:teacher_id      – update a teacher
 *   DELETE /teachers/:teacher_id      – delete a teacher
 *
 * Backend field names (exact – never use generic "id"):
 *   teacher_id – primary key for update / delete / React keys
 *   first_name – first name
 *   last_name  – last name
 *   contact    – phone / contact number (NOT "phone", NOT "contact_number")
 *   email      – email address
 *
 * Error handling strategy:
 *   HTTP 404 → "Teacher not found."
 *   HTTP 400 → exact backend message
 *   Delete restriction → exact backend message (e.g., "Cannot delete teacher
 *                         because attendance records exist.")
 *   Guard: never call /teachers/undefined (pre-flight check before every call)
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import Modal          from '../components/Modal'
import Table          from '../components/Table'
import Loader         from '../components/Loader'
import ConfirmDialog  from '../components/ConfirmDialog'
import TeacherForm    from '../components/TeacherForm'
import teacherService from '../services/teacherService'

// ── Error message normaliser ──────────────────────────────────────
/**
 * Converts an Axios error into a user-friendly string.
 * The Axios interceptor in api.js already extracts response.data.message
 * into err.message, so we inspect that directly.
 *
 * @param {Error}  err         – thrown by teacherService
 * @param {string} fallback    – used when no message is available
 * @returns {string}
 */
const extractError = (err, fallback = 'An unexpected error occurred.') => {
  const msg = err?.message
  if (!msg) return fallback

  // 404 – standardise the display message
  if (msg.includes('404') || msg.toLowerCase().includes('not found'))
    return 'Teacher not found.'

  // All other messages (400, restriction, network, etc.) pass through as-is
  return msg
}

// ── Teachers page ────────────────────────────────────────────────
const Teachers = ({ addToast }) => {
  // ── Data state ───────────────────────────────────────────────
  const [teachers, setTeachers] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  // ── Modal / form state ───────────────────────────────────────
  const [modalOpen,    setModalOpen]    = useState(false)
  const [editTeacher,  setEditTeacher]  = useState(null)   // null = Add mode
  const [formLoading,  setFormLoading]  = useState(false)
  const [serverError,  setServerError]  = useState(null)

  // ── Delete dialog state ──────────────────────────────────────
  const [confirmOpen,   setConfirmOpen]   = useState(false)
  const [deleteTarget,  setDeleteTarget]  = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ── Search ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')

  // ── Fetch all teachers from the backend ──────────────────────
  const loadTeachers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await teacherService.getAll()
      setTeachers(response.data)
    } catch (err) {
      const msg = extractError(err, 'Failed to load teachers.')
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { loadTeachers() }, [loadTeachers])

  // ── Client-side search ────────────────────────────────────────
  // Searches across first_name, last_name, contact, email
  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teachers
    const q = searchQuery.toLowerCase()
    return teachers.filter((t) =>
      [
        t.first_name ?? '',
        t.last_name  ?? '',
        t.contact    ?? '',
        t.email      ?? '',
      ].some((val) => val.toLowerCase().includes(q))
    )
  }, [teachers, searchQuery])

  // ── Open Add modal ───────────────────────────────────────────
  const handleAdd = () => {
    setEditTeacher(null)
    setServerError(null)
    setModalOpen(true)
  }

  // ── Open Edit modal (with pre-flight guard) ──────────────────
  const handleEdit = (teacher) => {
    // Guard: never open edit if teacher_id is missing (prevents /undefined)
    if (!teacher.teacher_id) {
      addToast('Cannot edit: teacher_id is missing in the server response.', 'error')
      return
    }
    setEditTeacher(teacher)
    setServerError(null)
    setModalOpen(true)
  }

  // ── Close modal ──────────────────────────────────────────────
  const handleCloseModal = () => {
    if (formLoading) return   // block close while saving
    setModalOpen(false)
    setEditTeacher(null)
    setServerError(null)
  }

  // ── Submit Add or Edit ───────────────────────────────────────
  const handleSubmit = async (formData) => {
    setFormLoading(true)
    setServerError(null)
    try {
      if (editTeacher) {
        // PUT /teachers/:teacher_id – always use teacher_id (backend PK)
        await teacherService.update(editTeacher.teacher_id, formData)
        addToast(
          `Teacher "${formData.first_name} ${formData.last_name}" updated successfully.`,
          'success'
        )
      } else {
        // POST /teachers
        await teacherService.create(formData)
        addToast(
          `Teacher "${formData.first_name} ${formData.last_name}" added successfully.`,
          'success'
        )
      }
      setModalOpen(false)
      setEditTeacher(null)
      loadTeachers()   // always refresh from backend after mutation
    } catch (err) {
      const msg = extractError(err)
      setServerError(msg)      // show inside the form
      addToast(msg, 'error')
    } finally {
      setFormLoading(false)
    }
  }

  // ── Open delete confirmation dialog ──────────────────────────
  const handleDeleteClick = (teacher) => {
    setDeleteTarget(teacher)
    setConfirmOpen(true)
  }

  // ── Confirm delete ───────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    // Guard: never call DELETE /teachers/undefined
    if (!deleteTarget.teacher_id) {
      addToast('Cannot delete: teacher_id is missing in the server response.', 'error')
      setConfirmOpen(false)
      return
    }

    setDeleteLoading(true)
    try {
      // DELETE /teachers/:teacher_id – uses teacher_id (backend PK)
      await teacherService.remove(deleteTarget.teacher_id)
      addToast(
        `Teacher "${deleteTarget.first_name} ${deleteTarget.last_name}" deleted.`,
        'success'
      )
      setConfirmOpen(false)
      setDeleteTarget(null)
      loadTeachers()   // refresh list
    } catch (err) {
      // Passes through exact backend message, e.g.:
      // "Cannot delete teacher because attendance records exist."
      const msg = extractError(err, 'Failed to delete teacher.')
      addToast(msg, 'error')
      setConfirmOpen(false)
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Cancel delete ────────────────────────────────────────────
  const handleDeleteCancel = () => {
    if (deleteLoading) return
    setConfirmOpen(false)
    setDeleteTarget(null)
  }

  // ── Table column definitions ─────────────────────────────────
  // Table.jsx resolves row key as: teacher_id ?? … ?? rowIndex
  const columns = [
    {
      key:   'first_name',
      label: 'First Name',
      render: (row) => (
        <span className="font-medium text-gray-900">{row.first_name}</span>
      ),
    },
    {
      key:   'last_name',
      label: 'Last Name',
      render: (row) => (
        <span className="text-gray-800">{row.last_name}</span>
      ),
    },
    {
      key:   'contact',
      label: 'Contact',
      render: (row) => (
        <span className="font-mono text-sm text-gray-700">
          {row.contact || '—'}
        </span>
      ),
    },
    {
      key:   'email',
      label: 'Email',
      render: (row) => (
        <span className="text-primary-600">{row.email || '—'}</span>
      ),
    },
    {
      key:   'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {/* Edit – button id includes teacher_id for testability */}
          <button
            id={`edit-teacher-${row.teacher_id}`}
            onClick={() => handleEdit(row)}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            title="Edit teacher"
          >
            <svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>

          {/* Delete */}
          <button
            id={`delete-teacher-${row.teacher_id}`}
            onClick={() => handleDeleteClick(row)}
            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
            title="Delete teacher"
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
          <h1 className="page-title">Teachers</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage teacher records and contact details
          </p>
        </div>

        <button
          id="add-teacher-btn"
          onClick={handleAdd}
          className="btn-primary self-start sm:self-auto"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Teacher
        </button>
      </div>

      {/* ── Initial load error banner ─────────────────────────── */}
      {error && !loading && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button
            onClick={loadTeachers}
            className="text-xs font-medium text-red-700 underline hover:no-underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Main card: search + table ─────────────────────────── */}
      <div className="card">
        {/* Toolbar */}
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
              id="teacher-search-input"
              type="text"
              placeholder="Search by name, contact or email…"
              className="input pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Record count badge */}
          {!loading && (
            <span className="shrink-0 text-xs text-gray-500">
              {filteredTeachers.length} of {teachers.length}{' '}
              {teachers.length === 1 ? 'teacher' : 'teachers'}
            </span>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <Loader />
        ) : (
          <Table
            columns={columns}
            data={filteredTeachers}
            emptyMsg={
              searchQuery
                ? `No teachers match "${searchQuery}".`
                : 'No teachers found. Click "Add Teacher" to create one.'
            }
          />
        )}
      </div>

      {/* ── Add / Edit Modal ──────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editTeacher ? 'Edit Teacher' : 'Add New Teacher'}
        size="lg"
      >
        <TeacherForm
          initialData={editTeacher}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={formLoading}
          serverError={serverError}
        />
      </Modal>

      {/* ── Delete Confirmation Dialog ────────────────────────── */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Teacher"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.first_name} ${deleteTarget.last_name}"?\n\nIf attendance records are linked to this teacher, the backend will reject the deletion.`
            : 'Are you sure you want to delete this teacher?'
        }
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
      />
    </div>
  )
}

export default Teachers
