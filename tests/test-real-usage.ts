import { server } from '../src/server.js';
import { Reader } from '../src/utils/reader.js';

// Example server functions that could cause errors
function validateUser(userData: any) {
  if (!userData.email) {
    throw new Error('Email is required');
  }
  return userData;
}

function processPayment(paymentData: any) {
  if (paymentData.amount <= 0) {
    throw new Error('Payment amount must be positive');
  }
  return { status: 'processed', amount: paymentData.amount };
}

async function handleOrder(orderData: any) {
  try {
    const user = validateUser(orderData.user);
    const payment = processPayment(orderData.payment);

    return { orderId: orderData.id, user: user.email, payment: payment.status };
  } catch (error) {
    throw new Error(`Order processing failed: ${(error as Error).message}`);
  }
}

// Simulate AI processing function
function processWithAI(errorContext: any) {
  console.log('AI Processing Error:');
  console.log(`- Error: ${errorContext.error.message}`);
  console.log(`- Functions involved: ${errorContext.callChain.length}`);
  console.log(`- Source code available: ${errorContext.callChain.some(f => f.sourceCode) ? 'Yes' : 'No'}`);

  // In real usage, this would:
  // 1. Send to AI model
  // 2. Get healing suggestions
  // 3. Apply fixes automatically
}

// Test 1: Normal server usage pattern
async function testServerUsage() {
  console.log('=== Test 1: Server Usage Pattern ===');

  // Initialize server error capture
  server.init(processWithAI);

  // This error will be caught by server.init()
  setTimeout(() => {
    handleOrder({
      id: 'order-123',
      user: { name: 'John' }, // Missing email - will cause error
      payment: { amount: 100 }
    });
  }, 100);

  await new Promise(resolve => setTimeout(resolve, 200));
}

// Test 2: Direct Reader usage pattern
async function testDirectReaderUsage() {
  console.log('\n=== Test 2: Direct Reader Usage ===');

  const reader = new Reader();

  try {
    await handleOrder({
      id: 'order-456',
      user: { email: 'test@example.com' },
      payment: { amount: -50 } // Invalid amount - will cause error
    });
  } catch (error) {
    const context = await reader.analyzeRuntimeError(error as Error);
    processWithAI(context);
  }
}

// Test 3: Manual error capture
async function testManualCapture() {
  console.log('\n=== Test 3: Manual Error Capture ===');

  try {
    await handleOrder({
      id: 'order-789',
      user: null, // Will cause error
      payment: { amount: 50 }
    });
  } catch (error) {
    const context = await server.captureError(error);
    processWithAI(context);
  }
}

// Test 4: Wrapped function usage
async function testWrappedFunction() {
  console.log('\n=== Test 4: Wrapped Function Usage ===');

  const safeHandleOrder = server.wrap(handleOrder);

  try {
    await safeHandleOrder({
      id: 'order-999',
      user: { email: 'invalid' }, // Will cause validation error
      payment: { amount: 0 } // Will cause payment error
    });
  } catch (error) {
    // Error automatically captured by server.wrap()
    console.log('Error handled by wrapped function');
  }

  await new Promise(resolve => setTimeout(resolve, 100));
}

// Run all tests
async function runAllTests() {
  console.log('Testing Real-World Usage Patterns\n');

  await testServerUsage();
  await testDirectReaderUsage();
  await testManualCapture();
  await testWrappedFunction();

  console.log('\n✅ All tests completed!');
  console.log('💡 This is how users will actually use your library');
}

runAllTests().catch(console.error);