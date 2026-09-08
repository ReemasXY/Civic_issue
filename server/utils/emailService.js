import nodemailer from "nodemailer";
import pool from "../config/dbConnection.js";

// Generate a secure 6-digit OTP code
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Calculate OTP expiry time (5 minutes from now)
export const getOTPExpiry = () => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 5);
  return expiry;
};

// Schedule automatic cleanup of expired OTP record after 5 minutes
export const scheduleOTPCleanup = (email, tableName) => {
  setTimeout(async () => {
    try {
      const result = await pool.query(
        `DELETE FROM ${tableName}
         WHERE email = $1 AND otp_expires_at <= NOW()`,
        [email]
      );

      if (result.rowCount > 0) {
        console.log(`🗑️ Cleaned up expired OTP for ${email} from ${tableName}`);
      }
    } catch (error) {
      console.error(`❌ Error cleaning up expired OTP from ${tableName}:`, error);
    }
  }, 5 * 60 * 1000); // 5 minutes
};

// Configure Nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send OTP email to user
export const sendOtpEmail = async (toEmail, otpCode, purpose = "registration") => {
  try {
    const transporter = createTransporter();

    const purposeText =
      purpose === "registration"
        ? "complete your registration"
        : "log in to your account";

    const subject =
      purpose === "registration"
        ? "Verify Your CivicCare Account"
        : "CivicCare Login Verification";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
              background-color: #F6F8F7;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 40px 20px;
            }
            .card {
              background: white;
              border-radius: 16px;
              padding: 48px 40px;
              box-shadow: 0 1px 2px rgba(20, 35, 59, 0.04), 0 24px 48px -18px rgba(20, 35, 59, 0.18);
            }
            .logo {
              text-align: center;
              margin-bottom: 32px;
            }
            .logo-circles {
              display: inline-flex;
              gap: 4px;
              margin-bottom: 12px;
            }
            .circle {
              width: 12px;
              height: 12px;
              border-radius: 50%;
            }
            .circle-dark {
              background-color: #14233B;
            }
            .circle-teal {
              background-color: #1F8A70;
            }
            .logo-text {
              font-size: 18px;
              font-weight: 700;
              color: #14233B;
              letter-spacing: -0.01em;
            }
            .tagline {
              font-size: 11px;
              font-weight: 500;
              color: #1F8A70;
              letter-spacing: 0.5px;
            }
            h1 {
              font-size: 24px;
              font-weight: 600;
              color: #14233B;
              margin: 0 0 16px 0;
              text-align: center;
            }
            .description {
              font-size: 14px;
              color: #687585;
              line-height: 1.6;
              text-align: center;
              margin-bottom: 32px;
            }
            .otp-container {
              background: linear-gradient(135deg, #F6F8F7 0%, #E5EBE8 100%);
              border: 2px solid #1F8A70;
              border-radius: 12px;
              padding: 24px;
              margin: 32px 0;
              text-align: center;
            }
            .otp-label {
              font-size: 12px;
              font-weight: 600;
              color: #687585;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 12px;
            }
            .otp-code {
              font-size: 42px;
              font-weight: 700;
              color: #14233B;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .expiry-notice {
              background: #FFF8E6;
              border-left: 4px solid #F59E0B;
              padding: 16px;
              margin: 24px 0;
              border-radius: 6px;
            }
            .expiry-notice p {
              margin: 0;
              font-size: 13px;
              color: #92400E;
              line-height: 1.5;
            }
            .footer {
              text-align: center;
              margin-top: 32px;
              padding-top: 24px;
              border-top: 1px solid #E5EBE8;
            }
            .footer p {
              font-size: 12px;
              color: #687585;
              margin: 4px 0;
            }
            .link {
              color: #1F8A70;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="logo">
                <div class="logo-circles">
                  <span class="circle circle-dark"></span>
                  <span class="circle circle-teal"></span>
                </div>
                <div class="logo-text">CivicCare</div>
                <div class="tagline">Report. Track. Resolve.</div>
              </div>

              <h1>${subject}</h1>

              <p class="description">
                Use the verification code below to ${purposeText}.
                This code is valid for the next 5 minutes.
              </p>

              <div class="otp-container">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">${otpCode}</div>
              </div>

              <div class="expiry-notice">
                <p>
                  ⏱️ <strong>Important:</strong> This code will expire in 5 minutes.
                  If you didn't request this code, please ignore this email.
                </p>
              </div>

              <div class="footer">
                <p>If you need help, contact us at <a href="mailto:support@civiccare.org" class="link">support@civiccare.org</a></p>
                <p style="margin-top: 16px; color: #9CA3AF;">
                  © 2026 CivicCare. Making communities better, one report at a time.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"CivicCare" <no-reply@civiccare.org>',
      to: toEmail,
      subject: subject,
      html: htmlContent,
      text: `Your CivicCare verification code is: ${otpCode}. This code will expire in 5 minutes.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending OTP email:", error);
    throw new Error("Failed to send verification email");
  }
};
