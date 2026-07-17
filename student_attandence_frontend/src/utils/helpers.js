/**
 * helpers.js
 * -----------
 * Pure utility functions shared across the application.
 * No side-effects, no imports from services or components.
 */

/**
 * Trigger a browser file download from a Blob.
 * Used by the Export page to download attendance.csv.
 *
 * @param {Blob}   blob     - The binary data returned by axios (responseType: 'blob')
 * @param {string} filename - The filename to suggest to the browser
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

/**
 * Format a date string (ISO or similar) into a readable format.
 * Returns 'N/A' if the value is falsy.
 *
 * @param {string} dateStr
 * @returns {string}
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

/**
 * Capitalise the first letter of a string.
 *
 * @param {string} str
 * @returns {string}
 */
export const capitalise = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Get a CSS class string for an attendance status badge.
 *
 * @param {'Present'|'Absent'|'Late'} status
 * @returns {string} Tailwind class string
 */
export const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Present': return 'badge-green'
    case 'Absent':  return 'badge-red'
    case 'Late':    return 'badge-yellow'
    default:        return 'badge-blue'
  }
}

/**
 * Filter an array of objects by a search term across all string fields.
 * Used for client-side filtering while typing (before API search kicks in).
 *
 * @param {Array}  items  - Array of objects
 * @param {string} query  - Search query
 * @returns {Array}
 */
export const filterByQuery = (items, query) => {
  if (!query.trim()) return items
  const lower = query.toLowerCase()
  return items.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(lower)
    )
  )
}
