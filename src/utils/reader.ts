import * as fs from "fs/promises";
import * as path from "path";
import { logger } from "./logger";

class Reader {
  async read(
    type: "browser" | "server",
    file: string,
    line: number,
    context: number,
  ) {
    if (type === "browser") {}
    if (type === "server") {
      const absolute = path.resolve(process.cwd(), file);

      try {
        const content = await fs.readFile(absolute, "utf-8");
        const lines = content.split('\n');

        const start = Math.max(0, line - context - 1);
        const end = Math.min(lines.length, line + context);

        return lines.slice(start, end);
      } catch (e) {
        logger.error(`Couldn't read file: ${absolute}\n${e}`);
        return [];
      }
    }
  }

  _imports(src: string): string[] {
    const imports: string[] = [];

    const es6 = /^import\s+.*?from\s+['"](.+?)['"]/gm;
    let match;
    while ((match = es6.exec(src)) !== null) {
      imports.push(match[1]!);
    }

    const cjs = /require\(['"](.+?)['"\)]/g;
    while ((match = cjs.exec(src)) !== null) {
      imports.push(match[1]!);
    }

    return [] // todo
  }

  _range(src: string, line: number): { start: number, end: number } {
    return { start: 0, end: 0 } // todo
  }

  async callGraph(file: string): Promise<Record<string, { calls: string[], file: string, start: number, end: number, method: string }>> {
    const absolute = path.resolve(process.cwd(), file);
    const content = await fs.readFile(absolute, "utf-8");
    const lines = content.split('\n');
    const src = content;
    const functions: Record<string, { start: number, end: number }> = {};
    const calls: Record<string, string[]> = {};
    const functionRegex = /(?:function\s+([a-zA-Z0-9_]+)|([a-zA-Z0-9_]+)\s*=\s*\(.*?\)\s*=>|([a-zA-Z0-9_]+)\s*:\s*function|class\s+([a-zA-Z0-9_]+))/g;
    let match;
    while ((match = functionRegex.exec(src)) !== null) {
      const name = match[1] || match[2] || match[3] || match[4];
      if (name) {
        const start = src.slice(0, match.index).split('\n').length - 1;
        let end = lines.length;
        for (let i = start + 1; i < lines.length; i++) {
          const line = lines[i];
          if (typeof line === 'string' && /^}/.test(line.trim())) {
            end = i + 1;
            break;
          }
        }
        functions[name] = { start, end };
        calls[name] = [];
      }
    }
    Object.keys(functions).forEach(fn => {
      const fnMeta = functions[fn];
      if (!fnMeta) return;
      const { start, end } = fnMeta;
      const body = lines.slice(start, end).join('\n');
      const callRegex = /([a-zA-Z0-9_]+)\s*\(/g;
      let callMatch;
      const called: Set<string> = new Set();
      while ((callMatch = callRegex.exec(body)) !== null) {
        const callee = callMatch[1];
        if (callee && callee !== fn) {
          called.add(callee);
        }
      }
      calls[fn] = Array.from(called);
    });
    const builtIns = [
      'map', 'filter', 'reduce', 'forEach', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
      'push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'sort', 'reverse', 'find', 'findIndex', 'includes',
      'Object', 'Array', 'String', 'Number', 'Boolean', 'Promise', 'Math', 'Date', 'RegExp', 'JSON', 'parseInt', 'parseFloat'
    ];
    const result: Record<string, { calls: string[], file: string, start: number, end: number, method: string }> = {};
    Object.keys(calls).forEach(fn => {
      const calleeList = calls[fn] || [];
      result[fn] = {
        calls: calleeList.filter(callee => (functions[callee] !== undefined) || builtIns.includes(callee)),
        file,
        start: functions[fn]?.start ?? -1,
        end: functions[fn]?.end ?? -1,
        method: fn
      };
    });
    return result;
  }
}

export { Reader };
