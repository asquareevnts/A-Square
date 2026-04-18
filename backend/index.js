import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import compression from 'compression';
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
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function parseBoolean(value, defaultValue = false) {
  if (typeof value !== 'string') {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return defaultValue;
}

function parseOriginList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function validateEnvironment() {
  const sessionSecret = String(process.env.SESSION_SECRET || '');
  const explicitOrigins = parseOriginList(process.env.CORS_ALLOWED_ORIGINS || process.env.FRONTEND_URL);

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required.');
  }

  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error('SESSION_SECRET must be set with at least 32 characters.');
  }

  if (IS_PRODUCTION && explicitOrigins.length === 0) {
    throw new Error('Set FRONTEND_URL or CORS_ALLOWED_ORIGINS in production.');
  }
}

// Trust proxy (needed for Render/Heroku HTTPS)
app.set('trust proxy', 1);
app.disable('x-powered-by');

const allowedOrigins = [
  ...parseOriginList(process.env.CORS_ALLOWED_ORIGINS),
  ...parseOriginList(process.env.FRONTEND_URL),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174'
].filter(Boolean);

const allowPublicPreviewOrigins = !IS_PRODUCTION || parseBoolean(process.env.CORS_ALLOW_PUBLIC_PREVIEW_ORIGINS, false);

function isAllowedOrigin(origin) {
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  if (!allowPublicPreviewOrigins) {
    return false;
  }

  return /\.trycloudflare\.com$/i.test(origin) || /\.netlify\.app$/i.test(origin) || /\.onrender\.com$/i.test(origin);
}

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: IS_PRODUCTION ? 600 : 6000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: IS_PRODUCTION ? 25 : 250,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' }
});

const quoteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: IS_PRODUCTION ? 20 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many quote requests. Please try again later.' }
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
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
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Strategy
const googleClientId = String(process.env.GOOGLE_CLIENT_ID || '').trim();
const googleClientSecret = String(process.env.GOOGLE_CLIENT_SECRET || '').trim();
const googleAuthEnabled = Boolean(googleClientId && googleClientSecret);
app.set('googleAuthEnabled', googleAuthEnabled);

if (googleAuthEnabled) {
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback';

  passport.use(new GoogleStrategy({
    clientID: googleClientId,
    clientSecret: googleClientSecret,
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
} else {
  console.warn('Google OAuth is disabled because GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are not both configured.');
}

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
app.use('/api', apiLimiter);
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
    validateEnvironment();
    await initDatabase();
    await verifyEmailConnection();

    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    const shutdown = (signal) => {
      console.log(`Received ${signal}. Closing HTTP server...`);
      server.close(async () => {
        try {
          await getPool().end();
          console.log('PostgreSQL pool closed. Exiting process.');
          process.exit(0);
        } catch (error) {
          console.error('Error while closing PostgreSQL pool:', error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        console.error('Graceful shutdown timed out. Exiting forcefully.');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
