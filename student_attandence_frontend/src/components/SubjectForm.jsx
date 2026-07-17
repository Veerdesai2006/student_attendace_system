/**
 * SubjectForm.jsx
 * ----------------
 * Controlled form for creating and editing a Subject.
 * Used inside a Modal on the Subjects page.
 *
 * Props:
 *   initialData {object|null} – pre-filled values when editing; null = Add mode
 *   onSubmit    {Function}    – async (payload) => void, called on valid submit
 *   onCancel    {Function}    – closes the modal
 *   loading     {boolean}     – disables the form while the request is in-flight
 *   serverError {string|null} – backend error message to display inside the form
 *
 * Backend field names used exactly as specified:
 *   subject_name {string} – required
 *   subject_code {string} – required
 *
 * This form NEVER reads or writes subject_id – that is handled by the page.
 */

import { useState, useEffect } from 'react'

// ── Empty form state ─────────────────────────────────────────────
const EMPTY_FORM = {
  subject_name: '',
  subject_code: '',
}

// ── Client-side validation ────────────────────────────────────────
const validate = (fields) => {
  const errors = {}

  if (!fields.subject_name.trim())
    errors.subject_name = 'Subject name is required.'

  if (!fields.subject_code.trim())
    errors.subject_code = 'Subject code is required.'

  return errors
}

// ── Component ────────────────────────────────────────────────────
const SubjectForm = ({ initialData, onSubmit, onCancel, loading, serverError }) => {
  const [fields,  setFields]  = useState(EMPTY_FORM)
  const [errors,  setErrors]  = useState({})
  const [touched, setTouched] = useState({})

  // Pre-fill form fields when editing an existing subject
  useEffect(() => {
    if (initialData) {
      setFields({
        subject_name: initialData.subject_name ?? '',
        subject_code: initialData.subject_code ?? '',
      })
    } else {
      setFields(EMPTY_FORM)
    }
    // Reset validation state whenever the modal opens with new data
    setErrors({})
    setTouched({})
  }, [initialData])

  // ── Change handler – clears field error as user types ────────
  const handleChange = (e) => {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  // ── Blur handler – marks field as touched ────────────────────
  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  // ── Submit handler ────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()

    // Touch every field so all validation errors are shown at once
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

    // Build the clean payload using exact backend field names
    const payload = {
      subject_name: fields.subject_name.trim(),
      subject_code: fields.subject_code.trim().toUpperCase(), // normalize code to uppercase
    }

    onSubmit(payload)
  }

  // Helper: only show a field error after the user has interacted with it
  const fieldError = (name) => (touched[name] ? errors[name] : undefined)

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {/* ── Server-side / backend error banner ───────────────── */}
      {serverError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{serverError}</span>
        </div>
      )}

      {/* ── Subject Name ─────────────────────────────────────── */}
      <div>
        <label htmlFor="subject_name" className="label">
          Subject Name <span className="text-red-500">*</span>
        </label>
        <input
          id="subject_name"
          name="subject_name"
          type="text"
          className={`input ${fieldError('subject_name') ? 'border-red-400 focus:ring-red-200' : ''}`}
          placeholder="e.g. Mathematics, Physics, History"
          value={fields.subject_name}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          autoComplete="off"
          autoFocus
        />
        {fieldError('subject_name') && (
          <p className="mt-1 text-xs text-red-600">{fieldError('subject_name')}</p>
        )}
      </div>

      {/* ── Subject Code ─────────────────────────────────────── */}
      <div>
        <label htmlFor="subject_code" className="label">
          Subject Code <span className="text-red-500">*</span>
        </label>
        <input
          id="subject_code"
          name="subject_code"
          type="text"
          className={`input ${fieldError('subject_code') ? 'border-red-400 focus:ring-red-200' : ''}`}
          placeholder="e.g. MATH101, PHY201"
          value={fields.subject_code}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
          autoComplete="off"
          maxLength={20}
        />
        {fieldError('subject_code') && (
          <p className="mt-1 text-xs text-red-600">{fieldError('subject_code')}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          Code will be saved in uppercase (e.g. MATH101)
        </p>
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
          id="subject-form-submit-btn"
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
            initialData ? 'Update Subject' : 'Add Subject'
          )}
        </button>
      </div>
    </form>
  )
}

export default SubjectForm
