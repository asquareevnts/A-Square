# Deployment Guide

## Architecture

- Frontend: Vite static build from `frontend/`
- Backend: Express app from `backend/`
- Database: PostgreSQL via `DATABASE_URL`
- Sessions: PostgreSQL-backed `express-session`

## Required Backend Environment Variables

```env
NODE_ENV=production
SESSION_SECRET=replace-this-session-secret
DATABASE_URL=postgresql://...
FRONTEND_URL=https://your-frontend-domain

ADMIN_EMAIL=admin@asquareevents.com
ADMIN_PASSWORD=replace-this-admin-password
ADMIN_FULL_NAME=ASquare Events Admin

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-domain/auth/google/callback

EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

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
- Password reset emails and WhatsApp notifications are optional integrations, but the environment variables must be configured if those flows are expected to work in production.