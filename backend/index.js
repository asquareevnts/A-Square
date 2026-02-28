import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import { initDatabase } from './db/database.js';
import { verifyEmailConnection } from './utils/emailService.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (needed for Render/Heroku HTTPS)
app.set('trust proxy', 1);

// Initialize database
initDatabase();

// Verify email service (for password reset)
verifyEmailConnection();

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isAllowed =
        allowedOrigins.includes(origin) ||
        /\.trycloudflare\.com$/i.test(origin) ||
        /\.netlify\.app$/i.test(origin) ||
        /\.onrender\.com$/i.test(origin);

      if (isAllowed) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
const callbackURL = process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  callbackURL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Import here to avoid circular dependency
    const { findOrCreateGoogleUser } = await import('./db/database.js');
    const user = await findOrCreateGoogleUser(profile);
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize/deserialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { getUserById } = await import('./db/database.js');
    const user = await getUserById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Routes
app.use('/auth', authRoutes);
app.use('/api/content', contentRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Event backend is running',
    health: '/api/health'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
