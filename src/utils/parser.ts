import type { StackFrame, PreAIContext } from '../types';

/**
 * Parse browser error stack traces into structured frames
 * Supports Chrome/Edge and Firefox stack formats
 */
export function parseStackTrace(error: unknown): StackFrame[] {
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
    
    if (chromeMatch && chromeMatch[2] && chromeMatch[3] && chromeMatch[4]) {
      frames.push({
        method: chromeMatch[1]?.trim() || null,
        file: chromeMatch[2],
        line: parseInt(chromeMatch[3]),
        column: parseInt(chromeMatch[4])
      });
    } else if (firefoxMatch && firefoxMatch[2] && firefoxMatch[3] && firefoxMatch[4]) {
      frames.push({
        method: firefoxMatch[1]?.trim() || null,
        file: firefoxMatch[2],
        line: parseInt(firefoxMatch[3]),
        column: parseInt(firefoxMatch[4])
      });
    }
  }

    // Filter out frames from common framework/build tool files
    const ignorePatterns = [
      '/node_modules/',
      '_next/static/chunks/',
      'next/dist/',
      'webpack.js',
      '__webpack_require__',
      'webpackJsonpCallback',
      'vite/',
      '@vite/',
      'parcel/',
      '@parcel/',
      'rollup/',
      '@rollup/',
      'react-dom/',
      'react/cjs/',
      'angular/',
      '@angular/',
      'svelte/',
      '@svelte/',
      'vue/',
      '@vue/',
      'core-js/',
      'babel/',
      '@babel/',
      'zone.js',
      'systemjs/',
      'esm/',
      '@esm/',
      'regenerator-runtime/'
    ];

    return frames.filter(frame => {
      if (!frame.file) return false;
      return !ignorePatterns.some(pattern => frame.file.includes(pattern));
    });
}

/**
 * Build complete AI-ready context from an error
 */
export async function buildPreAIContext(err: unknown): Promise<PreAIContext> {
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
