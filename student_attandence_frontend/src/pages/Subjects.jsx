/**
 * Subjects.jsx
 * -------------
 * Full CRUD page for Subjects – Phase 5.
 *
 * APIs consumed (no invented endpoints):
 *   GET    /subjects                  – list all subjects
 *   POST   /subjects                  – create a subject
 *   PUT    /subjects/:subject_id      – update a subject
 *   DELETE /subjects/:subject_id      – delete a subject
 *
 * Backend field names (exact – never use generic "id"):
 *   subject_id   – primary key used for update/delete/React keys
 *   subject_name – display name
 *   subject_code – short unique code
 *
 * Error handling:
 *   HTTP 404 → show "Subject not found."
 *   HTTP 400 → show the backend's error message exactly
 *   Delete restriction → show backend's exact message (e.g. "Cannot delete
 *                         subject because attendance records exist.")
 *
 * Features:
 *   ✔ List with subject_name and subject_code columns
 *   ✔ Client-side search by subject_name and subject_code
 *   ✔ Record count badge
 *   ✔ Add subject (modal form)
 *   ✔ Edit subject (modal form pre-filled via subject_id)
 *   ✔ Delete with ConfirmDialog
 *   ✔ Loading spinner on initial fetch
 *   ✔ Per-action loading states (save, delete)
 *   ✔ Success & error toasts
 *   ✔ Backend validation errors shown inside the form
 *   ✔ Fully responsive layout
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import Modal          from '../components/Modal'
import Table          from '../components/Table'
import Loader         from '../components/Loader'
import ConfirmDialog  from '../components/ConfirmDialog'
import SubjectForm    from '../components/SubjectForm'
import subjectService from '../services/subjectService'

// ── Error message normaliser ──────────────────────────────────────
/**
 * Converts an Axios error into a user-friendly string.
 * Respects specific HTTP status codes as required by the spec.
 *
 * @param {Error}  err           – the error thrown by subjectService
 * @param {string} fallbackMsg   – shown if no specific message is available
 * @returns {string}
 */
const extractError = (err, fallbackMsg = 'An unexpected error occurred.') => {
  // The Axios interceptor in api.js already extracts response.data.message
  // into err.message, so we can use that directly.
  const msg = err?.message

  if (!msg) return fallbackMsg

  // HTTP 404 → standardised message
  if (msg.includes('404') || msg.toLowerCase().includes('not found'))
    return 'Subject not found.'

  // All other backend messages (400, restriction errors, etc.) pass through as-is
  return msg
}

