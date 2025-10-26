import { Reader } from '../src/utils/reader.js';

const reader = new Reader();

function problematicFunction() {
  throw new Error('This is a test error from problematicFunction');
}

function callingFunction() {
  problematicFunction();
}

async function testSimpleError() {
  console.log('=== Testing Simple Error Analysis ===');

  try {
    callingFunction();
  } catch (error) {
    console.log('Caught error:', (error as Error).message);
    console.log('Stack trace:');
    console.log((error as Error).stack);

    const analysis = await reader.analyzeRuntimeError(error as Error);
    console.log('\n=== Error Analysis ===');
    console.log(JSON.stringify(analysis, null, 2));
  }
}

testSimpleError().catch(console.error);