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
    const result = await validateAndProcessInput(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    try {
      const errorContext = await logger.capture(error);
      console.error('Data validation error captured:', errorContext);
      res.status(400).json({
        error: 'Validation failed',
        context: errorContext
      });
    } catch (logError) {
      console.error('Logger failed:', logError);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

async function validateAndProcessInput(input: any) {
  const sanitizedInput = await sanitizeInput(input);
  const validatedInput = await validateInputStructure(sanitizedInput);
  const processedData = await processDataInput(validatedInput);
  return processedData;
}

async function sanitizeInput(input: any) {
  if (typeof input !== 'object' || input === null) {
    throw new Error('Input must be a non-null object');
  }

  // Simulate sanitization failure
  if (input.hasOwnProperty('malicious_field')) {
    throw new Error('Security violation: Input contains prohibited field "malicious_field"');
  }

  return { ...input };
}

async function validateInputStructure(input: any) {
  const requiredFields = ['name', 'email'];

  for (const field of requiredFields) {
    if (!input.hasOwnProperty(field)) {
      throw new Error(`Validation error: Missing required field "${field}"`);
    }
  }

  if (!isValidEmail(input.email)) {
    throw new Error(`Validation error: Invalid email format "${input.email}"`);
  }

  return input;
}

async function processDataInput(input: any) {
  const businessValidation = await performBusinessLogicValidation(input);
  const finalData = await transformData(businessValidation);
  return finalData;
}

async function performBusinessLogicValidation(input: any) {
  if (input.name.length < 2) {
    throw new Error('Business rule violation: Name must be at least 2 characters long');
  }

  if (input.email.includes('@spam.com')) {
    throw new Error('Business rule violation: Disposable email addresses are not allowed');
  }

  return input;
}

async function transformData(input: any) {
  // Simulate a transformation error
  if (input.name === 'trigger_error') {
    throw new Error('Transformation error: Unable to process special character sequences in name');
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: input.name.trim(),
    email: input.email.toLowerCase(),
    processedAt: new Date().toISOString()
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}