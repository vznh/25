import { useState, useEffect } from 'react'

export default function AsyncErrors() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const unhandledPromiseRejection = async () => {
    try {
      const promise = Promise.reject(new Error('Unhandled promise rejection!'))
      // Still need to let it be unhandled for the error event
      } catch (e) {
      console.error('Promise rejection error:', e)
    }
  }

  const asyncErrorWithoutTryCatch = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/nonexistent-endpoint')
      const data = await response.json() // This will throw if response is not ok
      setLoading(false)
    } catch (e) {
      console.error('Async fetch error:', e)
      setLoading(false)
    }
  }

  const infiniteAsyncLoop = async () => {
    try {
      setLoading(true)
      let i = 0
      while (true) {
        i++
        if (i > 1000000) {
          throw new Error('Infinite loop detected!')
        }
      }
    } catch (e) {
      console.error('Infinite async loop error:', e)
      setLoading(false)
    }
  }

  const memoryLeakAsync = async () => {
    try {
      const largeArrays: any[] = []
      for (let i = 0; i < 1000; i++) {
        const largeArray = new Array(100000).fill('x'.repeat(1000))
        largeArrays.push(largeArray)
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    } catch (e) {
      console.error('Memory leak async error:', e)
    }
  }

  const raceCondition = async () => {
    try {
      let counter = 0
      const increment = async () => {
        const current = counter
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
        counter = current + 1
      }
      
      await Promise.all([increment(), increment(), increment()])
      console.error(`Race condition - Final counter: ${counter} (should be 3)`)
      alert(`Final counter: ${counter} (should be 3)`)
    } catch (e) {
      console.error('Race condition error:', e)
    }
  }

  useEffect(() => {
    window.addEventListener('unhandledrejection', (event) => {
      setError(`Unhandled rejection: ${event.reason}`)
    })
  }, [])

  return (
    <div className="p-4 border-2 border-blue-500 rounded mt-4">
      <h2 className="text-xl font-bold text-blue-600">Async/Promise Errors</h2>
      {error && (
        <div className="bg-red-100 p-2 rounded mt-2">
          {error}
        </div>
      )}
      {loading && <p className="text-blue-500">Loading...</p>}
      
      <div className="grid grid-cols-2 gap-2 mt-2">
        <button 
          onClick={unhandledPromiseRejection}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Unhandled Promise
        </button>
        <button 
          onClick={asyncErrorWithoutTryCatch}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Async Error No Catch
        </button>
        <button 
          onClick={infiniteAsyncLoop}
          className="bg-blue-700 text-white px-4 py-2 rounded"
        >
          Infinite Async Loop
        </button>
        <button 
          onClick={memoryLeakAsync}
          className="bg-blue-800 text-white px-4 py-2 rounded"
        >
          Memory Leak Async
        </button>
        <button 
          onClick={raceCondition}
          className="bg-indigo-500 text-white px-4 py-2 rounded"
        >
          Race Condition
        </button>
      </div>
    </div>
  )
}