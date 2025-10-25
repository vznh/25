import { useState } from 'react'
import { logToServer } from '../utils/errorLogger'

export default function FunctionalErrors() {
  const [items, setItems] = useState([1, 2, 3])
  
  const undefinedError = () => {
    try {
      const obj: any = { name: 'test' }
      return obj.address.city // TypeError: Cannot read properties of undefined
    } catch (e) {
      console.error('Undefined property error:', e)
      logToServer('undefined_property', e)
    }
  }

  const notAFunctionError = () => {
    try {
      const data: any = { method: 'not a function' }
      data.method() // TypeError: data.method is not a function
    } catch (e) {
      console.error('Not a function error:', e)
      logToServer('not_a_function', e)
    }
  }

  const jsonParseError = () => {
    try {
      const invalidJson = '{ name: "test", }'
      JSON.parse(invalidJson) // SyntaxError
    } catch (e) {
      console.error('JSON parse error:', e)
      logToServer('json_parse', e)
    }
  }

  const arrayLengthError = () => {
    try {
      const arr = null as any
      return arr.length // TypeError: Cannot read properties of null
    } catch (e) {
      console.error('Null array length error:', e)
      logToServer('null_array_length', e)
    }
  }

  return (
    <div className="p-4 border-2 border-purple-500 rounded mt-4">
      <h2 className="text-xl font-bold text-purple-600">Functional Runtime Errors</h2>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <button 
          onClick={undefinedError}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Undefined Property Error
        </button>
        <button 
          onClick={notAFunctionError}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Not a Function Error
        </button>
        <button 
          onClick={jsonParseError}
          className="bg-purple-700 text-white px-4 py-2 rounded"
        >
          JSON Parse Error
        </button>
        <button 
          onClick={arrayLengthError}
          className="bg-purple-800 text-white px-4 py-2 rounded"
        >
          Null Array Length Error
        </button>
      </div>
      {items.map((item, index) => (
        <div key={item}>
          Item {item}
        </div>
      ))}
    </div>
  )
}