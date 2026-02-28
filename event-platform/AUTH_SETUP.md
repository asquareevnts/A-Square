# ASquare Events - Authentication Setup Guide

## 🚀 Features Implemented

### ✅ Complete Authentication System
- **Local Registration & Login** with email/password
- **Google OAuth** integration for social login
- **SQLite Database** for user management
- **Session-based authentication** with Passport.js
- **Password strength indicator**
- **Profile management** with user dropdown menu
- **Protected routes** for authenticated users

### 🎨 Modern UI Features
- Gradient backgrounds and modern design
- Password visibility toggle
- Real-time password strength validation
- Responsive design with Tailwind CSS
- Icons from react-icons
- Smooth transitions and animations

## 📦 Installation & Setup

### 1. Install Frontend Dependencies

```bash
cd event-platform
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Configure Google OAuth (Optional)

To enable Google Sign-In:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
7. Copy your **Client ID** and **Client Secret**

### 4. Setup Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `.env` and add your Google OAuth credentials:

```env
PORT=5000
NODE_ENV=development
SESSION_SECRET=your-super-secret-session-key-change-me
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
FRONTEND_URL=http://localhost:5173
```

## 🏃‍♂️ Running the Application

### Start Backend Server

```bash
cd server
npm run dev
```

Server will run on `http://localhost:5000`

### Start Frontend (New Terminal)

```bash
cd event-platform
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📱 Using the Application

### Sign Up
1. Click **"Sign Up"** button in navbar
2. Fill in your details (Full Name, Email, Password)
3. Or click **"Continue with Google"** for OAuth

### Sign In
1. Click **"Sign In"** button in navbar
2. Enter your credentials
3. Or use Google Sign-In
4. Admin login: `admin` / `admin@123`

### User Features
- View profile information in dropdown menu
- Access profile settings
- Sign out functionality

## 🗄️ Database Schema

The SQLite database (`server/db/users.db`) contains:

### Users Table
- `id` - Auto-incrementing primary key
- `email` - Unique user email
- `password` - Hashed password (bcrypt)
- `full_name` - User's full name
- `phone` - Phone number (optional)
- `profile_picture` - URL to profile image
- `provider` - Authentication provider (local/google)
- `google_id` - Google OAuth ID
- `email_verified` - Email verification status
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp
- `last_login` - Last login timestamp

### Verification Tokens Table
- For email verification (future feature)

### Password Reset Tokens Table
- For password reset functionality (future feature)

## 🔒 Security Features

- ✅ **Password hashing** with bcrypt (10 salt rounds)
- ✅ **Session management** with express-session
- ✅ **CORS protection** configured for localhost
- ✅ **Password strength validation** (8+ characters)
- ✅ **Email format validation**
- ✅ **SQL injection protection** (prepared statements)
- ✅ **Secure cookies** in production mode

## 🛠️ API Endpoints

### Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/logout` | Logout current user |
| GET | `/auth/google` | Initiate Google OAuth |
| GET | `/auth/google/callback` | Google OAuth callback |
| GET | `/auth/me` | Get current user info |
| GET | `/auth/stats` | Get user statistics |

## 🎯 Future Enhancements

- [ ] Email verification system
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] User profile editing
- [ ] Account deletion
- [ ] Social login (Facebook, GitHub, etc.)
- [ ] Email notifications
- [ ] User activity logs
- [ ] Rate limiting for login attempts
- [ ] Account lockout after failed attempts

## 🐛 Troubleshooting

### Database Issues
```bash
# Delete the database to start fresh
rm server/db/users.db
# Restart the server (it will recreate the database)
```

### Port Already in Use
```bash
# Change PORT in server/.env file
PORT=5001
```

### Google OAuth Not Working
- Verify redirect URI matches exactly
- Check if Google+ API is enabled
- Ensure credentials are correct in `.env`
- Clear browser cookies and try again

## 📚 Tech Stack

### Frontend
- React 19.2.0
- React Router DOM 6.30.3
- Tailwind CSS 4.1.18
- React Icons 5.5.0
- Vite 7.2.4

### Backend
- Node.js with Express 4.21.2
- SQLite with better-sqlite3 11.8.0
- Passport.js for authentication
- bcryptjs for password hashing
- express-session for session management

## 👨‍💻 Development Notes

The authentication system is fully integrated with:
- Frontend context API for state management
- Backend session-based authentication
- Protected routes for authenticated content
- User dropdown menu with profile options

All user data is stored locally in SQLite database for easy development and testing.

---

**Note:** Remember to change the `SESSION_SECRET` in production and use HTTPS for secure cookie transmission!
