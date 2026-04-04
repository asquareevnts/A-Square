import bcrypt from 'bcryptjs';
import pkg from 'pg';

const { Pool } = pkg;

let pool;

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getDatabaseTarget() {
  try {
    const parsedUrl = new URL(String(process.env.DATABASE_URL || ''));
    return `${parsedUrl.hostname}:${parsedUrl.port || '5432'}`;
  } catch {
    return 'unknown-host';
  }
}

function getSslConfig() {
  const databaseUrl = String(process.env.DATABASE_URL || '');
  const sslMode = String(process.env.PGSSLMODE || '').toLowerCase();

  if (sslMode === 'disable' || databaseUrl.includes('sslmode=disable')) {
    return false;
  }

  if (sslMode === 'require' || databaseUrl.includes('sslmode=require')) {
    return { rejectUnauthorized: false };
  }

  try {
    const parsedUrl = new URL(databaseUrl);
    const hostname = String(parsedUrl.hostname || '').toLowerCase();
    const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(hostname);

    if (isLocalHost) {
      return false;
    }
  } catch {
    // Fall back to environment-based defaults if DATABASE_URL is not a parseable URL.
  }

  if (process.env.NODE_ENV === 'production') {
    return { rejectUnauthorized: false };
  }

  return false;
}

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: getSslConfig(),
    });

    pool.on('error', (error) => {
      console.error('Unexpected PostgreSQL pool error:', error);
    });
  }

  return pool;
}

function mapUser(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    email_verified: Boolean(row.email_verified),
  };
}

function mapQuote(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    requested_items: Array.isArray(row.requested_items) ? row.requested_items : [],
  };
}

async function ensureSchema() {
  const database = getPool();

  await database.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      full_name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      profile_picture TEXT,
      provider TEXT NOT NULL DEFAULT 'local',
      google_id TEXT UNIQUE,
      role TEXT NOT NULL DEFAULT 'customer',
      email_verified BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login TIMESTAMPTZ
    )
  `);

  await database.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await database.query(`
    CREATE TABLE IF NOT EXISTS content_store (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await database.query(`
    CREATE TABLE IF NOT EXISTS quote_requests (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      requirement_date DATE NOT NULL,
      event_location TEXT,
      notes TEXT,
      requested_items JSONB NOT NULL DEFAULT '[]'::jsonb,
      total_amount NUMERIC(12, 2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      admin_notes TEXT,
      reviewed_by TEXT,
      whatsapp_message_id TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT quote_requests_status_check CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED'))
    )
  `);
}

async function ensureAdminUser() {
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const adminPassword = String(process.env.ADMIN_PASSWORD || '');
  const adminName = String(process.env.ADMIN_FULL_NAME || 'Platform Admin').trim();

  if (!adminEmail || !adminPassword) {
    return;
  }

  const existing = await getUserByEmail(adminEmail);
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  if (!existing) {
    await getPool().query(
      `
        INSERT INTO users (email, password, full_name, provider, role, email_verified)
        VALUES ($1, $2, $3, 'local', 'admin', TRUE)
      `,
      [adminEmail, hashedPassword, adminName]
    );
    return;
  }

  await getPool().query(
    `
      UPDATE users
      SET password = $2,
          full_name = $3,
          role = 'admin',
          provider = 'local',
          updated_at = NOW()
      WHERE email = $1
    `,
    [adminEmail, hashedPassword, adminName]
  );
}

export async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required. Configure PostgreSQL before starting the backend.');
  }

  const maxAttempts = Math.max(Number(process.env.DB_INIT_MAX_RETRIES || 12), 1);
  const retryDelayMs = Math.max(Number(process.env.DB_INIT_RETRY_DELAY_MS || 5000), 500);
  const target = getDatabaseTarget();

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await ensureSchema();
      await ensureAdminUser();
      console.log(`PostgreSQL schema initialized successfully (${target})`);
      return;
    } catch (error) {
      const canRetry = attempt < maxAttempts && ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT'].includes(error?.code);

      if (!canRetry) {
        throw error;
      }

      console.warn(
        `PostgreSQL init attempt ${attempt}/${maxAttempts} failed (${error.code}) for ${target}. Retrying in ${retryDelayMs}ms...`
      );
      await wait(retryDelayMs);
    }
  }
}

export async function getContentByKey(key) {
  const { rows } = await getPool().query('SELECT value FROM content_store WHERE key = $1', [key]);
  return rows[0]?.value ?? null;
}

export async function setContentByKey(key, value) {
  await getPool().query(
    `
      INSERT INTO content_store (key, value, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `,
    [key, JSON.stringify(value)]
  );
}

export async function createQuoteRequest(payload) {
  const { rows } = await getPool().query(
    `
      INSERT INTO quote_requests (
        user_id,
        customer_name,
        phone,
        email,
        requirement_date,
        event_location,
        notes,
        requested_items,
        total_amount,
        status,
        whatsapp_message_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, 'PENDING', $10)
      RETURNING *
    `,
    [
      payload.userId || null,
      payload.customerName,
      payload.phone,
      payload.email || null,
      payload.requirementDate,
      payload.eventLocation || null,
      payload.notes || null,
      JSON.stringify(payload.cartItems || []),
      Number(payload.totalAmount || 0),
      payload.whatsappMessageId || null,
    ]
  );

  return mapQuote(rows[0]);
}

