import { Reader } from '../src/utils/reader.js';

const reader = new Reader();

// Define test functions directly in the test file
function validateOrder(order: any) {
  if (!order) {
    throw new Error('Order is required');
  }
  if (!order.items || !Array.isArray(order.items)) {
    throw new TypeError('Order must have items array');
  }
  return order;
}

function calculateTotal(items: any[]) {
  return items.reduce((sum, item) => {
    if (typeof item.price !== 'number') {
      throw new TypeError('Item price must be a number');
    }
    return sum + item.price;
  }, 0);
}

function processOrder(order: any) {
  try {
    const validatedOrder = validateOrder(order);
    const total = calculateTotal(validatedOrder.items);

    return {
      orderId: order.id || 'unknown',
      total,
      status: 'processed'
    };
  } catch (error) {
    console.error('Order processing failed:', (error as Error).message);
    throw new Error(`Failed to process order: ${(error as Error).message}`);
  }
}

function asyncFetchUserData(userId: string): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!userId) {
        reject(new Error('User ID cannot be empty'));
        return;
      }

      // Simulate database error
      if (userId === 'error-user') {
        reject(new Error('Database connection failed'));
        return;
      }

      resolve({ id: userId, name: 'John Doe', credit: 1000 });
    }, 50);
  });
}

async function processAsyncOrder(orderData: any) {
  try {
    const order = processOrder(orderData);
    const user = await asyncFetchUserData(orderData.userId);

    if (user.credit < order.total) {
      throw new Error('Insufficient credit');
    }

    return { ...order, user: user.name, payment: 'approved' };
  } catch (error) {
    throw new Error(`Async order processing failed: ${(error as Error).message}`);
  }
}

async function runRuntimeErrorTest() {
  // Test 1: Simple synchronous error
  console.log('=== Test 1: Synchronous Error ===');
  try {
    // This will cause an error - invalid order data
    processOrder({ items: [{ price: 'invalid' }] });
  } catch (error) {
    const analysis = await reader.analyzeRuntimeError(error as Error);
    console.log('Synchronous Error Analysis:');
    console.log('Call Chain Length:', analysis.callChain.length);
    console.log('Functions in call chain:');
    analysis.callChain.forEach((fn, i) => {
      console.log(`  ${i + 1}. ${fn.method} (calls: ${fn.calls?.length || 0} functions)`);
    });
    console.log('\nFull Analysis:');
    console.log(JSON.stringify(analysis, null, 2));
  }

  console.log('\n=== Test 2: Async Error ===');
  // Test 2: Async error
  try {
    // This will cause an async error - user doesn't exist
    await processAsyncOrder({
      id: 'order-123',
      items: [{ price: 50 }],
      userId: 'error-user'
    });
  } catch (error) {
    const analysis = await reader.analyzeRuntimeError(error as Error);
    console.log('Async Error Analysis:');
    console.log('Call Chain Length:', analysis.callChain.length);
    console.log('Functions in call chain:');
    analysis.callChain.forEach((fn, i) => {
      console.log(`  ${i + 1}. ${fn.method} (calls: ${fn.calls?.length || 0} functions, called by: ${fn.calledBy || 'root'})`);
    });
    console.log('\nRelated Functions Available:', Object.keys(analysis.relatedFunctions).length);
    console.log('Full Analysis:');
    console.log(JSON.stringify(analysis, null, 2));
  }

  console.log('\n=== Test 3: Working Case (should not error) ===');
  // Test 3: Working case
  try {
    const result = await processAsyncOrder({
      id: 'order-456',
      items: [{ price: 100 }],
      userId: 'user-123'
    });
    console.log('Success! Result:', result);
  } catch (error) {
    const analysis = await reader.analyzeRuntimeError(error as Error);
    console.log('Unexpected Error Analysis:');
    console.log(JSON.stringify(analysis, null, 2));
  }
}

// Run the test
runRuntimeErrorTest().catch(console.error);