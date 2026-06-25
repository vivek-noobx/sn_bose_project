import { Router } from 'express';
import { seedJobs, matchJobs, createJob, getRecruiterJobs, deleteJob, getJobCandidates } from '../controllers/jobController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/seed', authMiddleware, seedJobs);
router.post('/match', authMiddleware, matchJobs);
router.post('/', authMiddleware, createJob);
router.get('/recruiter', authMiddleware, getRecruiterJobs);
router.delete('/:id', authMiddleware, deleteJob);
router.get('/:id/candidates', authMiddleware, getJobCandidates);

export default router;
