import { z } from "zod";

export const Preparsed = z
  .object({
    type: z.string().optional(),
    message: z.string().optional(),
    original: z.string().optional(),

    primary_location: z
      .object({
        file: z.string().optional(),
        line: z.number().optional(),
        method: z.string().optional(),
      })
      .optional(),

    top: z
      .array(
        z.object({
          file: z.string().optional(),
          line: z.number().optional(),
          method: z.string().optional(),
        })
      )
      .optional(),

    related: z
      .array(
        z.object({
          file: z.string().optional(),
          function: z.string().optional(),
          start: z.number().optional(),
          end: z.number().optional(),
        })
      )
      .optional(),
  });

export const Postparsed = z
  .object({
    type: z.string(),
    message: z.string(),
    heuristic: z.string(),

    primary_location: z.object({
      file: z.string(),
      line: z.number(),
      method: z.string(),
    }),

    top: z.array(
      z.object({
        file: z.string(),
        line: z.number(),
        method: z.string(),
      })
    ),

    related: z.object({
      file: z.string(),
      function: z.string(),
      start: z.number(),
      end: z.number(),
    }),

    snippets: z.object({
      file: z.string(),
      start: z.number(),
      lines: z.array(z.string()),
    }),

    evidence: z.array(
      z.object({
        file: z.string(),
        line: z.number(),
        why: z.string(),
      })
    ),

    required: z.array(
      z.object({
        type: z.string(),
        path: z.string().optional(),
        lines: z.array(z.number()).optional(),
        query: z.string().optional(),
        scope: z.string().optional(),
      })
    ),

    missing: z.array(z.string()),

    _omitted: z.object({
      frames: z.number(),
      snippetLines: z.number(),
      relatedFunctions: z.number(),
    }),
  })
  .strict();

export type Pre = z.infer<typeof Preparsed>;
export type Post = z.infer<typeof Postparsed>;
