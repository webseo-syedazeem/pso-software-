const crypto = require('crypto');
const { MongoClient } = require('mongodb');

let cachedClient = null;
let memoryDoc = null;
let cachedRuntimeSecret = null;
const ephemeralFallbackSecret = crypto.randomBytes(32).toString('hex');
const memoryRateBuckets = new Map();

const PERSIST_KEYS = [
  'settings', 'products', 'customers', 'orders', 'suppliers', 'pos', 'branches',
  'transfers', 'employees', 'registers', 'zreports', 'promotions', 'giftcards',
  'coupons', 'audit', 'movements', 'online', 'devices', 'backups', 'suspicious',
  'waste', 'approvals', 'logins', 'notifs', 'held', 'roles', 'matrix', 'notifPrefs'
];

const OWNER_ONLY_KEYS = ['employees', 'roles', 'matrix', 'settings'];

/* ================= CRYPTO: PER-USER SALTED SCRYPT ================= */
function hashSecret(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = crypto.scryptSync(String(plain || ''), salt, 32, { N: 16384, r: 8, p: 1 }).toString('hex');
  return `scrypt$${salt}$${key}`;
}

function safeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
  } catch {
    return false;
  }
}

function verifySecret(plain, stored) {
  if (!stored || typeof stored !== 'string') return false;
  if (stored.startsWith('scrypt$')) {
    const parts = stored.split('$');
    if (parts.length !== 3) return false;
    const [, salt, keyHex] = parts;
    const derived = crypto.scryptSync(String(plain || ''), salt, 32, { N: 16384, r: 8, p: 1 }).toString('hex');
    return safeEqualHex(derived, keyHex);
  }
  // Legacy SHA-256 verification for transparent migration only
  const legacy = crypto.createHash('sha256').update('monarch_retail_os_v2:' + String(plain || '')).digest('hex');
  return safeEqualHex(legacy, stored);
}

function pinFingerprint(pin, secret) {
  return crypto.createHmac('sha256', secret).update('pin_fp:' + String(pin || '')).digest('hex');
}

/* ================= SIGNING SECRET (NEVER HARDCODED IN PUBLIC REPO) ================= */
async function getSigningSecret(db) {
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 24) {
    return process.env.SESSION_SECRET;
  }
  if (cachedRuntimeSecret) return cachedRuntimeSecret;
  if (db) {
    try {
      const secretsCol = db.collection('server_secrets');
      const existing = await secretsCol.findOne({ _id: 'session_signing_key' });
      if (existing && typeof existing.key === 'string' && existing.key.length >= 48) {
        cachedRuntimeSecret = existing.key;
        return cachedRuntimeSecret;
      }
      const generated = crypto.randomBytes(32).toString('hex');
      await secretsCol.updateOne(
        { _id: 'session_signing_key' },
        { $setOnInsert: { key: generated, createdAt: new Date() } },
        { upsert: true }
      );
      const saved = await secretsCol.findOne({ _id: 'session_signing_key' });
      cachedRuntimeSecret = (saved && saved.key) || generated;
      return cachedRuntimeSecret;
    } catch {
      // Fall through to ephemeral per-process random secret (still never hardcoded)
    }
  }
  return ephemeralFallbackSecret;
}

/* ================= DEFAULT BOOTSTRAP EMPLOYEES (SCRYPT HASHED) ================= */
function buildDefaultEmployees(secret) {
  const mk = (id, name, role, branch, onShift, email, comm, defPw, defPin, envPwHash, envPinHash) => ({
    id,
    name,
    role,
    branch,
    onShift,
    email,
    active: true,
    sales: 0,
    txns: 0,
    comm,
    credVersion: 1,
    passwordHash: envPwHash || hashSecret(defPw),
    pinHash: envPinHash || hashSecret(defPin),
    pinFp: pinFingerprint(defPin, secret)
  });
  return [
    mk(1, 'Store Admin', 'Owner', 'All', true, 'admin@monarchpos.com', 0, process.env.ADMIN_DEFAULT_PASSWORD || 'admin123', process.env.ADMIN_DEFAULT_PIN || '1234', process.env.ADMIN_PASSWORD_HASH, process.env.ADMIN_PIN_HASH),
    mk(2, 'Sarah Khan', 'Manager', 'MAIN', true, 'sarah@monarchpos.com', 1.5, 'manager123', '2222'),
    mk(3, 'Bilal Ahmed', 'Cashier', 'MAIN', true, 'bilal@monarchpos.com', 1.0, 'cashier123', '3333'),
    mk(4, 'Usman Ali', 'Cashier', 'CITY', false, 'usman@monarchpos.com', 1.0, 'cashier123', '4444')
  ];
}

