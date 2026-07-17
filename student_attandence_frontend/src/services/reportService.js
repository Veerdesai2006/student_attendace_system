/**
 * reportService.js
 * -----------------
 * Handles all Report & Analytics API calls.
 *
 * Confirmed endpoints (probed against live Flask backend):
 *
 *   GET /api/dashboard
 *     → { total_classes, total_students, total_subjects, total_teachers,
 *         today_attendance, present_today, absent_today }
 *
 *   GET /api/reports/student/<student_id>
 *     → [{ student_name, subject, teacher, attendance_date, status }]
 *
 *   GET /api/reports/subject/<subject_id>
 *     → [{ subject, student, teacher, attendance_date, status }]
 *
 *   GET /api/reports/teacher/<teacher_id>
 *     → [{ teacher, student, subject, attendance_date, status }]
 *
 *   GET /api/reports/daily/<YYYY-MM-DD>
 *     → [{ student, subject, teacher, status }]
 *
 *   GET /api/reports/date-range/<start>/<end>
 *     → [{ student, subject, teacher, attendance_date, status }]
 *
 *   GET /api/export/attendance
 *     → CSV blob download
 */
import api from './api'

const reportService = {
  /** Dashboard KPI summary */
  getDashboard: () => api.get('/dashboard'),

  /** Student attendance report by student_id */
  getStudentReport: (studentId) =>
    api.get(`/reports/student/${studentId}`),

  /** Subject attendance report by subject_id */
  getSubjectReport: (subjectId) =>
    api.get(`/reports/subject/${subjectId}`),

  /** Teacher attendance report by teacher_id */
  getTeacherReport: (teacherId) =>
    api.get(`/reports/teacher/${teacherId}`),

  /** Daily attendance report for a specific date (YYYY-MM-DD) */
  getDailyReport: (date) =>
    api.get(`/reports/daily/${date}`),

  /** Date range attendance report */
  getDateRangeReport: (startDate, endDate) =>
    api.get(`/reports/date-range/${startDate}/${endDate}`),

  /** Download full attendance CSV */
  downloadCsv: () =>
    api.get('/export/attendance', { responseType: 'blob' }),
}

export default reportService
