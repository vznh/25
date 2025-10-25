import React, { useEffect } from 'react'

export default function ErrorLogger() {
  useEffect(() => {
    // Global error handler for synchronous errors
    const handleError = (event: ErrorEvent) => {
      console.error('🔴 Runtime Error Caught:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack
      })
    }

    // Global handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🟡 Unhandled Promise Rejection:', {
        reason: event.reason,
        stack: event.reason?.stack
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}