/**
 * ClassForm.jsx
 * --------------
 * Controlled form for creating and editing a Class.
 * Used inside a Modal on the Classes page.
 *
 * Props:
 *   initialData {object|null} – pre-filled when editing; null for Add mode
 *   onSubmit    {Function}    – async (payload) => void, called on valid submit
 *   onCancel    {Function}    – closes the modal
 *   loading     {boolean}     – disables the form while the request is in-flight
 *   serverError {string|null} – backend error message to display inside the form
 *
 * Backend field names used (exactly as returned by Flask):
 *   class_name  {string}  – required
 *   division    {string}  – required
 */

import { useState, useEffect } from 'react'

// ── Empty form state ─────────────────────────────────────────────
const EMPTY_FORM = {
  class_name: '',
  division:   '',
}

// ── Client-side validation ────────────────────────────────────────
const validate = (fields) => {
  const errors = {}

  if (!fields.class_name.trim())
    errors.class_name = 'Class name is required.'

  if (!fields.division.trim())
    errors.division = 'Division is required.'

  return errors
}

// ── Component ────────────────────────────────────────────────────
const ClassForm = ({ initialData, onSubmit, onCancel, loading, serverError }) => {
  const [fields,  setFields]  = useState(EMPTY_FORM)
  const [errors,  setErrors]  = useState({})
  const [touched, setTouched] = useState({})

  // Pre-fill when editing an existing class
  useEffect(() => {
    if (initialData) {
      setFields({
        class_name: initialData.class_name ?? '',
        division:   initialData.division   ?? '',
      })
    } else {
      setFields(EMPTY_FORM)
    }
    setErrors({})
    setTouched({})
  }, [initialData])

  // ── Handlers ─────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    // Clear the field error as the user types
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Mark every field as touched so all errors become visible
    const allTouched = Object.keys(EMPTY_FORM).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {}
    )
    setTouched(allTouched)

    const validationErrors = validate(fields)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // Build the clean payload (trimmed strings)
    const payload = {
      class_name: fields.class_name.trim(),
      division:   fields.division.trim(),
    }

    onSubmit(payload)
  }

  // Helper: show error only after the user has touched the field
  const fieldError = (name) => (touched[name] ? errors[name] : undefined)

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {/* ── Server-side error banner ──────────────────────────── */}
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* ── Class Name ───────────────────────────────────────── */}
      <div>
        <label htmlFor="class_name" className="label">
          Class Name <span className="text-red-500">*</span>
        </label>
        <input
          id="class_name"
          name="class_name"
          type="text"
          className={`input ${fieldError('class_name') ? 'border-red-400 focus:ring-red-200' : ''}`}
          placeholder="e.g. 10th Standard, FY B.Sc."
          value={fields.class_name}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          autoComplete="off"
          autoFocus
        />
        {fieldError('class_name') && (
          <p className="mt-1 text-xs text-red-600">{fieldError('class_name')}</p>
        )}
      </div>

      {/* ── Division ─────────────────────────────────────────── */}
      <div>
        <label htmlFor="division" className="label">
          Division <span className="text-red-500">*</span>
        </label>
        <input
          id="division"
          name="division"
          type="text"
          className={`input ${fieldError('division') ? 'border-red-400 focus:ring-red-200' : ''}`}
          placeholder="e.g. A, B, Science, Commerce"
          value={fields.division}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          autoComplete="off"
        />
        {fieldError('division') && (
          <p className="mt-1 text-xs text-red-600">{fieldError('division')}</p>
        )}
      </div>

      {/* ── Form Actions ─────────────────────────────────────── */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          id="class-form-submit-btn"
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Saving…
            </span>
          ) : (
            initialData ? 'Update Class' : 'Add Class'
          )}
        </button>
      </div>
    </form>
  )
}

export default ClassForm
