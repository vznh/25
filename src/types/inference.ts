
type Config = {
  provider: "none" | "anthropic" | "openai" | "other";
}

interface Context { }

export {
  type Config,
  type Context
}
