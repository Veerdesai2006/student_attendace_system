/**
 * dashboardService.js
 * --------------------
 * Handles all Dashboard API calls.
 * Endpoint: GET /dashboard
 */
import api from './api'

const dashboardService = {
  /** Fetch summary statistics for the dashboard */
  getStats: () => api.get('/dashboard'),
}

export default dashboardService
