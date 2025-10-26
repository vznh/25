import { Reader } from '../src/utils/reader.js';

const reader = new Reader();

async function runTest() {
  // Create a test file with working functions and error-throwing functions
  const testFile = 'test-nested.ts';
  const fs = await import('fs/promises');
  await fs.writeFile(testFile, `
function validateUser(user: any) {
  if (!user || typeof user !== 'object') {
    throw new Error('User must be an object');
  }
  if (!user.id) {
    throw new Error('User must have an ID');
  }
  return user;
}

function processUserData(user: any) {
  try {
    const validatedUser = validateUser(user);

    if (!validatedUser.profile) {
      throw new Error('User profile is missing');
    }

    return {
      id: validatedUser.id,
      name: validatedUser.profile.name || 'Unknown',
      processed: true
    };
  } catch (error) {
    console.error('User processing failed:', error);
    throw new Error(\`Failed to process user: \${error.message}\`);
  }
}

function calculateDiscount(price: number, userLevel: string) {
  if (typeof price !== 'number' || price <= 0) {
    throw new TypeError('Price must be a positive number');
  }

  const discountRates = {
    'bronze': 0.05,
    'silver': 0.10,
    'gold': 0.15
  };

  const rate = discountRates[userLevel];
  if (!rate) {
    throw new Error('Invalid user level');
  }

  return price * rate;
}

function workingHelper(data: string) {
  return data.toUpperCase().trim();
}

function mainOperation(input: any) {
  const user = processUserData(input);
  const cleanName = workingHelper(user.name);
  const discount = calculateDiscount(100, user.level || 'bronze');

  return { user: { ...user, name: cleanName }, discount };
}
  `);

  const graph = await reader.callGraph(testFile);
  console.log('Call graph:', JSON.stringify(graph, null, 2));
  await fs.unlink(testFile);
}

runTest();
