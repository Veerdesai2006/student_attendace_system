/**
 * useToast.js
 * ------------
 * Custom hook that manages a list of toast notifications.
 *
 * Returns:
 *   toasts   – array of toast objects
 *   addToast – function(message, type) to add a new toast
 *   removeToast – function(id) to dismiss a toast
 */
import { useState, useCallback } from 'react'

let nextId = 0

const useToast = () => {
  const [toasts, setToasts] = useState([])

  /**
   * Add a toast.
   * @param {string} message   - Text to display
   * @param {'success'|'error'|'info'|'warning'} type - Visual style
   * @param {number} duration  - Auto-dismiss after ms (default 4 000)
   */
  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++nextId
    setToasts((prev) => [...prev, { id, message, type }])

    // Auto-remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  /** Manually dismiss a toast by id */
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}

export default useToast
