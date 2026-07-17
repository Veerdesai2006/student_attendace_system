/**
 * classService.js
 * ----------------
 * Handles all Class API calls.
 *
 * Endpoints:
 *   GET    /classes
 *   POST   /classes
 *   PUT    /classes/:id
 *   DELETE /classes/:id
 *
 * Class JSON shape:
 * {
 *   class_name: "",
 *   division: ""
 * }
 */
import api from './api'

const classService = {
  /** List all classes */
  getAll: () => api.get('/classes'),

  /** Create a new class */
  create: (data) => api.post('/classes', data),

  /** Update an existing class */
  update: (id, data) => api.put(`/classes/${id}`, data),

  /** Delete a class */
  remove: (id) => api.delete(`/classes/${id}`),
}

export default classService
