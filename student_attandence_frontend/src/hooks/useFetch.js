/**
 * useFetch.js
 * ------------
 * Generic data-fetching hook.
 * Wraps an async service function and tracks loading / error / data state.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useFetch(studentService.getAll)
 */
import { useState, useEffect, useCallback } from 'react'

/**
 * @param {Function} fetchFn  - Async function that returns an axios response
 * @param {Array}    deps     - Extra dependencies to re-trigger the fetch
 */
const useFetch = (fetchFn, deps = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchFn()
      setData(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchFn, ...deps])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export default useFetch
