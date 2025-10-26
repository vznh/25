import { Reader } from './utils/reader';

/**
 * Server error logger focused on try-catch integration
 * Provides enhanced error analysis for manual error handling
 */
export const server = {
  // Shared reader instance for error analysis
  reader: new Reader(),

  /**
   * Initialize the server library
   * Note: This library focuses on try-catch integration, not global error handlers
   */
  init() {
    console.log('[Error Logger] Server ready for try-catch error analysis');
  },

  /**
   * Analyze an error with complete call chain and source code
   * Main method for try-catch integration
   */
  async analyzeError(error: unknown): Promise<any> {
    const err = error instanceof Error ? error : new Error(String(error));
    return await this.reader.analyzeRuntimeError(err);
  },

  /**
   * Legacy method - same as analyzeError for compatibility
   */
  async captureError(error: unknown): Promise<any> {
    return await this.analyzeError(error);
  },

  /**
   * Wrap a function to automatically analyze errors it throws
   * Still requires try-catch to handle the wrapped errors
   */
  wrap<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: any[]) => {
      try {
        const result = fn(...args);
        // Handle async functions
        if (result instanceof Promise) {
          return result.catch(async (error) => {
            const context = await this.reader.analyzeRuntimeError(error as Error);
            console.log('[Wrapped Function Error Analysis Available]', {
              error: context.error.message,
              callChainLength: context.callChain.length,
              functionsInvolved: context.callChain.map(f => f.method).filter(Boolean)
            });
            throw error;
          });
        }
        return result;
      } catch (error) {
        this.reader.analyzeRuntimeError(error as Error).then(context => {
          console.log('[Wrapped Function Error Analysis Available]', {
            error: context.error.message,
            callChainLength: context.callChain.length,
            functionsInvolved: context.callChain.map(f => f.method).filter(Boolean)
          });
        });
        throw error;
      }
    }) as T;
  }
};
