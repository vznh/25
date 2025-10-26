type Config = {
  key: string;
}

type Response = {
  data?: any;
  success: boolean;
  error?: string;
}

export {
  type Config,
  type Response
}
