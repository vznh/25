type PPAIC = {
  "type": string,
  "message": string,

  "primary_location": {
    "file": string,
    "line": number,
    "method": string,
  },

  "top": {
    "file": string,
    "line": number,
    "method": string,
  }[],

  "related": {
    "file": string,
    "function": string,
    "start": number,
    "end": number
  },

  "snippets": {
    "file": string,
    "start": number,
    "lines": string[],
  },

  "evidence": {
    "file": string,
    "line": number,
    "why": string
  }[],

  "required": {
    "type": string,
    "path"?: string,
    "lines"?: number[],
    "query"?: string,
    "scope"?: string,
  }[],

  "missing": string[],

  "_omitted": {
    "frames": number,
    "snippetLines": number,
    "relatedFunctions": number
  }
}

export {
  type PPAIC
}
