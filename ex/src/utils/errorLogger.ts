export type StackFrame = {
  file: string;
  line: number | null; 
  column?: number | null; 
  method?: string | null
};

export type CodeSnippet = {
  file: string; 
  startLine: number; 
  lines: string[]
};

export type PreAIContext = {
  error: { name: string; message: string };
  frames: Array<StackFrame>;
  codeSnippets: Array<CodeSnippet>;
  relatedFunctions: Array<{ 
    file: string; 
    functionName: string | null; 
    startLine?: number | null; 
    endLine?: number | null 
  }>;
};

// Simple stack parser for browser
function parseStackTrace(error: unknown): StackFrame[] {
  if (!(error instanceof Error) || !error.stack) {
    return [];
  }

  const frames: StackFrame[] = [];
  const lines = error.stack.split('\n');

  for (const line of lines) {
    // Chrome/Edge format: "at functionName (file:line:column)"
    // Firefox format: "functionName@file:line:column"
    
    const chromeMatch = line.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?/);
    const firefoxMatch = line.match(/(.+?)@(.+?):(\d+):(\d+)/);
    
    if (chromeMatch) {
      frames.push({
        method: chromeMatch[1]?.trim() || null,
        file: chromeMatch[2],
        line: parseInt(chromeMatch[3]),
        column: parseInt(chromeMatch[4])
      });
    } else if (firefoxMatch) {
      frames.push({
        method: firefoxMatch[1]?.trim() || null,
        file: firefoxMatch[2],
        line: parseInt(firefoxMatch[3]),
        column: parseInt(firefoxMatch[4])
      });
    }
  }

  return frames;
}

async function buildPreAIContext(err: unknown): Promise<PreAIContext> {
  const frames = parseStackTrace(err);
  
  return {
    error: {
      name: err instanceof Error ? err.name : 'Error',
      message: err instanceof Error ? err.message : String(err)
    },
    frames,
    codeSnippets: [], // TODO: Fetch source code for each frame
    relatedFunctions: []
  };
}

// Browser error logger
export const browser = {
  /**
   * Initialize browser error capture.
   * Captures unhandled errors, promise rejections, and manual error reports.
   */
  init(onError?: (context: PreAIContext) => void) {
    // Capture unhandled errors
    window.addEventListener('error', async (event) => {
      event.preventDefault(); // Prevent default console error
      const context = await buildPreAIContext(event.error);
      console.error('[Browser Error Captured]', context);
      onError?.(context);
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', async (event) => {
      event.preventDefault(); // Prevent default console error
      const context = await buildPreAIContext(event.reason);
      console.error('[Unhandled Promise Rejection Captured]', context);
      onError?.(context);
    });

    console.log('[Error Logger] Browser error capture initialized');
  },

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

// Utility function to log errors to server
const logToServer = (type: string, error: any) => {
  fetch('/api/log-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      error: error.message || error,
      timestamp: new Date().toISOString()
    })
  }).catch(() => {}) // Ignore fetch errors
}