import type { Pre, Post } from "@/types/context";
import { Inference } from "../../services/inference";

class Logger {
  private inference: Inference;

  constructor(api: string = process.env.LOGGER_API_KEY!) {
    if (!api) {
      console.error("* No API key was detected.");
    }

    this.inference = new Inference({ key: api });
  }

  // in user app
  // logger.capture(error);
  async capture(error: unknown): Promise<void> {
    const pre = await this._build(error);
    const post = await this.inference.infer(pre);
    console.log(post);
    // print post to server console
    // return void
  }

  private async _build(error: unknown): Promise<Pre> {
    const original = error instanceof Error
      ? error 
      : new Error(String(error));
    const frames = this._st(original);

    console.log(`SERVER LOGGER - STACK FRAMES: ${JSON.stringify(frames)}`);
    console.log(`SERVER LOGGER - ERROR: ${original.message}`);

    if (frames.length === 0) {
      return {
        type: original.name,
        message: original.message,
        primary_location: { method: 'unknown', file: 'unknown', line: 0 },
        top: [],
        related: []
      };
    }

    const primaryFrame = frames[0];
    const pre = {
      type: original.name,
      message: original.message,
      primary_location: {
        method: primaryFrame?.method || 'unknown',
        file: primaryFrame?.file || 'unknown',
        line: primaryFrame?.line || 0
      },
      top: frames.slice(0, 5).map(frame => ({
        method: frame.method || undefined,
        file: frame.file || undefined,
        line: frame.line || undefined
      })),
      related: []
    } as Pre;

    console.log('SERVER LOGGER - BUILT CONTEXT:', pre);
    return pre;
  }

  private _st(error: Error): Array<{
    method: string | null;
    file: string | null;
    line: number | null;
    column: number | null;
  }> {
    if (!error.stack) return [];

    const frames = [];
    const lines = error.stack.split('\n');

    for (const line of lines) {
      const match = line.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?/);

      if (match && match[2] && match[3] && match[4]) {
        frames.push({
          method: match[1]?.trim() || null,
          file: match[2],
          line: parseInt(match[3]),
          column: parseInt(match[4])
        });
      }
    }

    const ignorePatterns = [
      '/node_modules/',
      'node:internal/',
      'node_modules/',
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
      'regenerator-runtime/',
      'internal/process/',
      'internal/bootstrap/'
    ];

    return frames.filter(frame => {
      if (!frame.file) return false;
      return !ignorePatterns.some(pattern => frame.file.includes(pattern));
    });
  }
}


export const logger = new Logger(
  process.env.LOGGER_API_KEY ?? ""
);
