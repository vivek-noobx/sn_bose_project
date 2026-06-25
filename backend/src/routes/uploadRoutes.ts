import { Router, type Response, type NextFunction } from 'express';
import multer from 'multer';
import { uploadResume, getResume } from '../controllers/uploadController';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed. Please upload a .pdf file.'));
    }
  }
});

// Wrap multer in a custom handler to ensure errors always return JSON
const uploadMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  upload.single('resume')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

router.post('/upload-resume', authMiddleware, uploadMiddleware, uploadResume);
router.get('/resume', authMiddleware, getResume);

export default router;
