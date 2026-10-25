
import dotenv from 'dotenv';

dotenv.config();

export const sendOtpEmail = async (
  to: string,
  otp: string
): Promise<void> => {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  const scriptSecret = process.env.GOOGLE_SCRIPT_SECRET;

  if (!scriptUrl || !scriptSecret) {
    throw new Error(
      'GOOGLE_SCRIPT_URL or GOOGLE_SCRIPT_SECRET is missing.'
    );
  }

  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        otp,
        secret: scriptSecret,
      }),
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(
        `Google Apps Script HTTP error: ${response.status}`
      );
    }

    const result = await response.json() as {
      success: boolean;
      message?: string;
    };

    if (!result.success) {
      throw new Error(
        result.message || 'Google Apps Script failed to send email.'
      );
    }

    console.log(`OTP email successfully sent to ${to}.`);

  } catch (error) {
    console.error('Google Apps Script email error:', error);
    throw error;
  }
};
