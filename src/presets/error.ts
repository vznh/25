const parsed = `
  {
    "error": {
      "name": "Error",
      "message": "Async order processing failed: Database connection failed",
      "stack": "Error: Async order processing failed: Database connection failed\n    at processAsyncOrder (/home/alex/25/tests/test-runtime-error.ts:71:15)"
    },
    "original": " Error: Failed to process order: Item price mnust be a number",
    "callChain": [
      {
        "method": "processAsyncOrder",
        "file": "/home/alex/25/tests/test-runtime-error.ts",
        "line": 71,
        "column": 15,
        "sourceCode": "async function processAsyncOrder(orderData: any) {\n  try {\n    const order = processOrder(orderData);\n    const user = await asyncFetchUserData(orderData.userId);\n\n    if (user.credit < order.total) {\n      throw new Error('Insufficient credit');\n    }",
        "calls": [
          "/home/alex/25/tests/test-runtime-error.ts:processOrder",
          "/home/alex/25/tests/test-runtime-error.ts:asyncFetchUserData"
        ]
      },
      {
        "file": "/home/alex/25/tests/test-runtime-error.ts",
        "method": "validateOrder",
        "line": null,
        "column": null,
        "sourceCode": "function validateOrder(order: any) {\n  if (!order) {\n    throw new Error('Order is required');\n  }",
        "calls": [],
        "calledBy": "related_to_error"
      },
      {
        "file": "/home/alex/25/tests/test-runtime-error.ts",
        "method": "calculateTotal",
        "line": null,
        "column": null,
        "sourceCode": "function calculateTotal(items: any[]) {\n  return items.reduce((sum, item) => {\n    if (typeof item.price !== 'number') {\n      throw new TypeError('Item price must be a number');\n    }",
        "calls": [
          "reduce"
        ],
        "calledBy": "related_to_error"
      },
      {
        "file": "/home/alex/25/tests/test-runtime-error.ts",
        "method": "processOrder",
        "line": null,
        "column": null,
        "sourceCode": "function processOrder(order: any) {\n  try {\n    const validatedOrder = validateOrder(order);\n    const total = calculateTotal(validatedOrder.items);\n\n    return {\n      orderId: order.id || 'unknown',\n      total,\n      status: 'processed'\n    };",
        "calls": [
          "/home/alex/25/tests/test-runtime-error.ts:validateOrder",
          "/home/alex/25/tests/test-runtime-error.ts:calculateTotal"
        ],
        "calledBy": "related_to_error"
      },
      {
        "file": "/home/alex/25/tests/test-runtime-error.ts",
        "method": "asyncFetchUserData",
        "line": null,
        "column": null,
        "sourceCode": "function asyncFetchUserData(userId: string): Promise<any> {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      if (!userId) {\n        reject(new Error('User ID cannot be empty'));\n        return;\n      }",
        "calls": [
          "Promise",
          "setTimeout"
        ],
        "calledBy": "related_to_error"
      },
      {
        "file": "/home/alex/25/tests/test-runtime-error.ts",
        "method": "runRuntimeErrorTest",
        "line": null,
        "column": null,
        "sourceCode": "async function runRuntimeErrorTest() {\n  // Test 1: Simple synchronous error\n  console.log('=== Test 1: Synchronous Error ===');\n  try {\n    // This will cause an error - invalid order data\n    processOrder({ items: [{ price: 'invalid' }] });\n  } catch (error) {",
        "calls": [
          "/home/alex/25/tests/test-runtime-error.ts:processOrder"
        ],
        "calledBy": "related_to_error"
      }
    ],
    "relatedFunctions": {
      "/home/alex/25/tests/test-runtime-error.ts:validateOrder": {
        "sourceCode": "function validateOrder(order: any) {\n  if (!order) {\n    throw new Error('Order is required');\n  }",
        "file": "/home/alex/25/tests/test-runtime-error.ts",
        "start_line": 5,
        "end_line": 9,
        "method": "validateOrder",
        "calls": []
      },
      "/home/alex/25/tests/test-runtime-error.ts:calculateTotal": {
        "sourceCode": "function calculateTotal(items: any[]) {\n  return items.reduce((sum, item) => {\n    if (typeof item.price !== 'number') {\n      throw new TypeError('Item price must be a number');\n    }",
        "file": "/home/alex/25/tests/test-runtime-error.ts",
        "start_line": 15,
        "end_line": 20,
        "method": "calculateTotal",
        "calls": [
          "reduce"
        ]
      },
      "/home/alex/25/tests/test-runtime-error.ts:processOrder": {
        "sourceCode": "function processOrder(order: any) {\n  try {\n    const validatedOrder = validateOrder(order);\n    const total = calculateTotal(validatedOrder.items);\n\n    return {\n      orderId: order.id || 'unknown',\n      total,\n      status: 'processed'\n    };",
        "file": "/home/alex/25/tests/test-runtime-error.ts",
        "start_line": 24,
        "end_line": 34,
        "method": "processOrder",
        "calls": [
          "/home/alex/25/tests/test-runtime-error.ts:validateOrder",
          "/home/alex/25/tests/test-runtime-error.ts:calculateTotal"
        ]
      },
      "/home/alex/25/tests/test-runtime-error.ts:asyncFetchUserData": {
        "sourceCode": "function asyncFetchUserData(userId: string): Promise<any> {\n  return new Promise((resolve, reject) => {\n    setTimeout(() => {\n      if (!userId) {\n        reject(new Error('User ID cannot be empty'));\n        return;\n      }",
        "file": "/home/alex/25/tests/test-runtime-error.ts",
        "start_line": 40,
        "end_line": 47,
        "method": "asyncFetchUserData",
        "calls": [
          "Promise",
          "setTimeout"
        ]
      },
      "/home/alex/25/tests/test-runtime-error.ts:processAsyncOrder": {
        "sourceCode": "async function processAsyncOrder(orderData: any) {\n  try {\n    const order = processOrder(orderData);\n    const user = await asyncFetchUserData(orderData.userId);\n\n    if (user.credit < order.total) {\n      throw new Error('Insufficient credit');\n    }",
        "file": "/home/alex/25/tests/test-runtime-error.ts",
        "start_line": 59,
        "end_line": 67,
        "method": "processAsyncOrder",
        "calls": [
          "/home/alex/25/tests/test-runtime-error.ts:processOrder",
          "/home/alex/25/tests/test-runtime-error.ts:asyncFetchUserData"
        ]
      },
      "/home/alex/25/tests/test-runtime-error.ts:runRuntimeErrorTest": {
        "sourceCode": "async function runRuntimeErrorTest() {\n  // Test 1: Simple synchronous error\n  console.log('=== Test 1: Synchronous Error ===');\n  try {\n    // This will cause an error - invalid order data\n    processOrder({ items: [{ price: 'invalid' }] });\n  } catch (error) {",
        "file": "/home/alex/25/tests/test-runtime-error.ts",
        "start_line": 74,
        "end_line": 81,
        "method": "runRuntimeErrorTest",
        "calls": [
          "/home/alex/25/tests/test-runtime-error.ts:processOrder"
        ]
      }
    }
  }`;

export { parsed };
