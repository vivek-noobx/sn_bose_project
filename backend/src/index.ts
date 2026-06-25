import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import uploadRoutes from './routes/uploadRoutes';
import jobRoutes from './routes/jobRoutes';
import assessmentRoutes from './routes/assessmentRoutes';
import authRoutes from './routes/authRoutes';
import { initDb } from './services/db';

dotenv.config();

const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', assessmentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Resume Server is running' });
});

// Initialize SQLite database, then start listening
const startServer = async () => {
  try {
    await initDb();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to initialize database, server not started:', err);
    process.exit(1);
  }
};

startServer();
