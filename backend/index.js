import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import passport from 'passport';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import quoteRoutes from './routes/quote.js';
import { getPool, initDatabase } from './db/database.js';
import { verifyEmailConnection } from './utils/emailService.js';

const app = express();
const PORT = process.env.PORT || 5000;
const PgStore = connectPgSimple(session);

// Trust proxy (needed for Render/Heroku HTTPS)
app.set('trust proxy', 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
].filter(Boolean);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));

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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 25 : 250,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' }
});

const quoteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 20 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many quote requests. Please try again later.' }
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  name: 'event.sid',
  store: new PgStore({
    pool: getPool(),
    tableName: 'user_sessions',
    createTableIfMissing: true
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
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
app.use('/auth', authLimiter, authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/quotes/request', quoteLimiter);
app.use('/api/quotes', quoteRoutes);

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

app.use((err, req, res, next) => {
  if (err?.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'Origin not allowed' });
  }

  console.error('Unhandled server error:', err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
});

async function startServer() {
  try {
    await initDatabase();
    await verifyEmailConnection();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
