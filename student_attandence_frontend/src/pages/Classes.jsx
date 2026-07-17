/**
 * Classes.jsx
 * ------------
 * Full CRUD page for Classes – Phase 4.
 *
 * APIs consumed (no invented endpoints):
 *   GET    /classes           – list all classes
 *   POST   /classes           – create a class
 *   PUT    /classes/:class_id – update a class
 *   DELETE /classes/:class_id – delete a class
 *
 * Backend field names (never use generic "id"):
 *   class_id   – primary key
 *   class_name – class label
 *   division   – division / section
 *
 * Features:
 *   ✔ List all classes in a table
 *   ✔ Client-side search by class_name and division
 *   ✔ Record count badge
 *   ✔ Add class (modal form)
 *   ✔ Edit class (modal form pre-filled)
 *   ✔ Delete with ConfirmDialog
 *   ✔ Loading spinner on initial fetch
 *   ✔ Per-action loading states (save, delete)
 *   ✔ Success & error toasts
 *   ✔ Backend validation errors shown inside the form
 *   ✔ Fully responsive layout
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import Modal         from '../components/Modal'
import Table         from '../components/Table'
import Loader        from '../components/Loader'
import ConfirmDialog from '../components/ConfirmDialog'
import ClassForm     from '../components/ClassForm'
import classService  from '../services/classService'

// ── Classes page ─────────────────────────────────────────────────
const Classes = ({ addToast }) => {
  // ── Data state ───────────────────────────────────────────────
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)   // initial page load
  const [error,   setError]   = useState(null)   // initial load error

  // ── Modal / form state ───────────────────────────────────────
  const [modalOpen,   setModalOpen]   = useState(false)
  const [editClass,   setEditClass]   = useState(null)   // null = Add mode
  const [formLoading, setFormLoading] = useState(false)
  const [serverError, setServerError] = useState(null)

  // ── Delete dialog state ──────────────────────────────────────
  const [confirmOpen,   setConfirmOpen]   = useState(false)
  const [deleteTarget,  setDeleteTarget]  = useState(null)   // class object
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ── Search ───────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')

  // ── Fetch all classes from backend ───────────────────────────
  const loadClasses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await classService.getAll()
      setClasses(response.data)
    } catch (err) {
      const msg = err.message || 'Failed to load classes.'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => { loadClasses() }, [loadClasses])

  // ── Client-side search ────────────────────────────────────────
  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classes
    const q = searchQuery.toLowerCase()
    return classes.filter((cls) =>
      [cls.class_name ?? '', cls.division ?? ''].some((val) =>
        val.toLowerCase().includes(q)
      )
    )
  }, [classes, searchQuery])

  // ── Open Add modal ───────────────────────────────────────────
  const handleAdd = () => {
    setEditClass(null)
    setServerError(null)
    setModalOpen(true)
  }

  // ── Open Edit modal ──────────────────────────────────────────
  const handleEdit = (cls) => {
    setEditClass(cls)
    setServerError(null)
    setModalOpen(true)
  }

  // ── Close modal ──────────────────────────────────────────────
  const handleCloseModal = () => {
    if (formLoading) return   // don't close while saving
    setModalOpen(false)
    setEditClass(null)
    setServerError(null)
  }

  // ── Submit Add or Edit ───────────────────────────────────────
  const handleSubmit = async (formData) => {
    setFormLoading(true)
    setServerError(null)
    try {
      if (editClass) {
        // PUT /classes/:class_id – use class_id (backend primary key)
        await classService.update(editClass.class_id, formData)
        addToast(`Class "${formData.class_name} – ${formData.division}" updated.`, 'success')
      } else {
        // POST /classes
        await classService.create(formData)
        addToast(`Class "${formData.class_name} – ${formData.division}" added.`, 'success')
      }
      setModalOpen(false)
      setEditClass(null)
      loadClasses()   // refresh list from backend
    } catch (err) {
      const msg = err.message || 'An error occurred. Please try again.'
      setServerError(msg)
      addToast(msg, 'error')
    } finally {
      setFormLoading(false)
    }
  }

  // ── Open delete confirmation ─────────────────────────────────
  const handleDeleteClick = (cls) => {
    setDeleteTarget(cls)
    setConfirmOpen(true)
  }

  // ── Confirm delete ───────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      // DELETE /classes/:class_id – use class_id (backend primary key)
      await classService.remove(deleteTarget.class_id)
      addToast(
        `Class "${deleteTarget.class_name} – ${deleteTarget.division}" deleted.`,
        'success'
      )
      setConfirmOpen(false)
      setDeleteTarget(null)
      loadClasses()
    } catch (err) {
      const msg = err.message || 'Failed to delete class.'
      addToast(msg, 'error')
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
  // React key for each row uses class_id (backend primary key)
  const columns = [
    {
      key:   'class_name',
      label: 'Class Name',
      render: (row) => (
        <span className="font-medium text-gray-900">{row.class_name}</span>
      ),
    },
    {
      key:   'division',
      label: 'Division',
      render: (row) => (
        <span className="badge-blue">{row.division}</span>
      ),
    },
    {
      key:   'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {/* Edit button */}
          <button
            id={`edit-class-${row.class_id}`}
            onClick={() => handleEdit(row)}
            className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            title="Edit class"
          >
            <svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>

          {/* Delete button */}
          <button
            id={`delete-class-${row.class_id}`}
            onClick={() => handleDeleteClick(row)}
            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
            title="Delete class"
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
          <h1 className="page-title">Classes</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage class groups and divisions
          </p>
        </div>

        <button
          id="add-class-btn"
          onClick={handleAdd}
          className="btn-primary self-start sm:self-auto"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Class
        </button>
      </div>

      {/* ── Initial load error ────────────────────────────────── */}
      {error && !loading && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button
            onClick={loadClasses}
            className="text-xs font-medium text-red-700 underline hover:no-underline shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Main card: search + table ─────────────────────────── */}
      <div className="card">
        {/* Toolbar: search + record count */}
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
              id="class-search-input"
              type="text"
              placeholder="Search by class name or division…"
              className="input pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Record count badge */}
          {!loading && (
            <span className="shrink-0 text-xs text-gray-500">
              {filteredClasses.length} of {classes.length}{' '}
              {classes.length === 1 ? 'class' : 'classes'}
            </span>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <Loader />
        ) : (
          <Table
            columns={columns}
            data={filteredClasses}
            emptyMsg={
              searchQuery
                ? `No classes match "${searchQuery}".`
                : 'No classes found. Click "Add Class" to create one.'
            }
          />
        )}
      </div>

      {/* ── Add / Edit Modal ──────────────────────────────────── */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editClass ? 'Edit Class' : 'Add New Class'}
        size="md"
      >
        <ClassForm
          initialData={editClass}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={formLoading}
          serverError={serverError}
        />
      </Modal>

      {/* ── Delete Confirmation Dialog ────────────────────────── */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Class"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.class_name} – ${deleteTarget.division}"? Students assigned to this class may be affected. This action cannot be undone.`
            : 'Are you sure you want to delete this class?'
        }
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={deleteLoading}
      />
    </div>
  )
}

export default Classes
