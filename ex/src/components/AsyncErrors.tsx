import { useState, useEffect } from 'react'

export default function AsyncErrors() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const unhandledPromiseRejection = async () => {
    const deepNested3 = () => {
      const value = Math.random()
      throw new Error('Unhandled promise rejection from deep nested function!')
    }
    
    const deepNested2 = () => {
      const temp = [1, 2, 3]
      return deepNested3()
    }
    
    const deepNested1 = async () => {
      await new Promise(resolve => setTimeout(resolve, 10))
      return deepNested2()
    }
    
    // Trigger unhandled rejection
    deepNested1() // No await or catch - will be unhandled
  }

  const asyncErrorWithoutTryCatch = async () => {
    const validateResponse = (response: Response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return response
    }
    
    const parseData = async (response: Response) => {
      const validated = validateResponse(response)
      return await validated.json()
    }
    
    const fetchFromAPI = async (endpoint: string) => {
      setLoading(true)
      const response = await fetch(endpoint)
      return await parseData(response)
    }
    
    const processRequest = async () => {
      const data = await fetchFromAPI('/api/nonexistent-endpoint')
      setLoading(false)
      return data
    }
    
    // No try-catch - error will bubble up
    await processRequest()
  }

  const infiniteAsyncLoop = async () => {
    const checkCondition = (i: number) => {
      if (i > 1000000) {
        throw new Error('Infinite loop detected!')
      }
      return true
    }
    
    const processIteration = (i: number) => {
      const multiplier = 2
      return checkCondition(i * multiplier)
    }
    
    const runLoop = async () => {
      setLoading(true)
      let i = 0
      while (true) {
        i++
        processIteration(i)
      }
    }
    
    await runLoop()
  }

  const memoryLeakAsync = async () => {
    const createLargeString = () => {
      return 'x'.repeat(1000)
    }
    
    const createLargeArray = () => {
      return new Array(100000).fill(createLargeString())
    }
    
    const allocateMemory = async (largeArrays: any[]) => {
      for (let i = 0; i < 1000; i++) {
        const largeArray = createLargeArray()
        largeArrays.push(largeArray)
        await new Promise(resolve => setTimeout(resolve, 10))
      }
    }
    
    const startMemoryLeak = async () => {
      const largeArrays: any[] = []
      await allocateMemory(largeArrays)
    }
    
    await startMemoryLeak()
  }

  const raceCondition = async () => {
    let counter = 0
    
    const getCurrentValue = () => {
      return counter
    }
    
    const updateCounter = (newValue: number) => {
      counter = newValue
    }
    
    const incrementAsync = async () => {
      const current = getCurrentValue()
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100))
      updateCounter(current + 1)
    }
    
    const runRaceCondition = async () => {
      await Promise.all([incrementAsync(), incrementAsync(), incrementAsync()])
      console.error(`Race condition - Final counter: ${counter} (should be 3)`)
      alert(`Final counter: ${counter} (should be 3)`)
    }
    
    await runRaceCondition()
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