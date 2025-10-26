import type { NextApiRequest, NextApiResponse } from "next";
import { logger } from "../../../../src/templates/server/logger";
import * as fs from 'fs';
import * as path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await performFileOperations(req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    try {
      const errorContext = await logger.capture(error);
      console.error('File operation error captured:', errorContext);
      res.status(500).json({
        error: 'File operation failed',
        context: errorContext
      });
    } catch (logError) {
      console.error('Logger failed:', logError);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

async function performFileOperations(input: any) {
  const filePath = await generateFilePath(input);
  const fileData = await prepareFileData(input);
  const result = await writeFileWithValidation(filePath, fileData);
  return result;
}

async function generateFilePath(input: any) {
  const fileName = input.fileName || 'default.txt';

  if (!fileName || typeof fileName !== 'string') {
    throw new Error('Invalid file name: fileName must be a non-empty string');
  }

  if (fileName.includes('..') || fileName.includes('/')) {
    throw new Error('Security error: Path traversal detected in file name');
  }

  const uploadsDir = path.join(process.cwd(), 'uploads');

  // Ensure uploads directory exists
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
  } catch (error) {
    throw new Error(`Directory creation failed: Unable to create uploads directory`);
  }

  return path.join(uploadsDir, fileName);
}

async function prepareFileData(input: any) {
  const content = input.content;

  if (typeof content !== 'string') {
    throw new Error('Invalid content: content must be a string');
  }

  if (content.length > 10000) {
    throw new Error('Content size error: File content exceeds maximum allowed size of 10,000 characters');
  }

  const processedContent = await processFileContent(content);
  return processedContent;
}

async function processFileContent(content: string) {
  // Simulate content processing that might fail
  if (content.includes('trigger_processing_error')) {
    throw new Error('Content processing error: Unable to process content with special markers');
  }

  // Add metadata
  const metadata = {
    timestamp: new Date().toISOString(),
    size: content.length,
    checksum: Buffer.from(content).toString('base64').slice(0, 16)
  };

  return JSON.stringify({
    metadata,
    content: content
  }, null, 2);
}

async function writeFileWithValidation(filePath: string, fileData: string) {
  // Check if file already exists
  if (fs.existsSync(filePath)) {
    throw new Error(`File conflict: File already exists at path "${path.basename(filePath)}"`);
  }

  // Validate final path
  const finalValidation = validateFinalFilePath(filePath);
  if (!finalValidation.valid) {
    throw new Error(`Path validation failed: ${finalValidation.reason}`);
  }

  // Attempt to write file
  try {
    fs.writeFileSync(filePath, fileData, 'utf8');

    // Verify file was written correctly
    const verification = await verifyFileWritten(filePath, fileData);
    if (!verification.success) {
      throw new Error('File verification failed: Written file does not match expected content');
    }

    return {
      success: true,
      filePath: path.basename(filePath),
      size: fileData.length
    };
  } catch (writeError) {
    // Clean up on failure
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.error('Failed to cleanup file after write error:', cleanupError);
      }
    }
    throw new Error(`File write operation failed: ${writeError.message}`);
  }
}

function validateFinalFilePath(filePath: string) {
  const normalizedPath = path.normalize(filePath);
  const allowedDir = path.join(process.cwd(), 'uploads');

  if (!normalizedPath.startsWith(allowedDir)) {
    return {
      valid: false,
      reason: 'Path validation failed: Attempted to write outside allowed directory'
    };
  }

  return { valid: true };
}

async function verifyFileWritten(filePath: string, expectedContent: string) {
  try {
    const actualContent = fs.readFileSync(filePath, 'utf8');
    return {
      success: actualContent === expectedContent,
      actualSize: actualContent.length,
      expectedSize: expectedContent.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}