// ── Subjects page ────────────────────────────────────────────────
const Subjects = ({ addToast }) => {
  // ── Data state ───────────────────────────────────────────────
  const [subjects, setSubjects] = useState([])
  const [loading,  setLoading]  = useState(true)   // initial page load
  const [error,    setError]    = useState(null)    // initial load error

  // ── Modal / form state ───────────────────────────────────────
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editSubject, setEditSubject] = useState(null)   // null = Add mode
  const [formLoading, setFormLoading] = useState(false)
  const [serverError, setServerError] = useState(null)

  // ── Delete dialog state ──────────────────────────────────────
  const [confirmOpen,   setConfirmOpen]   = useState(false)
  const [deleteTarget,  setDeleteTarget]  = useState(null)   // subject object
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ── Search ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')

  // ── Fetch all subjects from the backend ──────────────────────
  const loadSubjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await subjectService.getAll()
      setSubjects(response.data)
    } catch (err) {
      const msg = extractError(err, 'Failed to load subjects.')
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { loadSubjects() }, [loadSubjects])

  // ── Client-side search filter ─────────────────────────────────
  // Searches across both subject_name and subject_code
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects
    const q = searchQuery.toLowerCase()
    return subjects.filter((s) =>
      [s.subject_name ?? '', s.subject_code ?? ''].some((val) =>
        val.toLowerCase().includes(q)
      )
    )
  }, [subjects, searchQuery])

  // ── Open Add modal ───────────────────────────────────────────
  const handleAdd = () => {
    setEditSubject(null)
    setServerError(null)
    setModalOpen(true)
  }

  // ── Open Edit modal ──────────────────────────────────────────
  const handleEdit = (subject) => {
    setEditSubject(subject)    // the full subject object (includes subject_id)
    setServerError(null)
    setModalOpen(true)
  }

  // ── Close modal (no-op while saving) ─────────────────────────
  const handleCloseModal = () => {
    if (formLoading) return
    setModalOpen(false)
    setEditSubject(null)
    setServerError(null)
  }

  // ── Submit Add or Edit ───────────────────────────────────────
  const handleSubmit = async (formData) => {
    setFormLoading(true)
    setServerError(null)
    try {
      if (editSubject) {
        // PUT /subjects/:subject_id – always use subject_id, never generic .id
        await subjectService.update(editSubject.subject_id, formData)
        addToast(
          `Subject "${formData.subject_name}" (${formData.subject_code}) updated.`,
          'success'
        )
      } else {
        // POST /subjects
        await subjectService.create(formData)
        addToast(
          `Subject "${formData.subject_name}" (${formData.subject_code}) added.`,
          'success'
        )
      }
      setModalOpen(false)
      setEditSubject(null)
      loadSubjects()   // always refresh from the backend after mutation
    } catch (err) {
      const msg = extractError(err)
      setServerError(msg)      // display inside the form
      addToast(msg, 'error')   // also show as toast
    } finally {
      setFormLoading(false)
    }
  }

  // ── Open delete confirmation ─────────────────────────────────
  const handleDeleteClick = (subject) => {
    setDeleteTarget(subject)
    setConfirmOpen(true)
  }

  // ── Confirm delete ───────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      // DELETE /subjects/:subject_id – always use subject_id, never generic .id
      // Guard: make sure subject_id is defined so we never call /subjects/undefined
      if (!deleteTarget.subject_id) {
        throw new Error('Invalid subject: subject_id is missing.')
      }

      await subjectService.remove(deleteTarget.subject_id)
      addToast(
        `Subject "${deleteTarget.subject_name}" deleted.`,
        'success'
      )
      setConfirmOpen(false)
      setDeleteTarget(null)
      loadSubjects()   // refresh list from backend
    } catch (err) {
      // This handles the restriction message:
      // "Cannot delete subject because attendance records exist."
      const msg = extractError(err, 'Failed to delete subject.')
      addToast(msg, 'error')
      // Leave the dialog open so the user can see the error in context
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

  // ── Pre-flight guard: verify subject_id before opening edit ──
  // Prevents sending a PUT to /subjects/undefined if the backend
  // returns a subject without subject_id (misconfiguration safety).
  const safeHandleEdit = (subject) => {
    if (!subject.subject_id) {
      addToast('Cannot edit: subject_id is missing in the response.', 'error')
      return
    }
    handleEdit(subject)
  }

  // ── Table column definitions ─────────────────────────────────
  // The reusable Table component uses the rowKey logic from Table.jsx
  // (subject_id ?? class_id ?? … ?? rowIndex) so keys are always correct.
  const columns = [
    {
      key:   'subject_name',
      label: 'Subject Name',
      render: (row) => (
        <span className="font-medium text-gray-900">{row.subject_name}</span>
      ),
    },
    {
      key:   'subject_code',
      label: 'Subject Code',
      render: (row) => (
        <span className="font-mono text-xs font-semibold tracking-wider text-primary-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded">
          {row.subject_code}
        </span>
      ),
    },
    {
      key:   'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {/* Edit button – id includes subject_id for testability */}
          <button
            id={`edit-subject-${row.subject_id}`}
            onClick={() => safeHandleEdit(row)}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            title="Edit subject"
          >
            <svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>

          {/* Delete button */}
          <button
            id={`delete-subject-${row.subject_id}`}
            onClick={() => handleDeleteClick(row)}
            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
            title="Delete subject"
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
          <h1 className="page-title">Subjects</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage subjects and their codes
          </p>
        </div>

        <button
          id="add-subject-btn"
          onClick={handleAdd}
          className="btn-primary self-start sm:self-auto"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Subject
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
            onClick={loadSubjects}
            className="text-xs font-medium text-red-700 underline hover:no-underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Main card: search + table ─────────────────────────── */}
      <div className="card">
        {/* Toolbar: search input + record count */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-gray-100">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="subject-search-input"
              type="text"
              placeholder="Search by subject name or code…"
              className="input pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Record count */}
          {!loading && (
            <span className="shrink-0 text-xs text-gray-500">
              {filteredSubjects.length} of {subjects.length}{' '}
              {subjects.length === 1 ? 'subject' : 'subjects'}
            </span>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <Loader />
        ) : (
          <Table
            columns={columns}
            data={filteredSubjects}
            emptyMsg={
              searchQuery
                ? `No subjects match "${searchQuery}".`
                : 'No subjects found. Click "Add Subject" to create one.'
            }
          />
        )}
      </div>

      {/* ── Add / Edit Modal ──────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editSubject ? 'Edit Subject' : 'Add New Subject'}
        size="md"
      >
        <SubjectForm
          initialData={editSubject}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={formLoading}
          serverError={serverError}
        />
      </Modal>

      {/* ── Delete Confirmation Dialog ────────────────────────── */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Subject"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.subject_name}" (${deleteTarget.subject_code})?\n\nIf attendance records are linked to this subject, the backend will reject the deletion.`
            : 'Are you sure you want to delete this subject?'
        }
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
      />
    </div>
  )
}

export default Subjects
