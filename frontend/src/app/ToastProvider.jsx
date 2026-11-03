import { useCallback, useEffect, useState } from 'react'
import { ToastContext } from './ToastContext'

export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const notify = useCallback((message, type = 'success') => {
    setToast({
      id: Date.now(),
      message,
      type,
    })
  }, [])

  const dismiss = useCallback(() => setToast(null), [])

  useEffect(() => {
    if (!toast || toast.type === 'loading') return undefined
    const timer = window.setTimeout(dismiss, 3500)
    return () => window.clearTimeout(timer)
  }, [toast, dismiss])

  return (
    <ToastContext.Provider value={notify}>
      {children}
      {toast && (
        <div className={`toast-viewport toast-${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'} aria-live={toast.type === 'error' ? 'assertive' : 'polite'}>
          <span className="toast-indicator" aria-hidden="true" />
          <span>{toast.message}</span>
          {toast.type !== 'loading' && (
            <button type="button" className="toast-dismiss" onClick={dismiss} aria-label="Dismiss notification">×</button>
          )}
        </div>
      )}
    </ToastContext.Provider>
  )
}
