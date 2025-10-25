import { type Config, type Context } from "@/types/inference";
import { logger } from "@/utils/logger";
import axios from "axios";

interface Structure {
  infer(pre: Context): Promise<any>;
}

class Inference implements Structure {
  private key: string;

  constructor(cfg: Config) {
    this.key = cfg.key;
  }

  async infer(pre: Context): Promise<any> {
    try {
      const response = await axios.post(
        this.selector(this.key),

      )

    } catch (e) {

    }
  }

  // builds prompt
  private prompt(pre: Context) {
    return `You are to
    `
  }

  // differentiates between openai, anthro, ...
  private selector(key: string): string {
    const k = (key ?? "").trim();

    if (!k) return "unknown";

    if (k.startsWith("sk-")) return "openai";

    if (k.startsWith("sk-ant-")) return "anthropic";

    if (k.startsWith("AI")) return "google";

    if (k.startsWith("xai-")) return "xai";

    if (k.startsWith("sk-ds-")) return "deepseek";

    if (k.startsWith("csk_")) return "cohere";

    if (k.startsWith("mistral-")) return "mistral";

    if (k.startsWith("pplx-")) return "perplexity";

    if (k.startsWith("together_")) return "together";

    if (k.startsWith("gsk_")) return "groq";

    if (k.startsWith("sk-or-")) return "openrouter";

    return "unknown";
  }

  // summarizes error into a one-liner
  private heuristic(pre: Context) { }

  // transforms raw string to proper JSON
  private terraform() { }

  // checks if VALID in any form (all forms valid, etc..)
  private validate() { }

};

// const InferenceClient = new Inference();
