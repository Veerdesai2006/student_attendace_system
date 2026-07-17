/**
 * attendanceService.js
 * ---------------------
 * Handles all Attendance API calls.
 *
 * Endpoints:
 *   GET    /attendance                  - list all
 *   GET    /attendance/:attendance_id   - get single
 *   POST   /attendance                  - create
 *   PUT    /attendance/:attendance_id   - update
 *   DELETE /attendance/:attendance_id   - delete
 *   GET    /attendance/percentage/:student_id
 *
 * Backend Primary Keys (never use generic "id"):
 *   attendance_id
 *   student_id
 */
import api from './api'

const attendanceService = {
  /** List all attendance records */
  getAll: () => api.get('/attendance'),

  /** Get single attendance record */
  getById: (attendanceId) => api.get(`/attendance/${attendanceId}`),

  /** Create a new attendance record */
  create: (data) => api.post('/attendance', data),

  /** Update an existing attendance record (only status) */
  update: (attendanceId, data) => api.put(`/attendance/${attendanceId}`, data),

  /** Delete an attendance record */
  remove: (attendanceId) => api.delete(`/attendance/${attendanceId}`),

  /** Get attendance percentage for a specific student */
  getPercentage: (studentId) => api.get(`/attendance/percentage/${studentId}`),
}

export default attendanceService

