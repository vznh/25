import { Reader } from './reader.js';

const reader = new Reader();

async function runTest() {
  // Create a test file with nested functions
  const testFile = 'test-nested.ts';
  const fs = await import('fs/promises');
  await fs.writeFile(testFile, `
    function a() {
    b();
    c();
    }
    function b() {
    d();
    }
    function c() {
    setTimeout(() => {}, 100);
    }
    function d() {
    Array.prototype.map.call([1,2,3], x => x * 2);
    }
  `);

  const graph = await reader.callGraph(testFile);
  console.log('Call graph:', JSON.stringify(graph, null, 2));
  await fs.unlink(testFile);
}

runTest();
