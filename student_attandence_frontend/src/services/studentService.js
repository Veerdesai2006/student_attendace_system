/**
 * studentService.js
 * ------------------
 * Handles all Student API calls.
 *
 * Endpoints:
 *   GET    /students
 *   GET    /students/:id
 *   POST   /students
 *   PUT    /students/:id
 *   DELETE /students/:id
 *
 * Student JSON shape:
 * {
 *   roll_number: "",
 *   first_name: "",
 *   last_name: "",
 *   contact_number: "",
 *   email: "",
 *   class_id: 1
 * }
 */
import api from './api'

const studentService = {
  /** List all students */
  getAll: () => api.get('/students'),

  /** Get a single student by ID */
  getById: (id) => api.get(`/students/${id}`),

  /** Create a new student */
  create: (data) => api.post('/students', data),

  /** Update an existing student */
  update: (id, data) => api.put(`/students/${id}`, data),

  /** Delete a student */
  remove: (id) => api.delete(`/students/${id}`),
}

export default studentService
