import express from 'express';
import passport from 'passport';
import crypto from 'crypto';
import {
  createUser,
  getUserByEmail,
  getUserById,
  getUserByPhone,
  verifyPassword,
  updateLastLogin,
  updateUserProfile,
  getUserStats,
  createPasswordResetToken,
  createPhoneLoginToken,
  consumePhoneLoginToken,
  verifyPasswordResetToken,
  deletePasswordResetToken,
  updateUserPassword
} from '../db/database.js';
import { requireAdmin, requireAuthenticated } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

const router = express.Router();

function serializeUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    phone: user.phone,
    address: user.address,
    profilePicture: user.profile_picture,
    provider: user.provider,
    role: user.role,
    emailVerified: user.email_verified,
  };
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function toE164(phoneDigits) {
  const digits = normalizePhone(phoneDigits);
  const defaultCountryCode = String(process.env.OTP_DEFAULT_COUNTRY_CODE || '91').replace(/\D/g, '') || '91';

  if (digits.startsWith('00')) {
    return `+${digits.slice(2)}`;
  }

  if (digits.length === 10) {
    return `+${defaultCountryCode}${digits}`;
  }

  return `+${digits}`;
}

function getOtpHash(phoneDigits, otp) {
  const secret = String(process.env.OTP_SECRET || process.env.SESSION_SECRET || 'otp-secret');
  return crypto.createHash('sha256').update(`${phoneDigits}:${otp}:${secret}`).digest('hex');
}

async function sendPhoneOtp(phoneDigits, otp) {
  const accountSid = String(process.env.TWILIO_ACCOUNT_SID || '').trim();
  const authToken = String(process.env.TWILIO_AUTH_TOKEN || '').trim();
  const fromNumber = String(process.env.TWILIO_FROM_NUMBER || '').trim();
  const toNumber = toE164(phoneDigits);

  if (!accountSid || !authToken || !fromNumber) {
    return { success: false, skipped: true, reason: 'Twilio SMS config missing' };
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const body = new URLSearchParams({
    To: toNumber,
    From: fromNumber,
    Body: `Your ASquare Events login OTP is ${otp}. It expires in 10 minutes.`,
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    return { success: false, skipped: false, reason: errorBody?.message || 'Failed to send OTP SMS' };
  }

  return { success: true, skipped: false };
}

// Local Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    // Validation
    if (!normalizedEmail || !password || !fullName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, and full name are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long' 
      });
    }

    const user = await createUser(normalizedEmail, password, fullName.trim(), phone?.trim());
    
    // Log the user in automatically after registration
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Registration successful but failed to log in' 
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: serializeUser(user)
      });
    });

  } catch (error) {
    if (error.message === 'Email already exists') {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }
    
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
});

// Local Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    const user = await getUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if user registered with Google
    if (user.provider === 'google' && !user.password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please login with Google' 
      });
    }

    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    await updateLastLogin(user.id);

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ 
          success: false, 
          message: 'Login failed' 
        });
      }

      res.json({
        success: true,
        message: 'Login successful',
        user: serializeUser(user)
      });
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
});

router.post('/request-phone-otp', async (req, res) => {
  try {
    const phoneDigits = normalizePhone(req.body?.phone);
    if (phoneDigits.length < 10) {
      return res.status(400).json({ success: false, message: 'Valid phone number is required' });
    }

    const user = await getUserByPhone(phoneDigits);
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this phone number, an OTP has been sent.'
      });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const tokenHash = getOtpHash(phoneDigits, otp);
    await createPhoneLoginToken(user.id, phoneDigits, tokenHash, 10);

    if (process.env.NODE_ENV !== 'production') {
      return res.json({
        success: true,
        message: 'Use this OTP to continue login:',
        otp,
      });
    }

    const sendResult = await sendPhoneOtp(phoneDigits, otp);
    if (!sendResult.success) {
      return res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
    }

    return res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Request phone OTP error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process OTP request' });
  }
});

