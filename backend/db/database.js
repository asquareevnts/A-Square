import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const DEFAULT_MONGODB_URI = 'mongodb://127.0.0.1:27017/event-platform';

const schemaOptions = {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
};

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, default: null },
    full_name: { type: String, required: true },
    phone: { type: String, default: null },
    address: { type: String, default: null },
    profile_picture: { type: String, default: null },
    provider: { type: String, enum: ['local', 'google'], default: 'local' },
    google_id: { type: String, default: null, unique: true, sparse: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    email_verified: { type: Boolean, default: false },
    last_login: { type: Date, default: null }
  },
  schemaOptions
);

const contentStoreSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  schemaOptions
);

const quoteRequestSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    customer_name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: null },
    requirement_date: { type: String, required: true },
    event_location: { type: String, default: null },
    notes: { type: String, default: null },
    requested_items: { type: [mongoose.Schema.Types.Mixed], default: [] },
    total_amount: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' },
    admin_notes: { type: String, default: null },
    reviewed_by: { type: String, default: null },
    whatsapp_message_id: { type: String, default: null }
  },
  schemaOptions
);

const passwordResetTokenSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    expires_at: { type: Date, required: true, index: true }
  },
  schemaOptions
);

const phoneLoginTokenSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    phone: { type: String, required: true, index: true },
    token_hash: { type: String, required: true, index: true },
    expires_at: { type: Date, required: true, index: true },
    consumed_at: { type: Date, default: null }
  },
  schemaOptions
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
const ContentStore = mongoose.models.ContentStore || mongoose.model('ContentStore', contentStoreSchema);
const QuoteRequest = mongoose.models.QuoteRequest || mongoose.model('QuoteRequest', quoteRequestSchema);
const PasswordResetToken =
  mongoose.models.PasswordResetToken || mongoose.model('PasswordResetToken', passwordResetTokenSchema);
const PhoneLoginToken =
  mongoose.models.PhoneLoginToken || mongoose.model('PhoneLoginToken', phoneLoginTokenSchema);

function toObject(doc) {
  if (!doc) {
    return null;
  }

  const source = doc.toObject ? doc.toObject() : doc;
  return { ...source, id: String(source._id) };
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

async function ensureAdminUser() {
  const adminEmail = normalizeEmail(process.env.ADMIN_EMAIL);
  const adminPassword = String(process.env.ADMIN_PASSWORD || '');
  const adminName = String(process.env.ADMIN_FULL_NAME || 'Platform Admin').trim();

  if (!adminEmail || !adminPassword) {
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const existing = await User.findOne({ email: adminEmail });

  if (!existing) {
    await User.create({
      email: adminEmail,
      password: hashedPassword,
      full_name: adminName,
      provider: 'local',
      role: 'admin',
      email_verified: true
    });
    return;
  }

  existing.password = hashedPassword;
  existing.full_name = adminName;
  existing.provider = 'local';
  existing.role = 'admin';
  await existing.save();
}

export async function initDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const mongoUri = String(process.env.MONGODB_URI || DEFAULT_MONGODB_URI).trim();
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required. Configure MongoDB before starting the backend.');
  }

  await mongoose.connect(mongoUri, { autoIndex: true });
  await ensureAdminUser();
  console.log('MongoDB initialized successfully');
}

export async function closeDatabase() {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.disconnect();
}

export async function getContentByKey(key) {
  const row = await ContentStore.findOne({ key }).lean();
  return row ? row.value : null;
}

export async function setContentByKey(key, value) {
  await ContentStore.findOneAndUpdate(
    { key },
    { $set: { value } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function createQuoteRequest(payload) {
  const created = await QuoteRequest.create({
    user_id: payload.userId || null,
    customer_name: payload.customerName,
    phone: payload.phone,
    email: payload.email || null,
    requirement_date: payload.requirementDate,
    event_location: payload.eventLocation || null,
    notes: payload.notes || null,
    requested_items: payload.cartItems || [],
    total_amount: Number(payload.totalAmount || 0),
    status: 'PENDING',
    whatsapp_message_id: payload.whatsappMessageId || null
  });

  return toObject(created);
}

export async function getQuoteRequestById(id) {
  if (!mongoose.Types.ObjectId.isValid(String(id))) {
    return null;
  }

  const row = await QuoteRequest.findById(id).lean();
  return toObject(row);
}

export async function listQuoteRequests(limit = 100) {
  const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 500);
  const rows = await QuoteRequest.find({}).sort({ created_at: -1 }).limit(safeLimit).lean();
  return rows.map((row) => toObject(row));
}

export async function updateQuoteRequestStatus(id, status, adminNotes = '', reviewedBy = '') {
  if (!mongoose.Types.ObjectId.isValid(String(id))) {
    return null;
  }

  const row = await QuoteRequest.findByIdAndUpdate(
    id,
    {
      $set: {
        status,
        admin_notes: adminNotes || null,
        reviewed_by: reviewedBy || null
      }
    },
    { new: true }
  ).lean();

  return toObject(row);
}

export async function setQuoteRequestWhatsAppMessageId(id, messageId) {
  if (!mongoose.Types.ObjectId.isValid(String(id))) {
    return null;
  }

  const row = await QuoteRequest.findByIdAndUpdate(
    id,
    { $set: { whatsapp_message_id: messageId || null } },
    { new: true }
  ).lean();

  return toObject(row);
}

export async function createUser(email, password, fullName, phone = null) {
  const normalizedEmail = normalizeEmail(email);

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const created = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      full_name: fullName,
      phone,
      provider: 'local',
      role: 'customer'
    });

    return toObject(created);
  } catch (error) {
    if (error?.code === 11000) {
      throw new Error('Email already exists');
    }

    throw error;
  }
}

