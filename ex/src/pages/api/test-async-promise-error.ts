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
    await handleAsyncRequest();
    res.status(200).json({ success: true });
  } catch (error) {
    try {
      const errorContext = await logger.capture(error);
      console.error('Async promise error captured:', errorContext);
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

async function handleAsyncRequest() {
  const userData = await fetchUserData();
  const processedData = await processData(userData);
  return processedData;
}

async function fetchUserData() {
  // Simulate network error
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Network timeout: Unable to connect to database after 5000ms'));
    }, 100);
  });
}

async function processData(userData: any) {
  if (!userData) {
    throw new Error('Cannot process null user data');
  }

  const validated = validateUserData(userData);
  return validated;
}

function validateUserData(data: any) {
  if (typeof data !== 'object' || !data.id) {
    throw new Error('Invalid user data structure: missing required field "id"');
  }
  return data;
}