/**
 * StudentForm.jsx
 * ----------------
 * Controlled form for creating and editing a student.
 * Used inside a Modal on the Students page.
 *
 * Props:
 *   initialData {object}   – pre-filled values when editing (null for add)
 *   classes     {Array}    – list of class objects from GET /classes
 *   onSubmit    {Function} – async (formData) => void
 *   onCancel    {Function} – close the modal
 *   loading     {boolean}  – disables form while request is in-flight
 *   serverError {string}   – backend error message to display
 */

import { useState, useEffect } from 'react'

// ── Empty form state ─────────────────────────────────────────────
const EMPTY_FORM = {
  roll_number:     '',
  first_name:      '',
  last_name:       '',
  contact_number:  '',
  email:           '',
  class_id:        '',
}

// ── Field-level validation rules ─────────────────────────────────
const validate = (fields) => {
  const errors = {}

  if (!fields.roll_number.trim())
    errors.roll_number = 'Roll number is required.'

  if (!fields.first_name.trim())
    errors.first_name = 'First name is required.'

  if (!fields.last_name.trim())
    errors.last_name = 'Last name is required.'

  if (!fields.contact_number.trim())
    errors.contact_number = 'Contact number is required.'
  else if (!/^\d{10}$/.test(fields.contact_number.trim()))
    errors.contact_number = 'Enter a valid 10-digit contact number.'

  if (!fields.email.trim())
    errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))
    errors.email = 'Enter a valid email address.'

  if (!fields.class_id)
    errors.class_id = 'Please select a class.'

  return errors
}

// ── Component ────────────────────────────────────────────────────
const StudentForm = ({ initialData, classes, onSubmit, onCancel, loading, serverError }) => {
  const [fields, setFields]   = useState(EMPTY_FORM)
  const [errors, setErrors]   = useState({})
  const [touched, setTouched] = useState({})

  // Pre-fill form when editing an existing student
  useEffect(() => {
    if (initialData) {
      setFields({
        roll_number:    initialData.roll_number    ?? '',
        first_name:     initialData.first_name     ?? '',
        last_name:      initialData.last_name      ?? '',
        contact_number: initialData.contact_number ?? '',
        email:          initialData.email          ?? '',
        // class_id can come back as an integer – convert to string for the select
        class_id:       initialData.class_id != null ? String(initialData.class_id) : '',
      })
    } else {
      setFields(EMPTY_FORM)
    }
    setErrors({})
    setTouched({})
  }, [initialData])

  // ── Handlers ────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Mark all fields touched so errors are visible
    const allTouched = Object.keys(EMPTY_FORM).reduce((acc, k) => ({ ...acc, [k]: true }), {})
    setTouched(allTouched)

    const validationErrors = validate(fields)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    // Build the payload: cast class_id back to integer for the backend
    const payload = {
      ...fields,
      roll_number:    fields.roll_number.trim(),
      first_name:     fields.first_name.trim(),
      last_name:      fields.last_name.trim(),
      contact_number: fields.contact_number.trim(),
      email:          fields.email.trim(),
      class_id:       parseInt(fields.class_id, 10),
    }

    onSubmit(payload)
  }

  // ── Helper: show error only after field is touched ───────────
  const fieldError = (name) => (touched[name] ? errors[name] : undefined)

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {/* Server-side error banner */}
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* Row 1: Roll Number + Class */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Roll Number */}
        <div>
          <label htmlFor="roll_number" className="label">
            Roll Number <span className="text-red-500">*</span>
          </label>
          <input
            id="roll_number"
            name="roll_number"
            type="text"
            className={`input ${fieldError('roll_number') ? 'border-red-400 focus:ring-red-200' : ''}`}
            placeholder="e.g. 2024001"
            value={fields.roll_number}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
            autoComplete="off"
          />
          {fieldError('roll_number') && (
            <p className="mt-1 text-xs text-red-600">{fieldError('roll_number')}</p>
          )}
        </div>

        {/* Class dropdown */}
        <div>
          <label htmlFor="class_id" className="label">
            Class <span className="text-red-500">*</span>
          </label>
          <select
            id="class_id"
            name="class_id"
            className={`input ${fieldError('class_id') ? 'border-red-400 focus:ring-red-200' : ''}`}
            value={fields.class_id}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
          >
            <option value="">— Select class —</option>
            {classes.map((cls) => (
              // key and value both use cls.class_id (backend primary key)
              <option key={cls.class_id} value={String(cls.class_id)}>
                {cls.class_name} {cls.division ? `- ${cls.division}` : ''}
              </option>
            ))}
          </select>
          {fieldError('class_id') && (
            <p className="mt-1 text-xs text-red-600">{fieldError('class_id')}</p>
          )}
        </div>
      </div>

      {/* Row 2: First Name + Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          />
          {fieldError('first_name') && (
            <p className="mt-1 text-xs text-red-600">{fieldError('first_name')}</p>
          )}
        </div>

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
          />
          {fieldError('last_name') && (
            <p className="mt-1 text-xs text-red-600">{fieldError('last_name')}</p>
          )}
        </div>
      </div>

      {/* Row 3: Contact + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact_number" className="label">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            id="contact_number"
            name="contact_number"
            type="tel"
            className={`input ${fieldError('contact_number') ? 'border-red-400 focus:ring-red-200' : ''}`}
            placeholder="10-digit mobile number"
            value={fields.contact_number}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
            maxLength={10}
          />
          {fieldError('contact_number') && (
            <p className="mt-1 text-xs text-red-600">{fieldError('contact_number')}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="label">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className={`input ${fieldError('email') ? 'border-red-400 focus:ring-red-200' : ''}`}
            placeholder="student@example.com"
            value={fields.email}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
          />
          {fieldError('email') && (
            <p className="mt-1 text-xs text-red-600">{fieldError('email')}</p>
          )}
        </div>
      </div>

      {/* Form actions */}
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
          id="student-form-submit-btn"
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
            initialData ? 'Update Student' : 'Add Student'
          )}
        </button>
      </div>
    </form>
  )
}

export default StudentForm
