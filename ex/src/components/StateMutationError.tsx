import { useState } from 'react'

export default function StateMutationError() {
  const [count, setCount] = useState(0)
  
  const handleClick = () => {
    setCount(count + 1)
    setCount(count + 2) // This will use stale state!
  }

  const badDirectMutation = () => {
    const user = { name: 'John' }
    user.name = 'Jane' // Direct mutation
    console.log('Mutated user:', user)
  }

  return (
    <div className="p-4 border-2 border-orange-500 rounded mt-4">
      <h2 className="text-xl font-bold text-orange-600">State Mutation Errors</h2>
      <p>Count: {count}</p>
      <button 
        onClick={handleClick}
        className="bg-orange-500 text-white px-4 py-2 rounded mr-2"
      >
        Bad State Update (uses stale state)
      </button>
      <button 
        onClick={badDirectMutation}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Direct Object Mutation
      </button>
    </div>
  )
}