export async function getQuoteRequestById(id) {
  const { rows } = await getPool().query('SELECT * FROM quote_requests WHERE id = $1', [id]);
  return mapQuote(rows[0]);
}

export async function listQuoteRequests(limit = 100) {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
  const { rows } = await getPool().query(
    'SELECT * FROM quote_requests ORDER BY created_at DESC LIMIT $1',
    [safeLimit]
  );

  return rows.map(mapQuote);
}

export async function updateQuoteRequestStatus(id, status, adminNotes = '', reviewedBy = '') {
  const { rows } = await getPool().query(
    `
      UPDATE quote_requests
      SET status = $2,
          admin_notes = $3,
          reviewed_by = $4,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, status, adminNotes || null, reviewedBy || null]
  );

  return mapQuote(rows[0]);
}

export async function setQuoteRequestWhatsAppMessageId(id, messageId) {
  const { rows } = await getPool().query(
    `
      UPDATE quote_requests
      SET whatsapp_message_id = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `,
    [id, messageId || null]
  );

  return mapQuote(rows[0]);
}

export async function createUser(email, password, fullName, phone = null) {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const { rows } = await getPool().query(
      `
        INSERT INTO users (email, password, full_name, phone, provider, role)
        VALUES ($1, $2, $3, $4, 'local', 'customer')
        RETURNING id, email, full_name, phone, address, profile_picture, provider, role, email_verified
      `,
      [normalizedEmail, hashedPassword, fullName, phone]
    );

    return mapUser(rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      throw new Error('Email already exists');
    }

    throw error;
  }
}

export async function getUserByEmail(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const { rows } = await getPool().query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
  return mapUser(rows[0]);
}

export async function getUserById(id) {
  const { rows } = await getPool().query('SELECT * FROM users WHERE id = $1', [id]);
  return mapUser(rows[0]);
}

export async function verifyPassword(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) {
    return false;
  }

  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function updateLastLogin(userId) {
  await getPool().query('UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1', [userId]);
}

export async function updateUserProfile(userId, payload) {
  const fullName = String(payload.fullName || '').trim();
  const phone = String(payload.phone || '').trim();
  const address = String(payload.address || '').trim();

  const { rows } = await getPool().query(
    `
      UPDATE users
      SET full_name = $2,
          phone = $3,
          address = $4,
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, full_name, phone, address, profile_picture, provider, role, email_verified
    `,
    [userId, fullName, phone || null, address || null]
  );

  return mapUser(rows[0]);
}

export async function findOrCreateGoogleUser(profile) {
  const email = String(profile.emails?.[0]?.value || '').trim().toLowerCase();
  const googleId = String(profile.id || '');
  const fullName = String(profile.displayName || email || 'Google User');
  const profilePicture = profile.photos?.[0]?.value || null;

  let { rows } = await getPool().query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  let user = mapUser(rows[0]);

  if (user) {
    await getPool().query(
      `
        UPDATE users
        SET full_name = $2,
            profile_picture = $3,
            email_verified = TRUE,
            last_login = NOW(),
            updated_at = NOW()
        WHERE id = $1
      `,
      [user.id, fullName, profilePicture]
    );

    return getUserById(user.id);
  }

  user = await getUserByEmail(email);
  if (user) {
    await getPool().query(
      `
        UPDATE users
        SET google_id = $2,
            provider = 'google',
            full_name = $3,
            profile_picture = $4,
            email_verified = TRUE,
            last_login = NOW(),
            updated_at = NOW()
        WHERE id = $1
      `,
      [user.id, googleId, fullName, profilePicture]
    );

    return getUserById(user.id);
  }

  ({ rows } = await getPool().query(
    `
      INSERT INTO users (email, full_name, google_id, provider, profile_picture, role, email_verified, last_login)
      VALUES ($1, $2, $3, 'google', $4, 'customer', TRUE, NOW())
      RETURNING *
    `,
    [email, fullName, googleId, profilePicture]
  ));

  return mapUser(rows[0]);
}

export async function getUserStats() {
  const { rows } = await getPool().query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE provider = 'google')::int AS google,
      COUNT(*) FILTER (WHERE provider = 'local')::int AS local,
      COUNT(*) FILTER (WHERE email_verified = TRUE)::int AS verified,
      COUNT(*) FILTER (WHERE role = 'admin')::int AS admins
    FROM users
  `);

  return rows[0];
}

export async function createPasswordResetToken(userId, token, expiresInMinutes = 30) {
  const database = getPool();
  await database.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [userId]);
  await database.query(
    `
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES ($1, $2, NOW() + ($3 || ' minutes')::interval)
    `,
    [userId, token, String(expiresInMinutes)]
  );

  return token;
}

export async function verifyPasswordResetToken(token) {
  const { rows } = await getPool().query(
    `
      SELECT prt.*, u.email, u.full_name
      FROM password_reset_tokens prt
      JOIN users u ON u.id = prt.user_id
      WHERE prt.token = $1 AND prt.expires_at > NOW()
    `,
    [token]
  );

  return rows[0] || null;
}

export async function deletePasswordResetToken(token) {
  await getPool().query('DELETE FROM password_reset_tokens WHERE token = $1', [token]);
}

export async function updateUserPassword(userId, newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await getPool().query(
    'UPDATE users SET password = $2, updated_at = NOW() WHERE id = $1',
    [userId, hashedPassword]
  );
}

export default getPool;
