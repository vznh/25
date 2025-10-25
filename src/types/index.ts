export type StackFrame = {
  file: string;
  line: number | null; 
  column?: number | null; 
  method?: string | null
};

export type CodeSnippet = {
  file: string; 
  startLine: number; 
  lines: string[]
};

export type PreAIContext = {
  error: { name: string; message: string };
  frames: Array<StackFrame>;
  codeSnippets: Array<CodeSnippet>;
  relatedFunctions: Array<{ 
    file: string; 
    functionName: string | null; 
    startLine?: number | null; 
    endLine?: number | null 
  }>;
};

export type RelatedFunction = {
  file: string; 
  functionName: string | null; 
  startLine?: number | null; 
  endLine?: number | null 
};
