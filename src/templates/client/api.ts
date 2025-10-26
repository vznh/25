import type { NextApiRequest, NextApiResponse } from "next";
import { Inference } from "#inference";
import type { Pre } from "@/types/context";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405);
  const body = req.body;

  try {
    const key = process.env.LOGGER_API_KEY;
    if (!key) return res.status(500);

    const inference = new Inference({ key });
    const pre = await inference.parse(body as Pre);
    const post = await inference.infer(pre as Pre);

    // pretty print here
    console.log(post);

    res.status(200).json({ success: true });
  } catch (e) {
    console.error("* Logger ran into an error.\n", e);
    res.status(500).json({ error: "* Internal server error." });
  }
}
