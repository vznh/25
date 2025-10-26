import { server } from '../src/server.js';
import { Reader } from '../src/utils/reader.js';

// Example functions that will cause errors
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

// Function to show complete analyzeRuntimeError output
function showDetailedOutput(errorContext: any) {
  console.log('\n' + '='.repeat(60));
  console.log('🚨 COMPLETE reader.analyzeRuntimeError() OUTPUT:');
  console.log('='.repeat(60));

  console.log('\n📛 ERROR INFO:');
  console.log(`  Name: ${errorContext.error.name}`);
  console.log(`  Message: ${errorContext.error.message}`);

  console.log('\n🔗 CALL CHAIN:');
  console.log(`  Total functions: ${errorContext.callChain.length}`);
  errorContext.callChain.forEach((fn: any, index: number) => {
    const location = fn.line ? `${fn.file}:${fn.line}` : 'related function';
    const calls = fn.calls && fn.calls.length > 0 ? ` (calls ${fn.calls.length} functions)` : '';
    const calledBy = fn.calledBy && fn.calledBy !== 'related_to_error' ? ` ← ${fn.calledBy.split(':')[1]}` : '';

    console.log(`  ${index + 1}. ${fn.method} at ${location}${calls}${calledBy}`);
  });

  console.log('\n💻 SOURCE CODE ANALYSIS:');
  errorContext.callChain.forEach((fn: any, index: number) => {
    if (fn.sourceCode && fn.line) {
      console.log(`\n  📄 ${fn.method} (${fn.file}:${fn.line}):`);
      const lines = fn.sourceCode.split('\n');
      lines.slice(0, 4).forEach((line: string) => console.log(`     ${line}`));
      if (lines.length > 4) {
        console.log(`     ... (${lines.length - 4} more lines)`);
      }
    }
  });

  console.log('\n� RELATED FUNCTIONS AVAILABLE:');
  console.log(`  Total functions with source code: ${Object.keys(errorContext.relatedFunctions).length}`);
  Object.keys(errorContext.relatedFunctions).slice(0, 3).forEach((funcKey: string) => {
    const [file, method] = funcKey.split(':');
    console.log(`  - ${method} in ${file}`);
  });
  if (Object.keys(errorContext.relatedFunctions).length > 3) {
    console.log(`  ... and ${Object.keys(errorContext.relatedFunctions).length - 3} more`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ AI-READY CONTEXT FOR SELF-HEALING');
  console.log('='.repeat(60));
}

// Test 1: Show detailed output from server.init
async function testServerDetailedOutput() {
  console.log('=== Test 1: Server.init() Detailed Output ===');

  server.init(showDetailedOutput);

  // Trigger unhandled error that server.init will catch
  setTimeout(() => {
    handleOrder({
      id: 'order-123',
      user: { name: 'John' }, // Missing email
      payment: { amount: 100 }
    });
  }, 100);

  await new Promise(resolve => setTimeout(resolve, 300));
}

// Test 2: Show detailed output from direct Reader usage
async function testReaderDetailedOutput() {
  console.log('\n=== Test 2: Direct Reader.analyzeRuntimeError() Output ===');

  const reader = new Reader();

  try {
    handleOrder({
      id: 'order-456',
      user: { email: 'test@example.com' },
      payment: { amount: -50 } // Invalid amount
    });
  } catch (error) {
    const context = await reader.analyzeRuntimeError(error as Error);
    showDetailedOutput(context);
  }
}

// Test 3: Show detailed output from server.captureError
async function testManualCaptureDetailedOutput() {
  console.log('\n=== Test 3: server.captureError() Detailed Output ===');

  try {
    handleOrder({
      id: 'order-789',
      user: null, // Will cause error
      payment: { amount: 50 }
    });
  } catch (error) {
    const context = await server.captureError(error);
    showDetailedOutput(context);
  }
}

// Run all tests
async function runDetailedTests() {
  console.log('🔍 SHOWING COMPLETE reader.analyzeRuntimeError() OUTPUT\n');

  await testServerDetailedOutput();
  await testReaderDetailedOutput();
  await testManualCaptureDetailedOutput();

  console.log('\n🎉 All detailed tests completed!');
  console.log('💡 You can see the complete call chain with source code');
}

runDetailedTests().catch(console.error);