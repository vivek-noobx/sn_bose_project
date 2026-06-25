import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

// Initialize the Nodemailer transporter
const initTransporter = async () => {
  if (transporter) return transporter;

  // Use real SMTP if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('Real SMTP Email transporter initialized.');
    return transporter;
  }

  // Fallback to Ethereal for testing
  try {
    console.warn('⚠️ Real SMTP credentials not found in .env. Falling back to Ethereal mock email.');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('Ethereal Email transporter initialized.');
    return transporter;
  } catch (error) {
    console.error('Failed to create Ethereal test account', error);
    throw error;
  }
};

export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
  const mailTransporter = await initTransporter();

  const info = await mailTransporter.sendMail({
    from: `"TalentAI Auth" <${process.env.SMTP_USER || 'no-reply@talentai.example.com'}>`,
    to,
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

  console.log(`✅ OTP sent to ${to}`);
  console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
};
