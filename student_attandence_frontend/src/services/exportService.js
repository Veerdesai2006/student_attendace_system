/**
 * exportService.js
 * -----------------
 * Handles CSV export from the backend.
 *
 * Endpoint: GET /export/attendance
 * Returns:  attendance.csv as a binary blob
 */
import api from './api'

const exportService = {
  /**
   * Download attendance CSV.
   * Uses responseType: 'blob' so the browser receives raw bytes.
   * The caller is responsible for triggering the browser download.
   */
  downloadAttendanceCsv: () =>
    api.get('/export/attendance', { responseType: 'blob' }),
}

export default exportService
