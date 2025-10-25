import { type Config, type Context } from "@/types/inference";
import { logger } from "@/utils/logger";
import axios from "axios";

interface Structure {
  infer(pre: Context): Promise<any>;
}

class Inference implements Structure {
  constructor(cfg: Config) {}

  async infer(pre: Context): Promise<any> {
    try {

    } catch (e) {

    }
  }

  // builds prompt
  private prompt(pre: Context) {
    return `You are to
    `
  }

  // differentiates between openai, anthro, ...
  private selector(key: string) {}

  // summarizes error into a one-liner
  private heuristic(pre: Context) { }

  // transforms raw string to proper JSON
  private terraform() { }

  // checks if VALID in any form (all forms valid, etc..)
  private validate() { }

};

// const InferenceClient = new Inference();
