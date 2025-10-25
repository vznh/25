import type { PreAIContext } from './types';
import { buildPreAIContext } from './utils/parser';

/**
 * Browser error logger
 * Captures unhandled errors, promise rejections, and provides manual error reporting
 */
export const browser = {
  init(onError?: (context: PreAIContext) => void) {
    if (typeof window === 'undefined') {
      throw new Error('[Error Logger] browser.init() can only be called in a browser environment');
    }
    
    // Capture unhandled errors
    window.addEventListener('error', async (event: ErrorEvent) => {
      event.preventDefault(); // Prevent default console error
      const context = await buildPreAIContext(event.error);
      console.error('[Browser Error Captured]', context);
      onError?.(context);
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', async (event: PromiseRejectionEvent) => {
      event.preventDefault();
      const context = await buildPreAIContext(event.reason);
      console.error('[Unhandled Promise Rejection Captured]', context);
      onError?.(context);
    });

    console.log('[Error Logger] Browser error capture initialized');
  },

  /**
   * Manually capture an error with full context
   */
  async captureError(error: unknown): Promise<PreAIContext> {
    return await buildPreAIContext(error);
  },

  /**
   * Wrap a function to automatically capture any errors it throws
   */
  wrap<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: any[]) => {
      try {
        const result = fn(...args);
        if (result instanceof Promise) {
          return result.catch(async (error) => {
            const context = await buildPreAIContext(error);
            console.error('[Wrapped Function Error]', context);
            throw error;
          });
        }
        return result;
      } catch (error) {
        buildPreAIContext(error).then(context => {
          console.error('[Wrapped Function Error]', context);
        });
        throw error;
      }
    }) as T;
  }
};
