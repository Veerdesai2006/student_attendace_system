/**
 * api.js
 * -------
 * Single Axios instance used by ALL services.
 * The base URL points to the Flask backend.
 * Never import axios directly in components – always use this instance.
 */
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 s timeout
})

// ── Request interceptor ──────────────────────────────────────────
// Useful for adding auth tokens in the future
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// ── Response interceptor ─────────────────────────────────────────
// Normalise error messages so every service gets a consistent shape
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'An unexpected error occurred.'
    return Promise.reject(new Error(message))
  }
)

export default api
