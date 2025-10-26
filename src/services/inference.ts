import type { Config, Response } from "../types/inference";
import { Pre, Post, Preparsed, Postparsed } from "../types/context";
import { logger } from "../utils/logger";
import axios, { isAxiosError } from "axios";

interface Structure {
  infer(pre: Pre): Promise<Post | Object | Response>;
  parse(parsed: Pre): Promise<Pre | Response>;
}

class Inference implements Structure {
  private key: string;

  constructor(cfg: Config) {
    this.key = cfg.key;
  }

  // first pass (building pre)
  async parse(parsed: Pre): Promise<Pre | Response> {
    try {
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: "claude-sonnet-4-5",
          messages: this._prompt(parsed),
          max_tokens: 10996,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "ANTHROPIC-VERSION": "2023-06-01",
            "X-API-KEY": `${this.key}`,
          },
        },
      );

      const result = this.terraform(this.extract(response));

      return result;
    } catch (e) {
      if (isAxiosError(e)) {
        logger.info(e?.response?.status);
        logger.error("* Is an AxiosError, check API key.");
      }
      logger.fatal(`* Ran into a major error. Not your fault.`);
      return { success: false, error: "* Unknown error occurred." };
    }
  }

  // last pass (building post)
  async infer(pre: Pre): Promise<Post | Object | Response> {
    try {
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: "claude-sonnet-4-5",
          messages: this.prompt(pre),
          max_tokens: 10996,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "ANTHROPIC-VERSION": "2023-06-01",
            "X-API-KEY": `${this.key}`,
          },
        },
      );

      const result = this.terraform(this.extract(response));

      return result;
    } catch (e) {
      if (isAxiosError(e)) {
        logger.info(e?.response?.status);
        logger.info(e.response?.data)
        logger.error("* Is an AxiosError, check API key.");
      }
      logger.fatal(`* Ran into a major error. Not your fault.`);
      return { success: false, error: "* Unknown error occurred." };
    }
  }

  // builds prompt for infer
  private prompt(pre: Pre): { role: string; content: string }[] {
    return [
      {
        role: "assistant",
        content: `You are an expert debugging assistant. Analyze the error context and provide a structured debugging report.

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
    `,
      },
      {
        role: "user",
        content: `Context provided: ${JSON.stringify(pre)}`,
      },
    ];
  }

  // builds prompt for parse
  private _prompt(
    parsed: Pre,
  ): { role: string; content: string }[] {
    return [
      {
        role: "assistant",
        content: `You are a code analysis assistant. Your task is to enrich a partially parsed error context with missing details that will help another instance understand the error better.

      You will receive:
      1. A raw stack trace string,
      2. Partially parsed context (may have missing files, functions, or incomplete information)

      Your task is to:
      1. Identify what information is missing or incomplete,
      2. Infer function signatures, parameter types, and variable values wherever possible,
      3. Identify files or functions that might be relevant but weren't fully captured

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
      },
      {
        role: "user",
        content: `The parsed interface we currently have (and for you to fill in):
        ${parsed}`,
      },
    ];
  }

  private extract(response: any): string {
    if (this.key.startsWith("sk-ant-")) {
      return response.data.content[0].text;
    }

    return response.data.choices[0].message.content;
  }

  // transforms raw string to proper JSON
  private terraform(raw: string): Object {
    let cleaned = raw;
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.substring(3);
    }

    if (cleaned.endsWith("```")) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }

    return JSON.parse(cleaned);
  }

  // checks if VALID in any form (all forms valid, etc..)
  private validate(mode: "pre" | "post", input: Object): boolean {
    switch (mode) {
      case "pre":
        return Preparsed.safeParse(input).success;
      case "post":
        return Postparsed.safeParse(input).success;
      default:
        return false;
    }
  }
}

export { Inference };
