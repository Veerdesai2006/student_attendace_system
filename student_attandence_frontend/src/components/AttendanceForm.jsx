/**
 * AttendanceForm.jsx
 * -------------------
 * Controlled form for creating and editing an Attendance record.
 * Used inside a Modal on the Attendance page.
 *
 * Props:
 *   initialData {object|null} – pre-filled values when editing; null = Add mode
 *   students    {Array}       – list from GET /students
 *   subjects    {Array}       – list from GET /subjects
 *   teachers    {Array}       – list from GET /teachers
 *   onSubmit    {Function}    – async (payload) => void
 *   onCancel    {Function}    – closes the modal
 *   loading     {boolean}     – disables the form while request is in-flight
 *   serverError {string|null} – backend error message to display in the form
 *
 * Note: When updating (initialData != null), only the status can be modified
 * based on the backend contract.
 */

import { useState, useEffect } from 'react'

const EMPTY_FORM = {
  student_id: '',
  subject_id: '',
  teacher_id: '',
  status: '',
}

const validate = (fields, isEdit) => {
  const errors = {}

  if (!isEdit) {
    if (!fields.student_id) errors.student_id = 'Student is required.'
    if (!fields.subject_id) errors.subject_id = 'Subject is required.'
    if (!fields.teacher_id) errors.teacher_id = 'Teacher is required.'
  }

  if (!fields.status) {
    errors.status = 'Status is required.'
  }

  return errors
}

const AttendanceForm = ({
  initialData,
  students,
  subjects,
  teachers,
  onSubmit,
  onCancel,
  loading,
  serverError,
}) => {
  const [fields, setFields] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  
  const isEdit = Boolean(initialData)

  useEffect(() => {
    if (initialData) {
      setFields({
        student_id: initialData.student_id ? String(initialData.student_id) : '',
        subject_id: initialData.subject_id ? String(initialData.subject_id) : '',
        teacher_id: initialData.teacher_id ? String(initialData.teacher_id) : '',
        status: initialData.status ?? '',
      })
    } else {
      setFields(EMPTY_FORM)
    }
    setErrors({})
    setTouched({})
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFields((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const allTouched = Object.keys(EMPTY_FORM).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {}
    )
    setTouched(allTouched)

    const validationErrors = validate(fields, isEdit)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    let payload
    if (isEdit) {
      // Backend contract for update: { "status": "Absent" }
      payload = {
        status: fields.status,
      }
    } else {
      payload = {
        student_id: parseInt(fields.student_id, 10),
        subject_id: parseInt(fields.subject_id, 10),
        teacher_id: parseInt(fields.teacher_id, 10),
        status: fields.status,
      }
    }

    onSubmit(payload)
  }

  const fieldError = (name) => (touched[name] ? errors[name] : undefined)

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {serverError && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{serverError}</span>
        </div>
      )}

      {/* ── Student ────────────────────────────────────────── */}
      <div>
        <label htmlFor="student_id" className="label">
          Student {!isEdit && <span className="text-red-500">*</span>}
        </label>
        <select
          id="student_id"
          name="student_id"
          className={`input ${fieldError('student_id') ? 'border-red-400 focus:ring-red-200' : ''}`}
          value={fields.student_id}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading || isEdit}
        >
          <option value="">— Select student —</option>
          {students.map((stu) => (
            <option key={stu.student_id} value={String(stu.student_id)}>
              {stu.roll_number} - {stu.first_name} {stu.last_name}
            </option>
          ))}
        </select>
        {fieldError('student_id') && (
          <p className="mt-1 text-xs text-red-600">{fieldError('student_id')}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ── Subject ────────────────────────────────────────── */}
        <div>
          <label htmlFor="subject_id" className="label">
            Subject {!isEdit && <span className="text-red-500">*</span>}
          </label>
          <select
            id="subject_id"
            name="subject_id"
            className={`input ${fieldError('subject_id') ? 'border-red-400 focus:ring-red-200' : ''}`}
            value={fields.subject_id}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading || isEdit}
          >
            <option value="">— Select subject —</option>
            {subjects.map((sub) => (
              <option key={sub.subject_id} value={String(sub.subject_id)}>
                {sub.subject_name}
              </option>
            ))}
          </select>
          {fieldError('subject_id') && (
            <p className="mt-1 text-xs text-red-600">{fieldError('subject_id')}</p>
          )}
        </div>

        {/* ── Teacher ────────────────────────────────────────── */}
        <div>
          <label htmlFor="teacher_id" className="label">
            Teacher {!isEdit && <span className="text-red-500">*</span>}
          </label>
          <select
            id="teacher_id"
            name="teacher_id"
            className={`input ${fieldError('teacher_id') ? 'border-red-400 focus:ring-red-200' : ''}`}
            value={fields.teacher_id}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading || isEdit}
          >
            <option value="">— Select teacher —</option>
            {teachers.map((tch) => (
              <option key={tch.teacher_id} value={String(tch.teacher_id)}>
                {tch.first_name} {tch.last_name}
              </option>
            ))}
          </select>
          {fieldError('teacher_id') && (
            <p className="mt-1 text-xs text-red-600">{fieldError('teacher_id')}</p>
          )}
        </div>
      </div>

      {/* ── Status ─────────────────────────────────────────── */}
      <div>
        <label htmlFor="status" className="label">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          name="status"
          className={`input ${fieldError('status') ? 'border-red-400 focus:ring-red-200' : ''}`}
          value={fields.status}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading}
        >
          <option value="">— Select status —</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>
        {fieldError('status') && (
          <p className="mt-1 text-xs text-red-600">{fieldError('status')}</p>
        )}
      </div>

      {/* ── Actions ────────────────────────────────────────── */}
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
          id="attendance-form-submit-btn"
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
            isEdit ? 'Update Status' : 'Add Attendance'
          )}
        </button>
      </div>
    </form>
  )
}

export default AttendanceForm
