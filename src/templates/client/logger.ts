import type { Pre, Post } from "@/types/context";

class Logger {
  private api: string;

  constructor(api: string = process.env.LOGGER_API_URL!) {
    if (!api) {
      // throw an error here
    }

    this.api = api;
  }

  async capture(error: unknown): Promise<Post> {
    const pre = await this._build(error);

    const response = await fetch(
      `${this.api}/api/logger`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pre)
      }
    );

    return response.json();
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
