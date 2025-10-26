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

  async callGraph(files: string[] | string): Promise<Record<string, { calls: string[], file: string, start_line: number, end_line: number, method: string, importedFrom?: string, sourceCode?: string }>> {
    if (typeof files === 'string') {
      return await this.callGraphMulti([files]);
    }
    return await this.callGraphMulti(files);
  }

  /**
   * Analyze a runtime error and extract source code for functions in its stack trace
   * Designed to be used in try-catch blocks for async/ unpredictable errors
   */
  async analyzeRuntimeError(error: Error): Promise<{
    error: { name: string; message: string; stack?: string };
    callChain: Array<{
      file: string;
      method: string | null;
      line: number | null;
      column: number | null;
      sourceCode?: string;
      calls?: string[];  // What this function calls
      calledBy?: string; // What called this function
    }>;
    relatedFunctions: Record<string, { sourceCode: string; file: string; start_line: number; end_line: number; method: string; calls: string[] }>;
  }> {
    const stackFrames = this._parseStackFrame(error);
    const functionsInError: Set<string> = new Set();
    const sourceCodeMap: Record<string, { sourceCode: string; file: string; start_line: number; end_line: number; method: string; calls: string[] }> = {};

    // Extract unique files from stack trace
    const filesInStack = new Set<string>();
    stackFrames.forEach(frame => {
      if (frame.file && !frame.file.includes('node_modules') && this._isUserFile(frame.file)) {
        filesInStack.add(frame.file);
        if (frame.method) {
          functionsInError.add(`${frame.file}:${frame.method}`);
        }
      }
    });

    // Build complete call graph for all files involved
    if (filesInStack.size > 0) {
      const callGraph = await this.callGraphMulti(Array.from(filesInStack));

      // Extract source code for ALL functions in the involved files
      Object.keys(callGraph).forEach(functionKey => {
        if (callGraph[functionKey] && callGraph[functionKey].sourceCode) {
          sourceCodeMap[functionKey] = {
            sourceCode: callGraph[functionKey].sourceCode!,
            file: callGraph[functionKey].file,
            start_line: callGraph[functionKey].start_line,
            end_line: callGraph[functionKey].end_line,
            method: callGraph[functionKey].method,
            calls: callGraph[functionKey].calls || []
          };
        }
      });

      // Expand the call chain to include ALL related functions
      const expandedFunctions = new Set(functionsInError);
      let toExplore = Array.from(functionsInError);

      while (toExplore.length > 0) {
        const currentBatch = toExplore;
        toExplore = [];

        currentBatch.forEach(functionKey => {
          if (callGraph[functionKey]) {
            // Add functions this one calls
            callGraph[functionKey].calls.forEach(calledFunction => {
              if (!expandedFunctions.has(calledFunction) && !calledFunction.includes('setTimeout') && !calledFunction.includes('Array')) {
                expandedFunctions.add(calledFunction);
                toExplore.push(calledFunction);
              }
            });

            // Find functions that call this one
            Object.keys(callGraph).forEach(potentialCaller => {
              if (callGraph[potentialCaller].calls.includes(functionKey) && !expandedFunctions.has(potentialCaller)) {
                expandedFunctions.add(potentialCaller);
                toExplore.push(potentialCaller);
              }
            });
          }
        });
      }

      // Update functionsInError to include expanded call chain
      expandedFunctions.forEach(fn => functionsInError.add(fn));
    }

    // Build enhanced call chain with relationships
    const callChain = stackFrames.map((frame, index) => {
      const functionKey = frame.method ? `${frame.file}:${frame.method}` : null;
      const functionData = functionKey && sourceCodeMap[functionKey] ? sourceCodeMap[functionKey] : null;

      return {
        ...frame,
        sourceCode: functionData?.sourceCode,
        calls: functionData?.calls || [],
        calledBy: index > 0 ? `${stackFrames[index - 1].file}:${stackFrames[index - 1].method}` : undefined
      };
    });

    // Add any additional functions from the expanded call chain that aren't in the stack trace
    const stackFunctionKeys = new Set(callChain.map(f => `${f.file}:${f.method}`));
    Object.keys(sourceCodeMap).forEach(functionKey => {
      if (!stackFunctionKeys.has(functionKey)) {
        const [file, method] = functionKey.split(':');
        const functionData = sourceCodeMap[functionKey];
        callChain.push({
          file,
          method,
          line: null,
          column: null,
          sourceCode: functionData.sourceCode,
          calls: functionData.calls,
          calledBy: 'related_to_error' // Mark as related but not directly in stack
        });
      }
    });

    return {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      callChain,
      relatedFunctions: sourceCodeMap
    };
  }

  /**
   * Parse stack trace from error into structured frames
   */
  private _parseStackFrame(error: Error): Array<{
    file: string;
    method: string | null;
    line: number | null;
    column: number | null;
  }> {
    if (!error.stack) return [];

    const frames: Array<{ file: string; method: string | null; line: number | null; column: number | null }> = [];
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

    // Filter out system files and focus on user code
    return frames.filter(frame =>
      this._isUserFile(frame.file) && frame.line !== null
    );
  }

  /**
   * Check if file is user code (not node_modules or system files)
   */
  private _isUserFile(filePath: string): boolean {
    const ignorePatterns = [
      '/node_modules/',
      '_next/static/chunks/',
      'next/dist/',
      'webpack.js',
      '__webpack_require__',
      'vite/',
      '@vite/',
      'parcel/',
      'rollup/',
      'react-dom/',
      'react/cjs/',
      'core-js/',
      'babel/',
      'zone.js',
      'systemjs/',
      'regenerator-runtime/',
      'native',
      'moduleEvaluation',
      'loadAndEvaluateModule'
    ];

    // Also ignore if the file path doesn't have an extension and looks like a system file
    const isSystemFile = !filePath.includes('.') ||
                       filePath === 'native' ||
                       filePath.includes('moduleEvaluation') ||
                       filePath.includes('loadAndEvaluateModule');

    return !ignorePatterns.some(pattern => filePath.includes(pattern)) && !isSystemFile;
  }

  async callGraphMulti(files: string[]): Promise<Record<string, { calls: string[], file: string, start_line: number, end_line: number, method: string, importedFrom?: string, sourceCode?: string }>> {
    const allFunctions: Record<string, { file: string, start: number, end: number }> = {};
    const allImports: Record<string, Record<string, string>> = {};
    const builtIns = [
      'map', 'filter', 'reduce', 'forEach', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
      'push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'sort', 'reverse', 'find', 'findIndex', 'includes',
      'Object', 'Array', 'String', 'Number', 'Boolean', 'Promise', 'Math', 'Date', 'RegExp', 'JSON', 'parseInt', 'parseFloat'
    ];
    for (const file of files) {
      const absolute = path.resolve(process.cwd(), file);
      const content = await fs.readFile(absolute, "utf-8");
      const lines = content.split('\n');
      const src = content;
      // Parse imports
      const imports: Record<string, string> = {};
      const es6 = /^import\s+\{?\s*([a-zA-Z0-9_,\s]+)\s*\}?\s*from\s+['"](.+?)['"]/gm;
      let match;
      while ((match = es6.exec(src)) !== null) {
        const importedNames = match[1]!.split(',').map(s => s.trim());
        const importPath = match[2]!;
        importedNames.forEach(name => {
          if (name) imports[name] = importPath;
        });
      }
      allImports[file] = imports;
      // Parse functions
      const functionRegex = /(?:function\s+([a-zA-Z0-9_]+)|([a-zA-Z0-9_]+)\s*=\s*\(.*?\)\s*=>|([a-zA-Z0-9_]+)\s*:\s*function|class\s+([a-zA-Z0-9_]+))/g;
      let fnMatch;
      while ((fnMatch = functionRegex.exec(src)) !== null) {
        const name = fnMatch[1] || fnMatch[2] || fnMatch[3] || fnMatch[4];
        if (name) {
          const start = src.slice(0, fnMatch.index).split('\n').length - 1;
          let end = lines.length;
          for (let i = start + 1; i < lines.length; i++) {
            const line = lines[i];
            if (typeof line === 'string' && /^}/.test(line.trim())) {
              end = i + 1;
              break;
            }
          }
          allFunctions[`${file}:${name}`] = { file, start, end };
        }
      }
    }
    // Build call graph
    const result: Record<string, { calls: string[], file: string, start_line: number, end_line: number, method: string, importedFrom?: string, sourceCode?: string }> = {};
    for (const file of files) {
      const absolute = path.resolve(process.cwd(), file);
      const content = await fs.readFile(absolute, "utf-8");
      const lines = content.split('\n');
      const src = content;
      const functions: Record<string, { start: number, end: number }> = {};
      const functionRegex = /(?:function\s+([a-zA-Z0-9_]+)|([a-zA-Z0-9_]+)\s*=\s*\(.*?\)\s*=>|([a-zA-Z0-9_]+)\s*:\s*function|class\s+([a-zA-Z0-9_]+))/g;
      let fnMatch;
      while ((fnMatch = functionRegex.exec(src)) !== null) {
        const name = fnMatch[1] || fnMatch[2] || fnMatch[3] || fnMatch[4];
        if (name) {
          const start = src.slice(0, fnMatch.index).split('\n').length - 1;
          let end = lines.length;
          for (let i = start + 1; i < lines.length; i++) {
            const line = lines[i];
            if (typeof line === 'string' && /^}/.test(line.trim())) {
              end = i + 1;
              break;
            }
          }
          functions[name] = { start, end };
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
            // Check if callee is imported
            const importedFrom = allImports[file][callee] || undefined;
            if (importedFrom) {
              called.add(`${importedFrom}:${callee}`);
            } else if (functions[callee]) {
              called.add(`${file}:${callee}`);
            } else if (builtIns.includes(callee)) {
              called.add(callee);
            }
          }
        }
        // Extract the complete function source code including the function signature
        const sourceCode = lines.slice(start, end).join('\n');
        result[`${file}:${fn}`] = {
          calls: Array.from(called),
          file,
          start_line: fnMeta.start,
          end_line: fnMeta.end,
          method: fn,
          importedFrom: undefined,
          sourceCode
        };
      });
    }
    return result;
  }
}

export { Reader };