export async function getUserByEmail(email) {
  const user = await User.findOne({ email: normalizeEmail(email) }).lean();
  return toObject(user);
}

export async function getUserById(id) {
  if (!mongoose.Types.ObjectId.isValid(String(id))) {
    return null;
  }

  const user = await User.findById(id).lean();
  return toObject(user);
}

export async function getUserByPhone(phoneDigits) {
  const cleanedDigits = normalizeDigits(phoneDigits);
  const localTen = cleanedDigits.length > 10 ? cleanedDigits.slice(-10) : cleanedDigits;

  if (!localTen) {
    return null;
  }

  const users = await User.find({ phone: { $ne: null } }).lean();
  const matched = users.find((user) => {
    const userDigits = normalizeDigits(user.phone);
    if (!userDigits) {
      return false;
    }

    return userDigits === cleanedDigits || userDigits.endsWith(localTen);
  });

  return toObject(matched || null);
}

export async function verifyPassword(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) {
    return false;
  }

  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function updateLastLogin(userId) {
  if (!mongoose.Types.ObjectId.isValid(String(userId))) {
    return;
  }

  await User.findByIdAndUpdate(userId, { $set: { last_login: new Date() } });
}

export async function updateUserProfile(userId, payload) {
  if (!mongoose.Types.ObjectId.isValid(String(userId))) {
    return null;
  }

  const fullName = String(payload.fullName || '').trim();
  const phone = String(payload.phone || '').trim();
  const address = String(payload.address || '').trim();

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        full_name: fullName,
        phone: phone || null,
        address: address || null
      }
    },
    { new: true }
  ).lean();

  return toObject(user);
}

export async function findOrCreateGoogleUser(profile) {
  const email = normalizeEmail(profile.emails?.[0]?.value);
  const googleId = String(profile.id || '');
  const fullName = String(profile.displayName || email || 'Google User');
  const profilePicture = profile.photos?.[0]?.value || null;

  let user = await User.findOne({ google_id: googleId });

  if (user) {
    user.full_name = fullName;
    user.profile_picture = profilePicture;
    user.email_verified = true;
    user.last_login = new Date();
    await user.save();
    return toObject(user);
  }

  user = await User.findOne({ email });
  if (user) {
    user.google_id = googleId;
    user.provider = 'google';
    user.full_name = fullName;
    user.profile_picture = profilePicture;
    user.email_verified = true;
    user.last_login = new Date();
    await user.save();
    return toObject(user);
  }

  const created = await User.create({
    email,
    full_name: fullName,
    google_id: googleId,
    provider: 'google',
    profile_picture: profilePicture,
    role: 'customer',
    email_verified: true,
    last_login: new Date()
  });

  return toObject(created);
}

export async function getUserStats() {
  const [total, google, local, verified, admins] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ provider: 'google' }),
    User.countDocuments({ provider: 'local' }),
    User.countDocuments({ email_verified: true }),
    User.countDocuments({ role: 'admin' })
  ]);

  return { total, google, local, verified, admins };
}

export async function createPasswordResetToken(userId, token, expiresInMinutes = 30) {
  if (!mongoose.Types.ObjectId.isValid(String(userId))) {
    throw new Error('Invalid user id');
  }

  await PasswordResetToken.deleteMany({ user_id: userId });
  await PasswordResetToken.create({
    user_id: userId,
    token,
    expires_at: new Date(Date.now() + Number(expiresInMinutes || 30) * 60 * 1000)
  });

  return token;
}

export async function createPhoneLoginToken(userId, phone, tokenHash, expiresInMinutes = 10) {
  if (!mongoose.Types.ObjectId.isValid(String(userId))) {
    throw new Error('Invalid user id');
  }

  await PhoneLoginToken.deleteMany({
    $or: [{ user_id: userId }, { phone }]
  });

  await PhoneLoginToken.create({
    user_id: userId,
    phone,
    token_hash: tokenHash,
    expires_at: new Date(Date.now() + Number(expiresInMinutes || 10) * 60 * 1000)
  });
}

export async function consumePhoneLoginToken(phoneDigits, tokenHash) {
  const cleanedDigits = normalizeDigits(phoneDigits);
  const localTen = cleanedDigits.length > 10 ? cleanedDigits.slice(-10) : cleanedDigits;

  const candidate = await PhoneLoginToken.findOne({
    token_hash: tokenHash,
    consumed_at: null,
    expires_at: { $gt: new Date() }
  }).sort({ created_at: -1 });

  if (!candidate) {
    return null;
  }

  const tokenDigits = normalizeDigits(candidate.phone);
  const isPhoneMatch = tokenDigits === cleanedDigits || tokenDigits.endsWith(localTen);

  if (!isPhoneMatch) {
    return null;
  }

  candidate.consumed_at = new Date();
  await candidate.save();

  return String(candidate.user_id);
}

export async function verifyPasswordResetToken(token) {
  const resetToken = await PasswordResetToken.findOne({
    token,
    expires_at: { $gt: new Date() }
  }).lean();

  if (!resetToken) {
    return null;
  }

  const user = await User.findById(resetToken.user_id).lean();
  if (!user) {
    return null;
  }

  return {
    ...toObject(resetToken),
    email: user.email,
    full_name: user.full_name
  };
}

export async function deletePasswordResetToken(token) {
  await PasswordResetToken.deleteOne({ token });
}

export async function updateUserPassword(userId, newPassword) {
  if (!mongoose.Types.ObjectId.isValid(String(userId))) {
    throw new Error('Invalid user id');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { $set: { password: hashedPassword } });
}

export default mongoose;
