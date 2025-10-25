import { useState, useEffect } from 'react'
import HydrationError from '../components/HydrationError'
import StateMutationError from '../components/StateMutationError'
import FunctionalErrors from '../components/FunctionalErrors'
import AsyncErrors from '../components/AsyncErrors'
import MemoryLeakComponent from '../components/MemoryLeakComponent'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-red-600">
        Runtime Errors Demo App
      </h1>
      <p className="text-center text-gray-600 mb-8">
        This app intentionally contains various runtime errors including hydration issues, 
        state mutations, memory leaks, and more.
      </p>
      
      <div className="max-w-4xl mx-auto space-y-4">
        <HydrationError />
        <StateMutationError />
        <FunctionalErrors />
        <AsyncErrors />
        <MemoryLeakComponent />
        
        <div className="p-4 border-2 border-pink-500 rounded mt-4">
          <h2 className="text-xl font-bold text-pink-600">Additional Errors</h2>
          <div className="space-y-2 mt-2">
            <button 
              onClick={() => {
                try {
                  const obj: any = {}
                  obj.a.b.c = 'deep nested error'
                } catch (e) {
                  console.error('Deep nested error:', e)
                }
              }}
              className="bg-pink-500 text-white px-4 py-2 rounded mr-2"
            >
              Deep Nested Error
            </button>
            <button 
              onClick={() => {
                try {
                  const arr: any = [1, 2, 3]
                  arr[100] = 'out of bounds'
                  console.error('Type coercion - array out of bounds access')
                } catch (e) {
                  console.error('Type coercion error:', e)
                }
              }}
              className="bg-pink-600 text-white px-4 py-2 rounded"
            >
              Type Coercion Error
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}