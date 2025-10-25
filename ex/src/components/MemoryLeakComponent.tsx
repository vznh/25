import { useState, useEffect, useRef } from 'react'

export default function MemoryLeakComponent() {
  const [data, setData] = useState<any[]>([])
  const intervalRef = useRef<NodeJS.Timeout>()
  const eventListeners: any[] = []

  const causeMemoryLeak = () => {
    // Create large objects and never clean them up
    const leakyData: any[] = []
    for (let i = 0; i < 10000; i++) {
      leakyData.push({
        id: i,
        data: new Array(1000).fill(Math.random()),
        nested: {
          deep: new Array(100).fill('leak'.repeat(100))
        }
      })
    }
    setData(prev => [...prev, ...leakyData])
  }

  const addEventListenerLeak = () => {
    try {
      // Add event listeners without removing them
      const handler = () => console.log('Leaky listener!')
      window.addEventListener('resize', handler)
      eventListeners.push(handler)
      
      // Add same listener multiple times
      window.addEventListener('scroll', handler)
      window.addEventListener('scroll', handler)
      window.addEventListener('scroll', handler)
    } catch (e) {
      console.error('Event listener leak error:', e)
    }
  }

  const infiniteLoop = () => {
    try {
      // Infinite loop that freezes the app
      let i = 0
      while (true) {
        i++
        if (i % 1000000 === 0) {
          console.log('Still looping...', i)
        }
      }
    } catch (e) {
      console.error('Infinite loop error:', e)
    }
  }

  const recursiveWithoutBaseCase = () => {
    try {
      // Stack overflow
      const recursive = (n: number) => {
        return recursive(n + 1)
      }
      recursive(1)
    } catch (e) {
      console.error('Stack overflow error:', e)
    }
  }

  const setIntervalLeak = () => {
    try {
      // Create intervals without clearing them
      intervalRef.current = setInterval(() => {
        causeMemoryLeak()
      }, 1000)
      
      // Create more intervals
      setInterval(() => {
        console.log('Leaky interval 1')
      }, 500)
      
      setInterval(() => {
        console.log('Leaky interval 2')
      }, 750)
    } catch (e) {
      console.error('Set interval leak error:', e)
    }
  }

  const circularReference = () => {
    try {
      const obj: any = { name: 'circular' }
      obj.self = obj
      obj.deep = { parent: obj }
      
      // Try to stringify circular reference
      JSON.stringify(obj)
    } catch (e) {
      console.error('Circular reference error:', e)
    }
  }

  useEffect(() => {
    // Add cleanup that never runs
    return () => {
      console.log('Cleanup will run but intervals remain')
    }
  }, [])

  return (
    <div className="p-4 border-2 border-green-500 rounded mt-4">
      <h2 className="text-xl font-bold text-green-600">Memory Leaks & Infinite Loops</h2>
      <p className="text-sm text-gray-600">
        Data items in memory: {data.length}
      </p>
      
      <div className="grid grid-cols-2 gap-2 mt-2">
        <button 
          onClick={causeMemoryLeak}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Memory Leak
        </button>
        <button 
          onClick={addEventListenerLeak}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Event Listener Leak
        </button>
        <button 
          onClick={infiniteLoop}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Infinite Loop (Freeze!)
        </button>
        <button 
          onClick={recursiveWithoutBaseCase}
          className="bg-red-700 text-white px-4 py-2 rounded"
        >
          Stack Overflow
        </button>
        <button 
          onClick={setIntervalLeak}
          className="bg-green-700 text-white px-4 py-2 rounded"
        >
          Interval Leak
        </button>
        <button 
          onClick={circularReference}
          className="bg-green-800 text-white px-4 py-2 rounded"
        >
          Circular Reference
        </button>
      </div>
    </div>
  )
}