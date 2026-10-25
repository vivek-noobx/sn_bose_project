
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
const port =  Number(process.env.PORT) || 5001;

// Set FRONTEND_URL in Render to your deployed Vercel URL.
const allowedOrigins = [
  'https://snboseproject-omega.vercel.app',
  'https://snboseproject-icxv3hw23-sn-bose.vercel.app',
];

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', uploadRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api', assessmentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Resume Server is running' });
});

const startServer = async () => {
  try {
    await initDb();

    app.listen(port, '0.0.0.0', () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to initialize database, server not started:', err);
    process.exit(1);
  }
};

startServer();

