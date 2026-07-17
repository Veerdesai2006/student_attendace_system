/**
 * TeacherForm.jsx
 * ----------------
 * Controlled form for creating and editing a Teacher.
 * Used inside a Modal on the Teachers page.
 *
 * Props:
 *   initialData {object|null} – pre-filled values when editing; null = Add mode
 *   onSubmit    {Function}    – async (payload) => void, called on valid submit
 *   onCancel    {Function}    – closes the modal
 *   loading     {boolean}     – disables the form while request is in-flight
 *   serverError {string|null} – backend error message to display in the form
 *
 * Backend field names used exactly as specified (never generic aliases):
 *   first_name {string} – required
 *   last_name  {string} – required
 *   contact    {string} – required, digits only
 *   email      {string} – required, valid email format
 *
 * This form NEVER reads or writes teacher_id – that is handled by Teachers.jsx.
 */

import { useState, useEffect } from 'react'

// ── Empty form state ─────────────────────────────────────────────
const EMPTY_FORM = {
  first_name: '',
  last_name:  '',
  contact:    '',
  email:      '',
}

// ── Client-side validation ────────────────────────────────────────
const validate = (fields) => {
  const errors = {}

  if (!fields.first_name.trim())
    errors.first_name = 'First name is required.'

  if (!fields.last_name.trim())
    errors.last_name = 'Last name is required.'

  if (!fields.contact.trim()) {
    errors.contact = 'Contact number is required.'
  } else if (!/^\d+$/.test(fields.contact.trim())) {
    errors.contact = 'Contact must contain digits only.'
  }

  if (!fields.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  return errors
}

// ── Component ────────────────────────────────────────────────────
const TeacherForm = ({ initialData, onSubmit, onCancel, loading, serverError }) => {
  const [fields,  setFields]  = useState(EMPTY_FORM)
  const [errors,  setErrors]  = useState({})
  const [touched, setTouched] = useState({})

  // Pre-fill form when editing an existing teacher
  useEffect(() => {
    if (initialData) {
      setFields({
        first_name: initialData.first_name ?? '',
        last_name:  initialData.last_name  ?? '',
        contact:    initialData.contact    ?? '',
        email:      initialData.email      ?? '',
      })
    } else {
      setFields(EMPTY_FORM)
    }
    // Always reset validation when the modal opens
    setErrors({})
    setTouched({})
  }, [initialData])

  // ── Change handler – clears per-field error as user types ────
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

    // Touch all fields so every validation error becomes visible at once
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

    // Build clean payload using exact backend field names
    const payload = {
      first_name: fields.first_name.trim(),
      last_name:  fields.last_name.trim(),
      contact:    fields.contact.trim(),
      email:      fields.email.trim().toLowerCase(),
    }

    onSubmit(payload)
  }

  // Helper: show error only after the user has interacted with a field
  const fieldError = (name) => (touched[name] ? errors[name] : undefined)

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {/* ── Backend / server error banner ─────────────────────── */}
      {serverError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{serverError}</span>
        </div>
      )}

      {/* ── Row 1: First Name + Last Name ─────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label htmlFor="first_name" className="label">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            className={`input ${fieldError('first_name') ? 'border-red-400 focus:ring-red-200' : ''}`}
            placeholder="First name"
            value={fields.first_name}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
            autoComplete="off"
            autoFocus
          />
          {fieldError('first_name') && (
            <p className="mt-1 text-xs text-red-600">{fieldError('first_name')}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="last_name" className="label">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            className={`input ${fieldError('last_name') ? 'border-red-400 focus:ring-red-200' : ''}`}
            placeholder="Last name"
            value={fields.last_name}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
            autoComplete="off"
          />
          {fieldError('last_name') && (
            <p className="mt-1 text-xs text-red-600">{fieldError('last_name')}</p>
          )}
        </div>
      </div>

      {/* ── Row 2: Contact + Email ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Contact – backend field name is exactly "contact" */}
        <div>
          <label htmlFor="contact" className="label">
            Contact <span className="text-red-500">*</span>
          </label>
          <input
            id="contact"
            name="contact"
            type="tel"
            className={`input ${fieldError('contact') ? 'border-red-400 focus:ring-red-200' : ''}`}
            placeholder="Digits only (e.g. 9876543210)"
            value={fields.contact}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
            autoComplete="off"
            maxLength={15}
          />
          {fieldError('contact') && (
            <p className="mt-1 text-xs text-red-600">{fieldError('contact')}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="label">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={`input ${fieldError('email') ? 'border-red-400 focus:ring-red-200' : ''}`}
            placeholder="teacher@example.com"
            value={fields.email}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
            autoComplete="off"
          />
          {fieldError('email') && (
            <p className="mt-1 text-xs text-red-600">{fieldError('email')}</p>
          )}
        </div>
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
          id="teacher-form-submit-btn"
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
            initialData ? 'Update Teacher' : 'Add Teacher'
          )}
        </button>
      </div>
    </form>
  )
}

export default TeacherForm
