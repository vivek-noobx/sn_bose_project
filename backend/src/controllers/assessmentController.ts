import { Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth';
import { generateAdaptiveTest } from '../services/testGenerator';
import { evaluateCodeWithAI } from '../services/codeEvaluator';
import { evaluateAssessment } from '../services/assessmentEvaluator';
import { run, get, all } from '../services/db';

export const generateTest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { jobDescription } = req.body;
    let resumeData = req.body?.resumeData;

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim() === '') {
      res.status(400).json({ error: 'jobDescription is required and must be a non-empty string.' });
      return;
    }

    // If resume data is not supplied, fetch the candidate's parsed resume from SQLite
    if (!resumeData && userId) {
      const storedResume = await get(
        'SELECT parsed_json FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      if (storedResume) {
        resumeData = JSON.parse(storedResume.parsed_json);
      }
    }

    if (!resumeData) {
      res.status(400).json({ error: 'No resume profile found. Please upload a resume first.' });
      return;
    }

    const test = await generateAdaptiveTest(resumeData, jobDescription);

    res.status(200).json({
      message: 'Test generated successfully',
      data: test,
    });
  } catch (error) {
    console.error('Error generating test:', error);
    res.status(500).json({
      error: 'Failed to generate test',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const evaluateCode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { code, language, testCases } = req.body;

    if (!code || !language || !testCases || !Array.isArray(testCases)) {
      res.status(400).json({ error: 'code, language, and testCases (array) are required.' });
      return;
    }

    const evaluation = await evaluateCodeWithAI(code, language, testCases);

    res.status(200).json({
      message: 'Code evaluation complete',
      data: evaluation,
    });
  } catch (error) {
    console.error('Error evaluating code:', error);
    res.status(500).json({
      error: 'Failed to evaluate code',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const submitAssessment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { test, answers, jobId, jobRole, jobDescription } = req.body;

    if (!test || !answers || !jobId || !jobRole || !jobDescription) {
      res.status(400).json({ 
        error: 'Missing required fields in request body: test, answers, jobId, jobRole, jobDescription.' 
      });
      return;
    }

    // 1. Fetch user's latest resume ID from SQLite
    const resume = await get(
      'SELECT id FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    
    if (!resume) {
      res.status(400).json({ error: 'No resume found associated with user profile.' });
      return;
    }

    // 2. Perform AI assessment evaluation
    console.log(`Evaluating test for user ${userId} and job ${jobId}...`);
    const evaluationReport = await evaluateAssessment(test, answers, jobRole, jobDescription);

    // 3. Save assessment report to SQLite database
    const assessmentId = crypto.randomUUID();
    await run(
      `INSERT INTO assessments (
        id, user_id, resume_id, job_id, test_title, job_role, score, max_score, questions, answers, evaluation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        assessmentId,
        userId,
        resume.id,
        jobId,
        test.testTitle,
        jobRole,
        evaluationReport.overallScore,
        evaluationReport.maxScore,
        JSON.stringify(test),
        JSON.stringify(answers),
        JSON.stringify(evaluationReport)
      ]
    );

    res.status(200).json({
      message: 'Assessment submitted and evaluated successfully.',
      data: {
        assessmentId,
        score: evaluationReport.overallScore,
        maxScore: evaluationReport.maxScore,
        evaluation: evaluationReport
      }
    });

  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({
      error: 'Failed to evaluate and save assessment.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getAssessmentHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    let records: any[] = [];

    if (user.role === 'candidate') {
      records = await all(
        'SELECT * FROM assessments WHERE user_id = ? ORDER BY taken_at DESC',
        [user.id]
      );
    } else if (user.role === 'recruiter') {
      records = await all(
        `SELECT a.*, u.name as candidate_name, u.email as candidate_email 
         FROM assessments a 
         JOIN users u ON a.user_id = u.id 
         ORDER BY a.taken_at DESC`
      );
    }

    // Parse stringified JSON fields back to objects
    const formattedRecords = records.map(r => ({
      ...r,
      questions: JSON.parse(r.questions),
      answers: JSON.parse(r.answers),
      evaluation: JSON.parse(r.evaluation)
    }));

    res.status(200).json({
      message: 'Assessment history retrieved.',
      data: formattedRecords
    });

  } catch (error) {
    console.error('Error fetching assessment history:', error);
    res.status(500).json({
      error: 'Failed to retrieve assessment history.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
