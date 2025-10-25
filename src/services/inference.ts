import { type Config, type Context } from "@/types/inference";
import { logger } from "@/utils/logger";
import axios from "axios";

interface Structure {
  infer(pre: Context): Promise<any>;
  parse(raw: string, parsed: string): Promise<any>;
}

class Inference implements Structure {
  private key: string;

  constructor(cfg: Config) {
    this.key = cfg.key;
  }

  async parse(raw: string, parsed: string): Promise<any> {
    try {
      const response = await axios.post(this.selector(this.key), {
        model: "glm-4.5-air",
        messages: [this._prompt(raw, parsed)],
      });

      this.terraform(this.extract(response));
    } catch (e) {
      logger.error(`!!!
        * Error while parsing.
        *
        * ${e}
      !!!`);
    }
  }

  async infer(pre: Context): Promise<any> {
    try {
      const response = await axios.post(this.selector(this.key), {
        model: "glm-4.6",
        messages: [this.prompt(pre)],
      });

      return this.terraform(this.extract(response));
    } catch (e) {
      logger.error(`!!!
        * Error while inferring.
        *
        * ${e}
      !!!`);
    }
  }

  // builds prompt for infer
  private prompt(pre: Context) {
    return `You are an expert debugging assistant. Analyze the error context and provide a structured debugging report.
    Context provided:
    ${JSON.stringify(pre, null, 2)}

    Your task:
    1. Generate a one-line summary (simple, human-readable). It's meant to be displayed like:
    * Error: a() might hydrate before b().
    2. Extract relevant code snippets.
    3. Identify evidence of what went wrong.
    4. List required additional context.
    5. Note what information is missing.

    Return a JSON object that matches this structure:
    {
      "type": "error_type",
      "message": "detailed error message",
      "heuristic": "one-line summary for developers",
      "primary_location": { ... },
      "top": [ ... ],
      "related": [ ... ],
      "snippets": [
        {
          "file": "path/to/file",
          "start": 100,
          "lines": ["code line 1", "code line 2", ...]
        }
      ],
      "evidence": [
        {
          "file": "path/to/file",
          "line": 123,
          "why": "explanation of why this matters"
        }
      ],
      "required": [ ... ],
      "missing": [ ... ],
      "_omitted": { ... }
    }

    --- EXAMPLE ---
    Given that I had a runtime error at a(), s.t. b() calls d() and e(), c() calls f() and g(), and the error stack traces a(), b(), e(),
    we should identify the possible link on why e() was the root of the problem, in correlation to the full context of their functionality.

    Additionally, because b(), c(), f(), g() were dependencies of the original a(), we should involve those as possible investigations if no definitive problem was found in the initial files.

    Assume that we will use Cursor, so these tools are available for the agent:
    list_dir
    This tool is used to list the contents of a directory. It is particularly helpful for understanding the structure of files and folders within a project or for locating where specific components are stored.
    codebase_search
    A semantic search tool for the codebase. This allows users to find specific features, functions, or patterns in the code without having to know exact keywords or file locations, making it ideal for navigating large or unfamiliar projects.
    read_file
    This tool enables you to read the content of a specific file. It is useful for reviewing the details of code or configurations without opening the file in a separate editor.
    run_terminal_command
    With this tool, you can execute terminal commands directly from the IDE. It’s especially valuable for running Django management commands, executing scripts, or performing system-level operations without leaving the development environment.
    grep_search
    A tool that performs regex-based text searches. It is a powerful way to locate specific patterns or strings within files, making it highly effective for debugging or identifying code issues.
    file_search
    This tool searches for files based on their names. It is useful for quickly finding a specific file when you know its name but not its location in the directory.
    edit_file
    This tool allows you to modify the content of a file. It is essential for making code changes, updating configurations, or fixing bugs directly within the IDE.
    delete_file
    A tool to delete files. Use this to remove unnecessary or obsolete files from your project, helping keep your workspace organized.
    `;
  }

  // builds prompt for parse
  private _prompt(
    raw: string,
    parsed: string,
  ): { role: string; content: string } {
    return {
      role: "system",
      content: `You are a code analysis assistant. Your task is to enrich a partially parsed error context with missing details that will help another instance understand the error better.

      You will receive:
      1. A raw stack trace string,
      2. Partially parsed context (may have missing files, functions, or incomplete information)

      Your task is to:
      1. Identify what information is missing or incomplete,
      2. Infer function signatures, parameter types, and variable values wherever possible,
      3. Identify files or functions that might be relevant but weren't fully captured

      The raw trace stack:
      ${raw}

      The parsed interface we currently have (and for you to fill in):
      ${parsed}

      Return a JSON object in interface:
      {
        type?: string;
        message?: string;

        primary_location?: {
          file?: string;
          line?: number;
          method?: string;
        }

        top?: Array<{
          file?: string;
          line?: number;
          method?: string;
        }>;

        related?: Array<{
          file?: string;
          function?: string;
          start?: number;
          end?: number;
        }>;
      }

      Example JSON object:
      {
        "type": "error_type",
        "message": "Human readable error message",
        "primary_location": {
          "file": "path/to/file",
          "line": 123,
          "method": "functionName"
        },
        "top": [...],
        "related": [...]
      }
      `,
    };
  }

  // differentiates between openai, anthro, ...
  private selector(key: string): string {
    const k = (key ?? "").trim();
    if (!k) return "unknown";

    if (k.startsWith("sk-ant-")) return "https://api.anthropic.com/v1/messages";
    if (k.startsWith("sk-"))
      return "https://api.openai.com/v1/chat/completions";

    return "https://api.z.ai/api/paas/v4/chat/completions";
  }

  private extract(response: any): string {
    if (this.key.startsWith("sk-ant-")) {
      return response.data.content[0].text;
    }

    return response.data.choices[0].message.content;
  }

  // transforms raw string to proper JSON
  private terraform(raw: string): Object {
    return JSON.parse(raw);
  }

  // checks if VALID in any form (all forms valid, etc..)
  private validate() {}
}

export { Inference };
