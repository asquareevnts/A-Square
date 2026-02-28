import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'users.db'));

// Initialize database tables
export function initDatabase() {
  // Users table with enhanced fields
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      full_name TEXT,
      phone TEXT,
      profile_picture TEXT,
      provider TEXT DEFAULT 'local',
      google_id TEXT UNIQUE,
      email_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `);

  // Email verification tokens table
  db.exec(`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Password reset tokens table
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS content_store (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database initialized successfully');
}

export function getContentByKey(key) {
  const stmt = db.prepare('SELECT value FROM content_store WHERE key = ?');
  const row = stmt.get(key);

  if (!row) {
    return null;
  }

  try {
    return JSON.parse(row.value);
  } catch {
    return null;
  }
}

export function setContentByKey(key, value) {
  const stmt = db.prepare(`
    INSERT INTO content_store (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key)
    DO UPDATE SET
      value = excluded.value,
      updated_at = CURRENT_TIMESTAMP
  `);

  stmt.run(key, JSON.stringify(value));
}

// Create a new user (local registration)
export async function createUser(email, password, fullName, phone = null) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare(`
      INSERT INTO users (email, password, full_name, phone, provider)
      VALUES (?, ?, ?, ?, 'local')
    `);
    
    const result = stmt.run(email, hashedPassword, fullName, phone);
    return { id: result.lastInsertRowid, email, full_name: fullName };
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      throw new Error('Email already exists');
    }
    throw error;
  }
}

// Find user by email
export function getUserByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

// Find user by ID
export function getUserById(id) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id);
}

// Verify password
export async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// Update last login time
export function updateLastLogin(userId) {
  const stmt = db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(userId);
}

// Find or create user from Google OAuth
export async function findOrCreateGoogleUser(profile) {
  const email = profile.emails[0].value;
  const googleId = profile.id;
  
  // Check if user exists with this Google ID
  let stmt = db.prepare('SELECT * FROM users WHERE google_id = ?');
  let user = stmt.get(googleId);
  
  if (user) {
    updateLastLogin(user.id);
    return user;
  }
  
  // Check if user exists with this email
  user = getUserByEmail(email);
  
  if (user) {
    // Link Google account to existing user
    stmt = db.prepare('UPDATE users SET google_id = ?, provider = ?, email_verified = 1 WHERE id = ?');
    stmt.run(googleId, 'google', user.id);
    updateLastLogin(user.id);
    return getUserById(user.id);
  }
  
  // Create new user
  stmt = db.prepare(`
    INSERT INTO users (email, full_name, google_id, provider, profile_picture, email_verified)
    VALUES (?, ?, ?, 'google', ?, 1)
  `);
  
  const result = stmt.run(
    email,
    profile.displayName,
    googleId,
    profile.photos?.[0]?.value || null
  );
  
  return getUserById(result.lastInsertRowid);
}

// Get user stats (for admin dashboard)
export function getUserStats() {
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const googleUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE provider = "google"').get();
  const localUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE provider = "local"').get();
  const verifiedUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE email_verified = 1').get();
  
  return {
    total: totalUsers.count,
    google: googleUsers.count,
    local: localUsers.count,
    verified: verifiedUsers.count
  };
}

export default db;
