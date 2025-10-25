import { type Config, type Context } from "@/types/inference";
import { logger } from "@/utils/logger";
import axios from "axios";

interface Structure {
  infer(pre: Context): Promise<any>;
  parse(trace: string): Promise<any>;
}

class Inference implements Structure {
  private key: string;

  constructor(cfg: Config) {
    this.key = cfg.key;
  }

  async parse(trace: string): Promise<any> {

  }

  async infer(pre: Context): Promise<any> {
    try {
      const response = await axios.post(
        this.selector(this.key),
        {
          messages: [this.prompt(pre)],
        }
      );

      return response.data.choices[0].text;
    } catch (e) {
      logger.error(`!!!
        * Error while inferring.
        *
        * ${e}
      !!!`)
    }
  }

  // builds prompt
  private prompt(pre: Context) {
    return `You are to parse out all information
    `
  }

  // differentiates between openai, anthro, ...
  private selector(key: string): string {
    const k = (key ?? "").trim();
    if (!k) return "unknown";

    if (k.startsWith("sk-ant-")) return "https://api.anthropic.com/v1/messages";
    if (k.startsWith("sk-")) return "https://api.openai.com/v1/chat/completions";
    if (k.startsWith("AI")) return "https://generativelanguage.googleapis.com";
    if (k.startsWith("xai-")) return "https://api.x.ai";
    if (k.startsWith("")) return "https://api.z.ai/api/paas/v4/chat/completions";

    return "unknown";
  }

  // summarizes error into a one-liner
  private heuristic(pre: Context) {

  }

  // transforms raw string to proper JSON
  private terraform(raw: string): Object {
    return JSON.parse(raw);
  }

  // checks if VALID in any form (all forms valid, etc..)
  private validate() { }

};

// const InferenceClient = new Inference();
