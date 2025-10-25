import { useState, useEffect } from 'react'

export default function HydrationErrorComponent() {
  const [date, setDate] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => {
      setDate(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="p-4 border-2 border-red-500 rounded">
      <h2 className="text-xl font-bold text-red-600">Hydration Error Component</h2>
      <p>Server time: {date.toLocaleTimeString()}</p>
      <p className="text-sm text-gray-600">
        This causes hydration mismatch because server and client render different times
      </p>
    </div>
  )
}