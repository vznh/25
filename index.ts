// Main entry point with automatic environment detection
export type { PreAIContext, StackFrame, CodeSnippet, RelatedFunction } from './src/types';

/**
 * Automatically detect environment and return appropriate logger
 */
export function createLogger() {
  if (typeof window !== 'undefined') {
    // Browser environment
    return require('./src/browser').browser;
  } else {
    // Server environment (Node.js/Bun/Deno)
    return require('./src/server').server;
  }
}

// Export both for explicit usage
export { browser } from './src/browser';
export { server } from './src/server';

// Auto-detected logger (recommended for most use cases)
export const logger = createLogger();