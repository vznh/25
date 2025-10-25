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
}

export { Reader };
