import { Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth';
import { parseResumeFromBuffer } from '../services/resumeParser';
import { run, get } from '../services/db';

export const uploadResume = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized. Authenticated user profile required.' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded. Please upload a PDF resume.' });
      return;
    }

    // Pass the file buffer to the LangChain parser service
    const { parsedData, rawText } = await parseResumeFromBuffer(req.file.buffer);

    // Save parsed data to SQLite database
    const resumeId = crypto.randomUUID();
    await run(
      'INSERT INTO resumes (id, user_id, file_name, raw_text, parsed_json) VALUES (?, ?, ?, ?, ?)',
      [resumeId, userId, req.file.originalname, rawText, JSON.stringify(parsedData)]
    );

    res.status(200).json({
      message: 'Resume parsed and saved successfully',
      data: parsedData
    });
  } catch (error) {
    console.error('Error parsing resume:', error);
    res.status(500).json({ 
      error: 'Failed to process resume', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const getResume = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const resume = await get(
      'SELECT id, file_name, parsed_json, created_at FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (!resume) {
      res.status(404).json({ error: 'No resume profile found. Please upload a PDF resume.' });
      return;
    }

    res.status(200).json({
      message: 'Resume retrieved successfully.',
      data: {
        id: resume.id,
        fileName: resume.file_name,
        parsedData: JSON.parse(resume.parsed_json),
        createdAt: resume.created_at
      }
    });
  } catch (error) {
    console.error('Error retrieving resume:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve resume profile.', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};
