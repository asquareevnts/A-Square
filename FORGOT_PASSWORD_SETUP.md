# Forgot Password - Email Setup Guide

## Overview
The forgot password feature has been added to the sign-in page with email confirmation functionality.

## Features ✨
- **Forgot Password Link**: Available on the sign-in page
- **Email Verification**: 6-digit code sent to user's email
- **Secure Reset**: Token-based password reset with 30-minute expiration
- **User-Friendly UI**: Modal-based interface for password reset flow

## Setup Instructions

### 1. Email Configuration

To enable email functionality, you need to configure email credentials in the `.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
```

### 2. Gmail Setup (Recommended for Development)

If using Gmail:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "ASquare Events" as the app name
   - Copy the 16-character password
3. **Update .env file**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=abc123def456ghij  # Use the app password here
   ```

### 3. Alternative Email Services

You can also use other email services:

#### SendGrid
```javascript
const transporter = nodemailer.createTransporter({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

#### Mailgun
```javascript
const transporter = nodemailer.createTransporter({
  host: 'smtp.mailgun.org',
  port: 587,
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_PASS
  }
});
```

#### Mailtrap (Testing Only)
```javascript
const transporter = nodemailer.createTransporter({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});
```

## How It Works

### User Flow:
1. **User clicks "Forgot Password?"** on sign-in page
2. **Enters email address** and requests reset code
3. **Receives 6-digit code** via email (valid for 30 minutes)
4. **Enters code and new password** in the modal
5. **Password is reset** and user can sign in with new credentials

### Technical Flow:
1. **POST /auth/forgot-password**
   - Validates email exists in database
   - Generates 6-digit random code
   - Stores code in `password_reset_tokens` table with expiration
   - Sends email with reset code
   
2. **POST /auth/reset-password**
   - Validates reset code and expiration
   - Updates user password (bcrypt hashed)
   - Deletes used reset token
   - Returns success message

## Development Mode

In development mode (`NODE_ENV=development`), if email sending fails, the reset code will be returned in the API response for testing purposes:

```json
{
  "success": true,
  "message": "Email service unavailable. Use this code for testing:",
  "resetToken": "123456"
}
```

**Note**: This is only for development and will NOT happen in production!

## Security Features 🔒

- **Token Expiration**: Reset codes expire after 30 minutes
- **One-time Use**: Tokens are deleted after successful password reset
- **Password Hashing**: All passwords are bcrypt hashed before storage
- **Email Privacy**: System doesn't reveal if email exists in database
- **Provider Check**: Prevents password reset for Google OAuth accounts

## File Changes

### Backend
- ✅ `backend/db/database.js` - Added password reset token functions
- ✅ `backend/routes/auth.js` - Added forgot/reset password routes
- ✅ `backend/utils/emailService.js` - Created email service (NEW FILE)
- ✅ `backend/index.js` - Added email service verification
- ✅ `backend/.env` - Added email configuration

### Frontend
- ✅ `frontend/src/pages/SignIn.jsx` - Added forgot password UI and logic

## Testing the Feature

1. **Start the backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the flow**:
   - Navigate to Sign In page
   - Click "Forgot Password?"
   - Enter a registered email
   - Check your email for the 6-digit code
   - Enter code and new password
   - Sign in with new password

## Troubleshooting

### Email not sending?
- ✅ Check `.env` file has correct credentials
- ✅ Verify 2FA is enabled (for Gmail)
- ✅ Use App Password, not regular password
- ✅ Check server console for error messages

### "Invalid or expired code" error?
- ✅ Code expires after 30 minutes
- ✅ Each code can only be used once
- ✅ Request a new code if needed

### Can't reset Google account password?
- ✅ Accounts created with Google OAuth cannot use password reset
- ✅ These users must sign in with Google

## API Endpoints

### Request Password Reset
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password reset code has been sent to your email."
}
```

### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now sign in with your new password."
}
```

## Support

For issues or questions, please check:
- Server console logs for error messages
- Email service configuration in `.env`
- Database connection and schema
- Network connectivity to email service

---

**Note**: Remember to update email credentials before deploying to production!
