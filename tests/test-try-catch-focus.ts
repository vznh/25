import { server } from '../src/server.js';
import { Reader } from '../src/utils/reader.js';

// Example business logic functions that might throw errors
function validateUser(userData: any) {
  if (!userData.email) {
    throw new Error('Email is required');
  }
  if (!userData.email.includes('@')) {
    throw new Error('Invalid email format');
  }
  return userData;
}

function calculateTotal(items: any[]) {
  return items.reduce((sum, item) => {
    if (typeof item.price !== 'number' || item.price <= 0) {
      throw new TypeError('Invalid item price');
    }
    return sum + item.price;
  }, 0);
}

async function processOrder(orderData: any) {
  try {
    const user = validateUser(orderData.user);
    const total = calculateTotal(orderData.items);

    return {
      orderId: orderData.id,
      user: user.email,
      total,
      status: 'processed'
    };
  } catch (error) {
    throw new Error(`Order processing failed: ${(error as Error).message}`);
  }
}

async function analyzeForAI(errorContext: any) {
  // console.log('🤖 AI Analysis:');
  // console.log(`  Error: ${errorContext.error.message}`);
  // console.log(`  Call chain: ${errorContext.callChain.length} functions`);

  const errorFunction = errorContext.callChain.find(f => f.line);
  if (errorFunction) {
    console.log(`  Error location: ${errorFunction.method} at line ${errorFunction.line}`);
    console.log(`  Source code: ${errorFunction.sourceCode?.substring(0, 60)}...`);
  }

  // In real usage, this would return AI healing suggestions
  return {
    error: errorContext.error.message,
    suggestedFix: 'Add proper validation before processing',
    confidence: 0.95
  };
}

// Test 1: Basic try-catch with server.analyzeError
async function testBasicTryCatch() {
  console.log('=== Test 1: Basic Try-Catch ===');

  try {
    await processOrder({
      id: 'order-123',
      user: { email: 'invalid-email' }, // Will cause error
      items: [{ price: 100 }, { price: 50 }]
    });
  } catch (error) {
    // This is the primary usage pattern!
    const context = await server.analyzeError(error);
    console.log(context)
    // const aiAnalysis = await analyzeForAI(context);

    // console.log(`AI Suggestion: ${aiAnalysis.suggestedFix}`);
  }
}

// Test 2: Direct Reader usage
async function testDirectReaderUsage() {
  console.log('\n=== Test 2: Direct Reader Usage ===');

  const reader = new Reader();

  try {
    calculateTotal([
      { price: 100 },
      { price: 'invalid' }, // Will cause error
      { price: 50 }
    ]);
  } catch (error) {
    const context = await reader.analyzeRuntimeError(error as Error);
    console.log(context)
    // const aiAnalysis = await analyzeForAI(context);

    // console.log(`Functions in call chain: ${context.callChain.length}`);
    // console.log(`AI Confidence: ${aiAnalysis.confidence}`);
  }
}

// Test 3: Async error with detailed analysis
async function testAsyncErrorAnalysis() {
  console.log('\n=== Test 3: Async Error Analysis ===');

  try {
    await processOrder({
      id: 'order-456',
      user: null, // Will cause error
      items: [{ price: 200 }]
    });
  } catch (error) {
    const context = await server.analyzeError(error);

    console.log('Complete Call Chain:');
    context.callChain.forEach((fn: any, index: number) => {
      const location = fn.line ? `:${fn.line}` : '';
      const calls = fn.calls?.length ? ` (calls ${fn.calls.length})` : '';
      console.log(`  ${index + 1}. ${fn.method}${location}${calls}`);
    });
  }
}

// Test 4: Real-world async pattern
async function testRealWorldPattern() {
  console.log('\n=== Test 4: Real-World Async Pattern ===');

  // Simulate database operation
  async function fetchUserFromDB(userId: string) {
    if (!userId) {
      throw new Error('User ID required');
    }
    return { id: userId, email: 'user@example.com', tier: 'premium' };
  }

  async function processPayment(userId: string, amount: number) {
    const user = await fetchUserFromDB(userId);

    if (user.tier === 'premium' && amount > 1000) {
      throw new Error('Premium users have $1000 limit');
    }

    return { status: 'approved', amount };
  }

  try {
    await processPayment('user-123', 1500); // Will exceed limit
  } catch (error) {
    const context = await server.analyzeError(error);

    console.log('🔍 Error Analysis for Async Chain:');
    console.log(`  Error: ${context.error.message}`);
    console.log(`  Functions involved: ${context.callChain.length}`);

    // Show source code for the failing function
    const errorFunction = context.callChain.find(f => f.sourceCode && f.line);
    if (errorFunction) {
      console.log('\n📄 Failing Function Source:');
      console.log(errorFunction.sourceCode);
    }
  }
}

// Run all tests
async function runTryCatchTests() {
  console.log('🎯 Try-Catch Focused Error Analysis\n');

  await testBasicTryCatch();
  await testDirectReaderUsage();
  await testAsyncErrorAnalysis();
  await testRealWorldPattern();

  console.log('\n✅ All try-catch tests completed!');
  console.log('💡 Perfect for async code and business logic error handling');
}

runTryCatchTests().catch(console.error);