import nodemailer from 'nodemailer';

// Create reusable transporter
// Gmail with App Password
let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  return transporter;
}

// Alternative: Use Ethereal for testing (creates a fake SMTP service)
// Uncomment this for testing without real email credentials
/*
import { createTestAccount, createTransport } from 'nodemailer';
const testAccount = await createTestAccount();
const transporter = createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass,
  },
});
*/

export async function sendPasswordResetEmail(email, resetToken, fullName) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetLink = `${frontendUrl.replace(/\/+$/, '')}/signin?resetToken=${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@asquareevents.com',
    to: email,
    subject: 'Password Reset Request - ASquare Events',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #f9f9f9;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
            margin: -30px -30px 20px -30px;
          }
          .btn {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
          }
          .token-box {
            background-color: #fff;
            border: 2px dashed #667eea;
            border-radius: 5px;
            padding: 15px;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #667eea;
            margin: 20px 0;
          }
          .footer {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          
          <p>Hello ${fullName || 'User'},</p>
          
          <p>We received a request to reset your password for your ASquare Events account. If you didn't make this request, please ignore this email.</p>
          
          <p>To reset your password, use the 6-digit code below:</p>
          
          <div class="token-box">
            ${resetToken}
          </div>
          
          <p>Alternatively, you can click the button below:</p>
          
          <div style="text-align: center;">
            <a href="${resetLink}" class="btn">Reset Password</a>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong><br>
            This code will expire in 30 minutes. If you didn't request this password reset, please secure your account immediately.
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} ASquare Events. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hello ${fullName || 'User'},
      
      We received a request to reset your password for your ASquare Events account.
      
      Your password reset code is: ${resetToken}
      
      Or click this link: ${resetLink}
      
      This code will expire in 30 minutes.
      
      If you didn't request this password reset, please ignore this email.
      
      Best regards,
      ASquare Events Team
    `
  };

  try {
    const info = await getTransporter().sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    console.log('📧 Email sent to:', email);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    
    // In development mode, log the reset code for testing
    console.log('\n' + '='.repeat(60));
    console.log('🔑 DEVELOPMENT MODE - PASSWORD RESET CODE');
    console.log('='.repeat(60));
    console.log(`Email: ${email}`);
    console.log(`Reset Code: ${resetToken}`);
    console.log(`Name: ${fullName || 'User'}`);
    console.log('='.repeat(60) + '\n');
    
    // Return success in development so the flow continues
    if (process.env.NODE_ENV === 'development') {
      return { success: true, messageId: 'dev-mode', devToken: resetToken };
    }
    
    throw new Error('Failed to send password reset email');
  }
}

export async function verifyEmailConnection() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('Email credentials not configured. Password reset emails will be disabled.');
    return false;
  }

  try {
    await getTransporter().verify();
    console.log('✅ Email service is ready');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error.message);
    console.log('⚠️  Please configure email credentials in .env file');
    return false;
  }
}
