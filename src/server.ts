import type { PreAIContext } from './types';
import { buildPreAIContext } from './utils/parser';

/**
 * Server error logger (Node.js/Bun)
 * Captures unhandled exceptions and promise rejections
 */
export const server = {
  /**
   * Initialize server error capture.
   * Captures unhandled exceptions and promise rejections.
   */
  init(onError?: (context: PreAIContext) => void) {
    // Capture unhandled exceptions
    process.on('uncaughtException', async (error) => {
      const context = await buildPreAIContext(error);
      console.error('[Uncaught Exception]', context);
      onError?.(context);
    });

    // Capture unhandled promise rejections
    process.on('unhandledRejection', async (reason) => {
      const context = await buildPreAIContext(reason);
      console.error('[Unhandled Rejection]', context);
      onError?.(context);
    });

    console.log('[Error Logger] Server error capture initialized');
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
        // Handle async functions
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
