/**
 * subjectService.js
 * ------------------
 * Handles all Subject API calls.
 *
 * Endpoints:
 *   GET    /subjects                  – list all subjects
 *   GET    /subjects/:subject_id      – get single subject
 *   POST   /subjects                  – create subject
 *   PUT    /subjects/:subject_id      – update subject
 *   DELETE /subjects/:subject_id      – delete subject
 *
 * Backend field names (exact – never use generic "id"):
 *   subject_id   – primary key
 *   subject_name – subject label
 *   subject_code – unique code
 */
import api from './api'

const subjectService = {
  /** List all subjects */
  getAll: () => api.get('/subjects'),

  /** Get a single subject by its subject_id */
  getById: (subjectId) => api.get(`/subjects/${subjectId}`),

  /** Create a new subject */
  create: (data) => api.post('/subjects', data),

  /**
   * Update an existing subject.
   * @param {number} subjectId – the backend primary key (subject_id)
   * @param {object} data      – { subject_name, subject_code }
   */
  update: (subjectId, data) => api.put(`/subjects/${subjectId}`, data),

  /**
   * Delete a subject.
   * @param {number} subjectId – the backend primary key (subject_id)
   * NOTE: Backend may reject if attendance records reference this subject.
   */
  remove: (subjectId) => api.delete(`/subjects/${subjectId}`),
}

export default subjectService
