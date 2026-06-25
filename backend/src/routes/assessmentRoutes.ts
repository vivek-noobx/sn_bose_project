import { Router } from 'express';
import { generateTest, evaluateCode, submitAssessment, getAssessmentHistory } from '../controllers/assessmentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/generate-test', authMiddleware, generateTest);
router.post('/evaluate-code', authMiddleware, evaluateCode);
router.post('/assessment/submit', authMiddleware, submitAssessment);
router.get('/assessment/history', authMiddleware, getAssessmentHistory);

export default router;
