import { useState } from 'react'
import { logToServer } from '../utils/errorLogger'

export default function FunctionalErrors() {
  const [items, setItems] = useState([1, 2, 3])
  
  const undefinedError = () => {
    const getCity = (address: any) => {
      return address.city // This will throw if address is undefined
    }
    
    const getAddress = (user: any) => {
      return getCity(user.address)
    }
    
    const getUserInfo = () => {
      const obj: any = { name: 'test' }
      return getAddress(obj) // obj.address is undefined
    }
    
    try {
      return getUserInfo()
    } catch (e) {
      console.error('Undefined property error:', e)
      logToServer('undefined_property', e)
    }
  }

  const notAFunctionError = () => {
    const executeCallback = (callback: any) => {
      return callback() // This will throw if callback is not a function
    }
    
    const processData = (data: any) => {
      return executeCallback(data.method)
    }
    
    const initializeProcess = () => {
      const data: any = { method: 'not a function' }
      return processData(data)
    }
    
    try {
      initializeProcess()
    } catch (e) {
      console.error('Not a function error:', e)
      logToServer('not_a_function', e)
    }
  }

  const jsonParseError = () => {
    const convertToObject = (jsonString: string) => {
      return JSON.parse(jsonString) // SyntaxError
    }
    
    const validateAndParse = (data: string) => {
      return convertToObject(data)
    }
    
    const processInput = () => {
      const invalidJson = '{ name: "test", }'
      return validateAndParse(invalidJson)
    }
    
    try {
      processInput()
    } catch (e) {
      console.error('JSON parse error:', e)
      logToServer('json_parse', e)
    }
  }

  const arrayLengthError = () => {
    const getArraySize = (arr: any) => {
      return arr.length // TypeError: Cannot read properties of null
    }
    
    const countItems = (collection: any) => {
      return getArraySize(collection)
    }
    
    const processCollection = () => {
      const arr = null as any
      return countItems(arr)
    }
    
    try {
      return processCollection()
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