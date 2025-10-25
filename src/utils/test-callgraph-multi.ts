import { Reader } from './reader.js';

const reader = new Reader();

async function runTest() {
  const fs = await import('fs/promises');

  // Create test files
  const fileA = 'testA.ts';
  const fileB = 'testB.ts';


  // d() is not imported to test import parsing functionality
  // if it is not imported, it will not be included in the output
  await fs.writeFile(fileA, `
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
`);

  // as we can see here, a() is imported, and the reader is able to correctly import from a
  await fs.writeFile(fileB, `
import { a } from './testA.ts';
function d() {
  Array.prototype.map.call([1,2,3], x => x * 2);
}
function e() {
  a();
}
`);

  // Test callGraphMulti for both files
  const graph = await reader.callGraphMulti([fileA, fileB]);

  console.log('Multi-file call graph:', JSON.stringify(graph, null, 2));

  await fs.unlink(fileA);
  await fs.unlink(fileB);
}

runTest();
