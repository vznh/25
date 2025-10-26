import type { Pre, Post } from "@/types/context";
import { parseStackTrace } from "@/utils/parser";

class Logger {
  private api: string;

  constructor(api: string = process.env.LOGGER_API_URL!) {
    if (!api) {
      // throw an error here
    }

    this.api = api;
  }

  async capture(error: unknown): Promise<Post> {
    const pre = await this._build(error);

    const response = await fetch(
      `${this.api}/api/logger`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pre)
      }
    );

    return response.json();
  }

  private async _build(error: unknown): Promise<Pre> {
    // maintain original stack trace
    // parse copy of stack trace here
    // filter copy of stack trace here
    // call ai func to fill in missing details from original and parsed stack trace
    // return as Pre
    const err = error instanceof Error ? error : new Error(String(error));
    const stackFrames = this._parseStackTrace(err);
    console.log(`STACK FRAMES: ${JSON.stringify(stackFrames)}`)
    console.log(`ERR: ${err}`)
    if (stackFrames.length === 0) {
      return {
        type: err.name,
        message: err.message,
        heuristic: `Error: ${err.message}`,
        primary_location: { method: 'unknown', file: 'unknown', line: 0 },
        top: [],
        related: []
      };
    }

    const primaryFrame = stackFrames[0];
    const preAI = {
      type: err.name,
      message: err.message,
      heuristic: this._generateHeuristic(err.message, primaryFrame),
      primary_location: {
        method: primaryFrame?.method || 'unknown',
        file: primaryFrame?.file || 'unknown',
        line: primaryFrame?.line || 0
      },
      top: stackFrames.slice(0, 5).map(frame => ({
        method: frame.method || undefined,
        file: frame.file || undefined,
        line: frame.line || undefined
      })),
      related: []
    };
    console.log(preAI);
    return preAI
  }

  private _parseStackTrace(error: Error): Array<{
    method: string | null;
    file: string | null;
    line: number | null;
    column: number | null;
  }> {
    if (!error.stack) return [];

    const frames = [];
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

  private _generateHeuristic(message: string, frame: any): string {
    const method = frame.method || 'unknown function';
    const file = frame.file ? frame.file.split('/').pop() : 'unknown file';

    if (message.includes('Cannot read property')) {
      return `Null/undefined error in ${method}`;
    }
    if (message.includes('Network')) {
      return `Network error in ${method}`;
    }
    if (message.includes('timeout')) {
      return `Timeout error in ${method}`;
    }

    return `${message.split(':')[0]} in ${method} (${file})`;
  }
}

export const logger = new Logger(process.env.NEXT_PUBLIC_LOGGER_API_URL);
