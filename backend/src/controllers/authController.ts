import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { run, get, all } from '../services/db';
import { sendOtpEmail } from '../services/emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'talentai_secret_key_123';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const getOtpExpiry = () => new Date(Date.now() + 10 * 60 * 1000).toISOString();

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'All fields (name, email, password, role) are required.' });
      return;
    }

    if (role !== 'candidate' && role !== 'recruiter') {
      res.status(400).json({ error: 'Role must be either candidate or recruiter.' });
      return;
    }

    // Check if user already exists
    const existingUser = await get('SELECT id, is_verified FROM users WHERE email = ?', [email]);
    if (existingUser) {
      if (existingUser.is_verified) {
        res.status(400).json({ error: 'A user with this email address already exists.' });
        return;
      }
      // If not verified, we can either resend OTP or tell them to login. We'll let them login to get OTP.
      res.status(400).json({ error: 'User exists but is not verified. Please login to receive a new OTP.' });
      return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const otp = generateOtp();
    const otpExpiresAt = getOtpExpiry();

    // Insert user into DB
    const userId = crypto.randomUUID();
    await run(
      'INSERT INTO users (id, name, email, password_hash, role, is_verified, otp, otp_expires_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?)',
      [userId, name, email, passwordHash, role, otp, otpExpiresAt]
    );

    // Send OTP via email
    await sendOtpEmail(email, otp);

    res.status(201).json({
      message: 'Registration successful. Please verify your email with the OTP sent to you.',
      requiresOtp: true,
      email
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({
      error: 'Failed to register user.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    // Fetch user from DB
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Check if verified
    if (!user.is_verified) {
      const otp = generateOtp();
      const otpExpiresAt = getOtpExpiry();
      
      await run('UPDATE users SET otp = ?, otp_expires_at = ? WHERE id = ?', [otp, otpExpiresAt, user.id]);
      await sendOtpEmail(email, otp);

      res.status(403).json({ 
        error: 'Account not verified. A new OTP has been sent to your email.',
        requiresOtp: true,
        email
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({
      error: 'Failed to login.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ error: 'Email and OTP are required.' });
      return;
    }

    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    if (user.is_verified) {
      res.status(400).json({ error: 'User is already verified.' });
      return;
    }

    if (user.otp !== otp) {
      res.status(401).json({ error: 'Invalid OTP.' });
      return;
    }

    if (new Date(user.otp_expires_at) < new Date()) {
      res.status(401).json({ error: 'OTP has expired. Please login again to receive a new one.' });
      return;
    }

    // Mark as verified
    await run('UPDATE users SET is_verified = 1, otp = NULL, otp_expires_at = NULL WHERE id = ?', [user.id]);

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(200).json({
      message: 'Email verified and login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      error: 'Failed to verify OTP.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getCandidates = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = `
      SELECT u.id, u.name, u.email, r.id as resume_id, r.file_name, r.parsed_json, r.created_at as uploaded_at
      FROM users u
      LEFT JOIN resumes r ON u.id = r.user_id
      WHERE u.role = 'candidate'
      ORDER BY u.name ASC
    `;
    const candidates = await all(query);
    
    // Parse the parsed_json string back to object if present
    const formatted = candidates.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      resume: c.parsed_json ? {
        id: c.resume_id,
        fileName: c.file_name,
        parsedData: JSON.parse(c.parsed_json),
        uploadedAt: c.uploaded_at
      } : null
    }));

    res.status(200).json({
      message: 'Candidates list retrieved successfully.',
      data: formatted
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({
      error: 'Failed to retrieve candidates list.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
