type Config = {
  provider: "none" | "anthropic" | "openai" | "other";
  key: string;
}

interface Context { }

interface Response {

}

export {
  type Config,
  type Context
}
