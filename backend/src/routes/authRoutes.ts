import { Router } from 'express';
import { register, login, verifyOtp, getCandidates } from '../controllers/authController';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.get('/candidates', authMiddleware, requireRole('recruiter'), getCandidates);

export default router;
