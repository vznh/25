import type { Pre, Post } from "@/types/context";

class Logger {
  private api: string;

  constructor(api: string = process.env.LOGGER_API_URL!) {
    if (!api) {
      // throw an error here
    }

    this.api = api;
  }

  async capture(error: unknown): Promise<void> {
    const pre = this._build(error) as Pre;

    // go all in one
    await fetch(`${this.api}/api/logger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pre),
    });

    return;
  }

  // 1st pass
  private _build(error: unknown): Pre {
    const original = error instanceof Error ? error : new Error(String(error));
    const frames = this._st(original);

    if (frames.length === 0) {
      return {
        type: original.name,
        message: original.message,
        original: String(original),
        primary_location: { method: "unknown", file: "unknown", line: 0 },
        top: [],
        related: [],
      } as Pre;
    }

    return {
      type: original.name,
      message: original.message,
      original: String(original),
      primary_location: {
        method: frames[0]?.method ?? "unknown",
        file: frames[0]?.file ?? "unknown",
        line: frames[0]?.line ?? 0,
      },
      top: frames.slice(0, 5).map((f) => ({
        method: f.method || undefined,
        file: f.file || undefined,
        line: f.line || undefined,
      })),
      related: [],
    } as Pre;
  }

  private _st(error: Error): Array<{
    method: string | null;
    file: string | null;
    line: number | null;
    column: number | null;
  }> {
    if (!error.stack) return [];

    const frames = [];
    const lines = error.stack.split("\n");

    for (const line of lines) {
      // Chrome/Edge: "at functionName (file:line:column)"
      // Firefox: "functionName@file:line:column"

      const chrome = line.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?/);
      const firefox = line.match(/(.+?)@(.+?):(\d+):(\d+)/);

      if (chrome && chrome[2] && chrome[3] && chrome[4]) {
        frames.push({
          method: chrome[1]?.trim() || null,
          file: chrome[2],
          line: parseInt(chrome[3]),
          column: parseInt(chrome[4]),
        });
      } else if (firefox && firefox[2] && firefox[3] && firefox[4]) {
        frames.push({
          method: firefox[1]?.trim() || null,
          file: firefox[2],
          line: parseInt(firefox[3]),
          column: parseInt(firefox[4]),
        });
      }
    }

    const ignorePatterns = [
      "/node_modules/",
      "_next/static/chunks/",
      "next/dist/",
      "webpack.js",
      "__webpack_require__",
      "webpackJsonpCallback",
      "vite/",
      "@vite/",
      "parcel/",
      "@parcel/",
      "rollup/",
      "@rollup/",
      "react-dom/",
      "react/cjs/",
      "angular/",
      "@angular/",
      "svelte/",
      "@svelte/",
      "vue/",
      "@vue/",
      "core-js/",
      "babel/",
      "@babel/",
      "zone.js",
      "systemjs/",
      "esm/",
      "@esm/",
      "regenerator-runtime/",
    ];

    return frames.filter((frame) => {
      if (!frame.file) return false;
      return !ignorePatterns.some((pattern) => frame.file.includes(pattern));
    });
  }
}

export const logger = new Logger(process.env.NEXT_PUBLIC_LOGGER_API_URL);
