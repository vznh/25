import type { Pre, Post } from "@/types/context";
import { Inference } from "@/services/inference";

class Logger {
  private api: string;
  private inference: Inference;

  constructor(api: string = process.env.LOGGER_API_KEY!) {
    if (!api) {
      // throw an error here bc we have no key
    }

    this.api = api;
    this.inference = new Inference({ key: api });
  }

  // in user app
  // logger.capture(error);
  async capture(error: unknown): Promise<void> {
    const pre = await this._build(error);

    // pre is then passed to our final ai pass (infer() in inference.ts)
    const post = await this.inference.infer(pre);

    // which returns a Post object

    // print post to server console
    // return void
  }

  private async _build(error: unknown): Promise<Pre> {
    // maintain original stack trace
    // parse copy of stack trace here
    // filter copy of stack trace here
    // call ai func to fill in missing detials from orig, parsed st

    // return as Pre
    return {}
  }
}

export const logger = new Logger(process.env.NEXT_PUBLIC_LOGGER_API_URL);