router.post('/verify-phone-otp', async (req, res) => {
  try {
    const phoneDigits = normalizePhone(req.body?.phone);
    const otp = String(req.body?.otp || '').replace(/\D/g, '').slice(0, 6);

    if (phoneDigits.length < 10 || otp.length !== 6) {
      return res.status(400).json({ success: false, message: 'Phone number and 6-digit OTP are required' });
    }

    const tokenHash = getOtpHash(phoneDigits, otp);
    const userId = await consumePhoneLoginToken(phoneDigits, tokenHash);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const user = await getUserById(userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }

    await updateLastLogin(user.id);
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Login failed' });
      }

      return res.json({
        success: true,
        message: 'Login successful',
        user: serializeUser(user)
      });
    });
  } catch (error) {
    console.error('Verify phone OTP error:', error);
    return res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
});

// Google OAuth
router.get('/google', (req, res, next) => {
  const origin = req.get('origin');
  const referer = req.get('referer');

  if (origin) {
    req.session.frontendUrl = origin;
  } else if (referer) {
    try {
      req.session.frontendUrl = new URL(referer).origin;
    } catch {
      req.session.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    }
  }

  next();
}, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/signin' }),
  (req, res) => {
    const frontendUrl = req.session?.frontendUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
    if (req.session) {
      delete req.session.frontendUrl;
    }

    // Encode user data in URL so frontend can pick it up
    // (avoids cross-domain cookie issues)
    const userData = {
      id: req.user.id,
      email: req.user.email,
      fullName: req.user.full_name,
      phone: req.user.phone,
      address: req.user.address,
      profilePicture: req.user.profile_picture,
      provider: req.user.provider,
      role: req.user.role,
      emailVerified: req.user.email_verified,
    };
    const encoded = Buffer.from(JSON.stringify(userData)).toString('base64url');
    res.redirect(`${frontendUrl}/?authUser=${encoded}`);
  }
);

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Logout failed' 
      });
    }
    req.session?.destroy(() => {
      res.clearCookie('event.sid');
      res.json({ 
        success: true, 
        message: 'Logged out successfully' 
      });
    });
  });
});

// Get current user
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authenticated' 
    });
  }

  res.json({
    success: true,
    user: serializeUser(req.user)
  });
});

router.put('/me', requireAuthenticated, async (req, res) => {
  try {
    const { fullName, phone, address } = req.body;
    const cleanedName = String(fullName || '').trim();

    if (!cleanedName) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    const user = await updateUserProfile(req.user.id, {
      fullName: cleanedName,
      phone,
      address,
    });

    req.login(user, (loginError) => {
      if (loginError) {
        return res.status(500).json({ success: false, message: 'Profile updated but session refresh failed' });
      }

      return res.json({ success: true, user: serializeUser(user) });
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

// Get user statistics (admin only)
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const stats = await getUserStats();
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve stats' 
    });
  }
});

// Forgot Password - Request reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Check if user exists
    const user = await getUserByEmail(normalizedEmail);

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset code has been sent.'
      });
    }

    // Check if user registered with Google
    if (user.provider === 'google' && !user.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'This account was created with Google. Please use Google sign-in.' 
      });
    }

    // Generate a 6-digit reset code
    const resetToken = crypto.randomInt(100000, 999999).toString();

    // Store reset token in database (expires in 30 minutes)
    await createPasswordResetToken(user.id, resetToken, 30);

    // Local/development flow: return code directly without requiring SMTP
    if (process.env.NODE_ENV !== 'production') {
      return res.json({
        success: true,
        message: 'Use this reset code to set a new password:',
        resetToken
      });
    }

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.full_name);
      
      res.json({
        success: true,
        message: 'Password reset code has been sent to your email.'
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);

      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email. Please try again later.'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process request. Please try again.' 
    });
  }
});

// Reset Password - Verify token and update password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reset code and new password are required' 
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Verify reset token
    const resetData = await verifyPasswordResetToken(token);

    if (!resetData) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset code' 
      });
    }

    // Update password
    await updateUserPassword(resetData.user_id, newPassword);

    // Delete reset token
    await deletePasswordResetToken(token);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password. Please try again.' 
    });
  }
});

export default router;
