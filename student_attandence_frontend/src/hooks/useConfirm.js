/**
 * useConfirm.js
 * --------------
 * Custom hook that manages confirm dialog state.
 *
 * Usage:
 *   const { confirmState, openConfirm, closeConfirm } = useConfirm()
 *
 *   openConfirm({
 *     title: 'Delete Student',
 *     message: 'Are you sure?',
 *     onConfirm: () => handleDelete(id),
 *   })
 */
import { useState, useCallback } from 'react'

const DEFAULT_STATE = {
  isOpen: false,
  title: '',
  message: '',
  onConfirm: null,
}

const useConfirm = () => {
  const [confirmState, setConfirmState] = useState(DEFAULT_STATE)

  /** Open the confirm dialog with custom title, message, and callback */
  const openConfirm = useCallback(({ title, message, onConfirm }) => {
    setConfirmState({ isOpen: true, title, message, onConfirm })
  }, [])

  /** Close the confirm dialog without taking action */
  const closeConfirm = useCallback(() => {
    setConfirmState(DEFAULT_STATE)
  }, [])

  return { confirmState, openConfirm, closeConfirm }
}

export default useConfirm
