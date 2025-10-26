import { useState } from 'react'

export default function TestRoutes() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (testName: string, result: any) => {
    setResults(prev => [...prev, { testName, result, timestamp: new Date().toISOString() }])
  }

  const testNestedError = async () => {
    try {
      const response = await fetch('/api/test-nested-error', { method: 'POST' })
      const data = await response.json()
      addResult('nested-error', data)
    } catch (error) {
      addResult('nested-error', { error: error.message })
    }
  }

  const testAsyncPromiseError = async () => {
    try {
      const response = await fetch('/api/test-async-promise-error', { method: 'POST' })
      const data = await response.json()
      addResult('async-promise-error', data)
    } catch (error) {
      addResult('async-promise-error', { error: error.message })
    }
  }

  const testDataValidationError = async () => {
    try {
      const response = await fetch('/api/test-data-validation-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'test',
          email: 'invalid-email'
        })
      })
      const data = await response.json()
      addResult('data-validation-error', data)
    } catch (error) {
      addResult('data-validation-error', { error: error.message })
    }
  }

  const testFileOperationError = async () => {
    try {
      const response = await fetch('/api/test-file-operation-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: '../../etc/passwd',  // Malicious path
          content: 'test content'
        })
      })
      const data = await response.json()
      addResult('file-operation-error', data)
    } catch (error) {
      addResult('file-operation-error', { error: error.message })
    }
  }

  const testDatabaseError = async () => {
    try {
      const response = await fetch('/api/test-database-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'invalid_user_123'
        })
      })
      const data = await response.json()
      addResult('database-error', data)
    } catch (error) {
      addResult('database-error', { error: error.message })
    }
  }

  const runAllTests = async () => {
    setLoading(true)
    setResults([])

    await testNestedError()
    await testAsyncPromiseError()
    await testDataValidationError()
    await testFileOperationError()
    await testDatabaseError()

    setLoading(false)
  }

  const clearResults = () => {
    setResults([])
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Error Logger Test Routes</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Running Tests...' : 'Run All Tests'}
            </button>
            <button
              onClick={clearResults}
              className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Clear Results
            </button>
            <button
              onClick={testNestedError}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Test Nested Error
            </button>
            <button
              onClick={testAsyncPromiseError}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              Test Async Error
            </button>
            <button
              onClick={testDataValidationError}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Test Validation Error
            </button>
            <button
              onClick={testFileOperationError}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Test File Error
            </button>
            <button
              onClick={testDatabaseError}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              Test DB Error
            </button>
          </div>
        </div>

        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">
                      {result.testName.replace(/-/g, ' ').toUpperCase()}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="bg-gray-50 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold mb-2">About These Tests</h2>
          <p className="text-gray-700 mb-4">
            These test routes demonstrate different error scenarios with nested functions and try-catch blocks using the logger:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><strong>Nested Error:</strong> Deep function call chain with configuration error</li>
            <li><strong>Async Error:</strong> Network timeout and data processing failures</li>
            <li><strong>Validation Error:</strong> Input sanitization and business rule violations</li>
            <li><strong>File Operation Error:</strong> Path traversal attempts and file system errors</li>
            <li><strong>Database Error:</strong> Connection failures and query execution errors</li>
          </ul>
          <p className="text-sm text-gray-600 mt-4">
            Each route implements proper try-catch blocks with logger.capture() to provide detailed error context.
          </p>
        </div>
      </div>
    </div>
  )
}