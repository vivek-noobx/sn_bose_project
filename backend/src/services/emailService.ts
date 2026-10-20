import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

let resend: Resend | null = null;

const getResendClient = (): Resend => {
  if (resend) return resend;

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is missing from environment variables.');
  }

  resend = new Resend(apiKey);

  console.log('Resend email service initialized.');

  return resend;
};

export const sendOtpEmail = async (
  to: string,
  otp: string
): Promise<void> => {
  const client = getResendClient();

  const fromEmail =
    process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  const { data, error } = await client.emails.send({
    from: `TalentAI Auth <${fromEmail}>`,
    to: [to],
    subject: 'Your Verification OTP Code',
    text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Verify your email address</h2>
        <p>Thank you for registering. Please use the following OTP to verify your account:</p>
        <h3 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 2px;">${otp}</h3>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  });

  if (error) {
    console.error('Resend email error:', error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }

  console.log(`OTP email accepted by Resend for ${to}.`);
  console.log('Resend email ID:', data?.id);
};