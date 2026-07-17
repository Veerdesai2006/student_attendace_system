/**
 * searchService.js
 * -----------------
 * Handles all Search API calls using the existing Flask backend.
 *
 * ─── Root Cause of Previous Bug ──────────────────────────────────
 * The previous implementation called:
 *   GET /students?search=<name>
 *   GET /students?roll_number=<roll>
 *   GET /teachers?search=<name>
 *   GET /subjects?search=<name>
 *
 * Those endpoints (student_routes, teacher_routes, subject_routes) IGNORE
 * query parameters entirely — they always call get_all_*() and return every
 * row in the database.  That is why searching "xyzabc123" returned all
 * students: the query param was silently discarded.
 *
 * ─── Correct Endpoints (confirmed against live Flask server) ─────
 * The backend exposes dedicated search routes in search_routes.py that use
 * URL path segments, NOT query strings:
 *
 *   GET /api/search/student/name/<name>   – search students by name
 *   GET /api/search/student/roll/<roll>   – search students by roll number
 *   GET /api/search/teacher/<name>        – search teachers by name
 *   GET /api/search/subject/<name>        – search subjects by name
 *
 * These routes call the correct SQL functions in search.py which use
 * ILIKE %<term>% — returning [] when nothing matches.
 *
 * ─── Response field names (exact, from live backend) ─────────────
 * Student by name/roll:
 *   student_id, roll_number, first_name, last_name,
 *   class_name, division
 *   (name search also includes: contact_number, email)
 *
 * Teacher:
 *   teacher_id, first_name, last_name, contact, email
 *
 * Subject:
 *   subject_id, subject_name, subject_code
 */
import api from './api'

const searchService = {
  /**
   * Search students by first or last name.
   * Endpoint: GET /api/search/student/name/<name>
   * @param {string} name – the search term (already trimmed)
   */
  searchStudentsByName: (name) =>
    api.get(`/search/student/name/${encodeURIComponent(name)}`),

  /**
   * Search students by roll number.
   * Endpoint: GET /api/search/student/roll/<roll>
   * @param {string} rollNumber – the roll number (already trimmed)
   */
  searchStudentsByRoll: (rollNumber) =>
    api.get(`/search/student/roll/${encodeURIComponent(rollNumber)}`),

  /**
   * Search teachers by first or last name.
   * Endpoint: GET /api/search/teacher/<name>
   * @param {string} name – the search term (already trimmed)
   */
  searchTeachers: (name) =>
    api.get(`/search/teacher/${encodeURIComponent(name)}`),

  /**
   * Search subjects by name.
   * Endpoint: GET /api/search/subject/<name>
   * @param {string} name – the search term (already trimmed)
   */
  searchSubjects: (name) =>
    api.get(`/search/subject/${encodeURIComponent(name)}`),
}

export default searchService
