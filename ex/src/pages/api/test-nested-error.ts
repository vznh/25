import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "../../../../src/templates/server/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await deepNestedFunction();
    res.status(200).json({ success: true });
  } catch (error) {
    try {
      const errorContext = await logger.capture(error);
      console.error('Nested error captured:', errorContext);
      res.status(500).json({
        error: 'Internal server error',
        context: errorContext
      });
    } catch (logError) {
      console.error('Logger failed:', logError);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

async function deepNestedFunction() {
  const result = await levelOne();
  return result;
}

async function levelOne() {
  const data = await levelTwo();
  return data;
}

async function levelTwo() {
  const config = await levelThree();
  return config;
}

async function levelThree() {
  // Simulate a configuration error
  throw new Error('Configuration missing: API_KEY not found in environment variables');
}