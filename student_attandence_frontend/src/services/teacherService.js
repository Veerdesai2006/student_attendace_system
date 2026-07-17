/**
 * teacherService.js
 * ------------------
 * Handles all Teacher API calls.
 *
 * Endpoints:
 *   GET    /teachers                  – list all teachers
 *   GET    /teachers/:teacher_id      – get single teacher
 *   POST   /teachers                  – create teacher
 *   PUT    /teachers/:teacher_id      – update teacher
 *   DELETE /teachers/:teacher_id      – delete teacher
 *
 * Backend field names (exact – never use generic "id"):
 *   teacher_id – primary key
 *   first_name – teacher's first name
 *   last_name  – teacher's last name
 *   contact    – phone/contact number
 *   email      – email address
 *
 * NOTE: The backend may reject deletes when attendance records exist.
 */
import api from './api'

const teacherService = {
  /** List all teachers */
  getAll: () => api.get('/teachers'),

  /**
   * Get a single teacher by their teacher_id.
   * @param {number} teacherId – backend primary key
   */
  getById: (teacherId) => api.get(`/teachers/${teacherId}`),

  /** Create a new teacher */
  create: (data) => api.post('/teachers', data),

  /**
   * Update an existing teacher.
   * @param {number} teacherId – backend primary key (teacher_id)
   * @param {object} data      – { first_name, last_name, contact, email }
   */
  update: (teacherId, data) => api.put(`/teachers/${teacherId}`, data),

  /**
   * Delete a teacher.
   * @param {number} teacherId – backend primary key (teacher_id)
   * NOTE: Backend may reject if attendance records reference this teacher.
   */
  remove: (teacherId) => api.delete(`/teachers/${teacherId}`),
}

export default teacherService
