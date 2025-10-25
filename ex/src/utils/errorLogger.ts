// Utility function to log errors to server
const logToServer = (type: string, error: any) => {
  fetch('/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      error: error.message || error,
      timestamp: new Date().toISOString()
    })
  }).catch(() => {}) // Ignore fetch errors
}