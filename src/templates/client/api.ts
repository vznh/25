import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405);

  try {
    const key = process.env.LOGGER_API_KEY;
    if (!key) return res.status(500);

    const response = await fetch(
      "z.ai/ todo",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${key}`
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = response.json();
    res.status(200).json(data);
  } catch (e) {
    console.error("* Logger ran into an error.\n", e);
    res.status(500).json({ error: "* Internal server error." });
  }
}
