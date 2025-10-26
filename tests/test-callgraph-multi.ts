import { Reader } from '../src/utils/reader.js';

const reader = new Reader();

async function runTest() {
  const fs = await import('fs/promises');

  // Create test files
  const fileA = 'testA.ts';
  const fileB = 'testB.ts';

  // File A: Working functions and error-throwing functions
  await fs.writeFile(fileA, `
function processData(data: any) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data: expected object');
  }
  return data.value * 2;
}

function fetchUserData(userId: string) {
  try {
    // Simulate fetching user data
    if (!userId) {
      throw new Error('User ID is required');
    }

    // This would normally fetch from API
    const userData = { id: userId, name: 'John', value: 42 };
    return processData(userData);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

function calculateTotal(items: number[]) {
  if (!Array.isArray(items)) {
    throw new TypeError('Expected array of numbers');
  }

  return items.reduce((sum, item) => {
    if (typeof item !== 'number') {
      throw new TypeError('All items must be numbers');
    }
    return sum + item;
  }, 0);
}

function workingFunction(x: number) {
  return x * x + 1;
}
`);

  // File B: Functions that use File A and have their own errors
  await fs.writeFile(fileB, `
import { fetchUserData, calculateTotal } from './testA.ts';

interface UserOrder {
  userId: string;
  items: { price: number; quantity: number }[];
}

function processOrder(order: UserOrder) {
  if (!order.userId) {
    throw new Error('Order must have user ID');
  }

  try {
    const userData = fetchUserData(order.userId);

    const itemPrices = order.items.map(item => {
      if (!item.price || item.price <= 0) {
        throw new Error('Invalid item price');
      }
      return item.price * item.quantity;
    });

    const total = calculateTotal(itemPrices);

    return { user: userData, total };
  } catch (error) {
    throw new Error(\`Order processing failed: \${error.message}\`);
  }
}

function validateInput(input: any) {
  if (input === null || input === undefined) {
    throw new Error('Input cannot be null or undefined');
  }
  return input;
}

function safeFunction() {
  return "This function works fine";
}
`);

  // Test callGraphMulti for both files
  const graph = await reader.callGraphMulti([fileA, fileB]);

  console.log('Multi-file call graph:', JSON.stringify(graph, null, 2));

  await fs.unlink(fileA);
  await fs.unlink(fileB);
}

runTest();