let cachedDefaults = null;
function getDefaultEmployees(secret) {
  if (!cachedDefaults) cachedDefaults = buildDefaultEmployees(secret);
  return cachedDefaults;
}

/* ================= TOKENS & HTTP-ONLY COOKIES ================= */
function b64u(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function unb64u(str) {
  const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : '';
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64').toString('utf8');
}

function signToken(emp, secret) {
  const payload = {
    id: emp.id,
    email: emp.email,
    role: emp.role,
    cv: emp.credVersion || 1,
    exp: Date.now() + 12 * 3600 * 1000
  };
  const body = b64u(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${body}.${sig}`;
}

function verifyToken(token, secret) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  if (!safeEqualHex(sig, expected)) return null;
  try {
    const payload = JSON.parse(unb64u(body));
    if (!payload || !payload.exp || Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function parseCookies(req) {
  const hdr = (req.headers && req.headers.cookie) || '';
  const out = {};
  hdr.split(';').forEach(part => {
    const idx = part.indexOf('=');
    if (idx > 0) {
      const k = part.slice(0, idx).trim();
      const v = part.slice(idx + 1).trim();
      try { out[k] = decodeURIComponent(v); } catch { out[k] = v; }
    }
  });
  return out;
}

// Verifies BOTH the signed HttpOnly cookie AND live employee status/role/credVersion in DB.
// Disabled, deleted, or credential-rotated staff are rejected immediately (never valid for 12h).
function verifyActiveSession(req, doc, secret) {
  const cookies = parseCookies(req);
  let rawToken = cookies.monarch_sess || '';
  if (!rawToken) {
    const auth = (req.headers && (req.headers.authorization || req.headers.Authorization)) || '';
    if (auth.startsWith('Bearer ')) rawToken = auth.slice(7).trim();
  }
  const payload = verifyToken(rawToken, secret);
  if (!payload) return null;

  const employees = getEffectiveEmployees(doc, secret);
  const emp = employees.find(e => e.id === payload.id && e.email && payload.email && e.email.toLowerCase() === payload.email.toLowerCase());
  if (!emp || emp.active === false) return null;
  if ((emp.credVersion || 1) !== (payload.cv || 1)) return null;

  // Always return live role/branch/name from DB so role changes apply immediately
  return {
    id: emp.id,
    name: emp.name,
    role: emp.role,
    branch: emp.branch || 'All',
    email: emp.email
  };
}

function setSessionCookie(req, res, token) {
  const isHttps = (req.headers && req.headers['x-forwarded-proto'] === 'https') || process.env.VERCEL === '1';
  const parts = [
    `monarch_sess=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${12 * 3600}`
  ];
  if (isHttps) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(req, res) {
  const isHttps = (req.headers && req.headers['x-forwarded-proto'] === 'https') || process.env.VERCEL === '1';
  const parts = ['monarch_sess=', 'Path=/', 'HttpOnly', 'SameSite=Strict', 'Max-Age=0'];
  if (isHttps) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

/* ================= HEADERS & RATE LIMITING ================= */
function setSecurityHeaders(req, res) {
  const origin = req.headers && req.headers.origin;
  const host = req.headers && req.headers.host;
  const allowedEnv = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (origin) {
    let originHost = '';
    try { originHost = new URL(origin).host; } catch {}
    if ((host && originHost === host) || allowedEnv.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    }
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store');
}

function getClientIp(req) {
  const h = req.headers || {};
  // Prefer trusted platform headers (cannot be spoofed by client X-Forwarded-For prefix)
  if (h['x-vercel-forwarded-for']) {
    const parts = String(h['x-vercel-forwarded-for']).split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  if (h['x-real-ip']) return String(h['x-real-ip']).trim();
  if (h['x-forwarded-for']) {
    const parts = String(h['x-forwarded-for']).split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

async function checkRateLimit(db, bucketKey, limit = 12, windowMs = 5 * 60 * 1000) {
  const now = Date.now();
  const cutoff = now - windowMs;

  // Use MongoDB-backed rate limiter when DB is connected (survives serverless cold starts)
  if (db) {
    try {
      const rlCol = db.collection('server_ratelimits');
      const doc = await rlCol.findOne({ _id: bucketKey });
      const hits = ((doc && Array.isArray(doc.hits)) ? doc.hits : []).filter(t => t > cutoff);
      if (hits.length >= limit) {
        await rlCol.updateOne({ _id: bucketKey }, { $set: { hits, updatedAt: new Date() } }, { upsert: true });
        return false;
      }
      hits.push(now);
      await rlCol.updateOne({ _id: bucketKey }, { $set: { hits, updatedAt: new Date() } }, { upsert: true });
      return true;
    } catch {
      // Fallback to in-memory limiter if DB error occurs
    }
  }

  const list = (memoryRateBuckets.get(bucketKey) || []).filter(t => t > cutoff);
  if (list.length >= limit) {
    memoryRateBuckets.set(bucketKey, list);
    return false;
  }
  list.push(now);
  memoryRateBuckets.set(bucketKey, list);
  return true;
}

function stripDangerousKeys(obj, depth = 0) {
  if (depth > 16 || !obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(item => stripDangerousKeys(item, depth + 1));
  const clean = {};
  for (const k of Object.keys(obj)) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
    clean[k] = stripDangerousKeys(obj[k], depth + 1);
  }
  return clean;
}

/* ================= MONGODB CONNECTION & ATOMIC OPS ================= */
function getMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  const { MONGODB_USERNAME: u, MONGODB_PASSWORD: p, MONGODB_HOST: h } = process.env;
  return u && p && h ? `mongodb+srv://${encodeURIComponent(u)}:${encodeURIComponent(p)}@${h}` : null;
}

async function getMongoDb() {
  const uri = getMongoUri();
  if (!uri) return null;
  if (!cachedClient) {
    cachedClient = new MongoClient(uri, { serverSelectionTimeoutMS: 6000 });
    await cachedClient.connect();
  }
  const dbName = process.env.MONGODB_DB || 'monarch_pos';
  return cachedClient.db(dbName);
}

async function loadWorkspaceDoc() {
  const db = await getMongoDb();
  if (db) {
    const col = db.collection('live_workspace_v2');
    const doc = await col.findOne({ _id: 'monarch_live' });
    return { db, col, doc };
  }
  return { db: null, col: null, doc: memoryDoc };
}

async function saveWorkspaceDocAtomic(col, state, expectedRev, nextRev, force = false) {
  const updatedAt = new Date();
  if (col) {
    if (force || expectedRev === 0) {
      await col.updateOne(
        { _id: 'monarch_live' },
        { $set: { state, rev: nextRev, updatedAt } },
        { upsert: true }
      );
      return true;
    }
    // Atomic Compare-And-Swap: succeeds ONLY if DB rev still equals expectedRev
    const res = await col.updateOne(
      { _id: 'monarch_live', rev: expectedRev },
      { $set: { state, rev: nextRev, updatedAt } }
    );
    return res.matchedCount === 1;
  }
  if (!force && expectedRev > 0 && memoryDoc && memoryDoc.rev !== expectedRev) {
    return false;
  }
  memoryDoc = { _id: 'monarch_live', state, rev: nextRev, updatedAt };
  return true;
}

async function deleteWorkspaceDoc(col) {
  if (col) {
    await col.deleteOne({ _id: 'monarch_live' });
  }
  memoryDoc = null;
}

/* ================= CREDENTIAL NORMALIZATION & SANITIZATION ================= */
function normalizeEmployeeCreds(emp, existingEmp, secret) {
  const out = { ...emp };
  let rotated = false;

  if (out.newPassword && String(out.newPassword).trim()) {
    out.passwordHash = hashSecret(String(out.newPassword).trim());
    rotated = true;
  } else if (out.password && String(out.password).trim()) {
    out.passwordHash = hashSecret(String(out.password).trim());
    rotated = true;
  } else if (existingEmp && existingEmp.passwordHash) {
    out.passwordHash = existingEmp.passwordHash;
  } else if (!out.passwordHash) {
    out.passwordHash = hashSecret('staff123');
  }

  if (out.newPin && /^\d{4}$/.test(String(out.newPin).trim())) {
    const cleanPin = String(out.newPin).trim();
    out.pinHash = hashSecret(cleanPin);
    out.pinFp = pinFingerprint(cleanPin, secret);
    rotated = true;
  } else if (out.pin && /^\d{4}$/.test(String(out.pin).trim())) {
    const cleanPin = String(out.pin).trim();
    out.pinHash = hashSecret(cleanPin);
    out.pinFp = pinFingerprint(cleanPin, secret);
    rotated = true;
  } else if (existingEmp && existingEmp.pinHash) {
    out.pinHash = existingEmp.pinHash;
    if (existingEmp.pinFp) out.pinFp = existingEmp.pinFp;
  } else if (!out.pinHash) {
    out.pinHash = hashSecret('1234');
    out.pinFp = pinFingerprint('1234', secret);
  }

  const prevVer = (existingEmp && existingEmp.credVersion) || out.credVersion || 1;
  const roleChanged = existingEmp && existingEmp.role !== out.role;
  const activeChanged = existingEmp && existingEmp.active !== out.active;
  out.credVersion = (rotated || roleChanged || activeChanged) ? prevVer + 1 : prevVer;

  delete out.password;
  delete out.pin;
  delete out.newPassword;
  delete out.newPin;
  delete out.altEmail;
  return out;
}

function maskGiftCode(code) {
  const s = String(code || '');
  if (s.length <= 4) return '••••';
  return 'GC-••••-' + s.slice(-4);
}

function sanitizeStateForClient(state, role = 'Cashier') {
  if (!state || typeof state !== 'object') return null;
  const copy = JSON.parse(JSON.stringify(state));
  const isPrivileged = role === 'Owner' || role === 'Manager';

  if (Array.isArray(copy.employees)) {
    copy.employees = copy.employees.map(e => {
      const safe = { ...e };
      safe.hasPin = !!(safe.pinHash || safe.pin);
      delete safe.password;
      delete safe.pin;
      delete safe.passwordHash;
      delete safe.pinHash;
      delete safe.pinFp;
      delete safe.newPassword;
      delete safe.newPin;
      delete safe.altEmail;
      return safe;
    });
  }
  if (copy.settings && typeof copy.settings === 'object') {
    delete copy.settings.managerPin;
  }
  // Mask full gift card codes for non-Owner/non-Manager roles so cashiers cannot harvest unused codes
  if (!isPrivileged && Array.isArray(copy.giftcards)) {
    copy.giftcards = copy.giftcards.map((g, idx) => ({
      ...g,
      _gcId: g._gcId || ('gc_' + idx + '_' + String(g.code || '').slice(-4)),
      code: maskGiftCode(g.code),
      masked: true
    }));
  }
  return copy;
}

function getEffectiveEmployees(doc, secret) {
  const emps = doc && doc.state && Array.isArray(doc.state.employees) && doc.state.employees.length
    ? doc.state.employees
    : getDefaultEmployees(secret);
  return emps.map(e => normalizeEmployeeCreds(e, e, secret));
}

const DEFAULT_MATRIX = {
  Owner: 'sale disc10 discMax refund void price stock po reports users settings',
  Manager: 'sale disc10 discMax refund void price stock po reports',
  Cashier: 'sale disc10',
  'Stock Clerk': 'stock po'
};

function serverHasPerm(role, perm, matrix) {
  if (role === 'Owner') return true;
  const m = (matrix && typeof matrix === 'object') ? matrix : DEFAULT_MATRIX;
  return String(m[role] || '').split(' ').includes(perm);
}

module.exports = {
  PERSIST_KEYS,
  OWNER_ONLY_KEYS,
  hashSecret,
  verifySecret,
  safeEqualHex,
  pinFingerprint,
  getSigningSecret,
  signToken,
  verifyToken,
  verifyActiveSession,
  setSessionCookie,
  clearSessionCookie,
  setSecurityHeaders,
  getClientIp,
  checkRateLimit,
  stripDangerousKeys,
  loadWorkspaceDoc,
  saveWorkspaceDocAtomic,
  deleteWorkspaceDoc,
  normalizeEmployeeCreds,
  maskGiftCode,
  sanitizeStateForClient,
  getEffectiveEmployees,
  serverHasPerm
};
