# Deployment Guide

## Architecture

- Frontend: Vite static build from `frontend/`
- Backend: Express app from `backend/`
- Database: PostgreSQL via `DATABASE_URL`
- Sessions: PostgreSQL-backed `express-session`

## Required Backend Environment Variables

```env
NODE_ENV=production
SESSION_SECRET=replace-with-a-long-random-secret-at-least-32-characters
DATABASE_URL=postgresql://...
FRONTEND_URL=https://your-frontend-domain
CORS_ALLOWED_ORIGINS=https://your-frontend-domain,https://www.your-frontend-domain
CORS_ALLOW_PUBLIC_PREVIEW_ORIGINS=false

ADMIN_EMAIL=admin@asquareevents.com
ADMIN_PASSWORD=replace-this-admin-password
ADMIN_FULL_NAME=ASquare Events Admin

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-domain/auth/google/callback

EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# OTP login (SMS via Twilio)
OTP_SECRET=replace-this-otp-secret
OTP_DEFAULT_COUNTRY_CODE=91
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=+1XXXXXXXXXX

DB_INIT_MAX_RETRIES=12
DB_INIT_RETRY_DELAY_MS=5000

ADMIN_WHATSAPP_NUMBER=919876543210
WHATSAPP_CLOUD_ACCESS_TOKEN=
WHATSAPP_CLOUD_PHONE_NUMBER_ID=
WHATSAPP_CLOUD_API_VERSION=v22.0
WHATSAPP_SEND_CUSTOMER_ACK=true
```

## Local Development

1. Start PostgreSQL and create a database named `asquare_events`.
2. Copy `backend/.env.example` to `backend/.env` and fill in the values.
3. Install dependencies in both `backend/` and `frontend/`.
4. Start the backend with `npm run dev` inside `backend/`.
5. Start the frontend with `npm run dev` inside `frontend/`.

## Production Notes

- The backend now requires PostgreSQL. SQLite is no longer supported.
- Admin access is server-enforced through the seeded admin user configured by `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- Content management and quote review endpoints require an authenticated admin session.
- Password reset emails, SMS OTP (Twilio), and WhatsApp notifications are optional integrations, but the environment variables must be configured if those flows are expected to work in production.
- Google login is automatically disabled when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are not both configured.
- Session cookies are configured as secure in production (`secure=true`, `sameSite=none`), so HTTPS is required end-to-end.
- CORS allows only explicit origins in production unless `CORS_ALLOW_PUBLIC_PREVIEW_ORIGINS=true`.

## Production Readiness Checklist

1. Set all required environment variables and use long random values for `SESSION_SECRET` and `OTP_SECRET`.
2. Verify backend and frontend domains are correctly configured in `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, and `VITE_API_BASE_URL`.
3. Confirm Google OAuth callback URL exactly matches deployed backend URL.
4. Verify PostgreSQL backups and point-in-time recovery are enabled in your provider.
5. Run `npm run build` in `frontend/` before release and ensure no lint/build errors.
6. Set up monitoring/logging alerts for backend health endpoint failures (`/api/health`) and repeated 5xx responses.