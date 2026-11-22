const crypto = require('crypto');
const { MongoClient } = require('mongodb');

let cachedClient = null;
let memoryDoc = null;
const rateBuckets = new Map();

const PERSIST_KEYS = [
  'settings', 'products', 'customers', 'orders', 'suppliers', 'pos', 'branches',
  'transfers', 'employees', 'registers', 'zreports', 'promotions', 'giftcards',
  'coupons', 'audit', 'movements', 'online', 'devices', 'backups', 'suspicious',
  'waste', 'approvals', 'logins', 'notifs', 'held', 'roles', 'matrix', 'notifPrefs'
];

const OWNER_ONLY_KEYS = ['employees', 'roles', 'matrix', 'settings'];

function hashSecret(val) {
  return crypto.createHash('sha256').update('monarch_retail_os_v2:' + String(val || '')).digest('hex');
}

function safeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
  } catch {
    return false;
  }
}

// Default hashed credentials used only when bootstrapping a brand-new empty DB.
// Override via ADMIN_PASSWORD_HASH / ADMIN_PIN_HASH env vars in production.
const DEFAULT_EMPLOYEES = [
  {
    id: 1,
    name: 'Store Admin',
    role: 'Owner',
    branch: 'All',
    onShift: true,
    email: 'admin@monarchpos.com',
    active: true,
    sales: 0,
    txns: 0,
    comm: 0,
    passwordHash: process.env.ADMIN_PASSWORD_HASH || hashSecret('admin123'),
    pinHash: process.env.ADMIN_PIN_HASH || hashSecret('1234')
  },
  {
    id: 2,
    name: 'Sarah Khan',
    role: 'Manager',
    branch: 'MAIN',
    onShift: true,
    email: 'sarah@monarchpos.com',
    active: true,
    sales: 0,
    txns: 0,
    comm: 1.5,
    passwordHash: hashSecret('manager123'),
    pinHash: hashSecret('2222')
  },
  {
    id: 3,
    name: 'Bilal Ahmed',
    role: 'Cashier',
    branch: 'MAIN',
    onShift: true,
    email: 'bilal@monarchpos.com',
    active: true,
    sales: 0,
    txns: 0,
    comm: 1.0,
    passwordHash: hashSecret('cashier123'),
    pinHash: hashSecret('3333')
  },
  {
    id: 4,
    name: 'Usman Ali',
    role: 'Cashier',
    branch: 'CITY',
    onShift: false,
    email: 'usman@monarchpos.com',
    active: true,
    sales: 0,
    txns: 0,
    comm: 1.0,
    passwordHash: hashSecret('cashier123'),
    pinHash: hashSecret('4444')
  }
];

function getSigningSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const seed = process.env.MONGODB_URI || process.env.MONGODB_PASSWORD || 'monarch_local_fallback_secret';
  return crypto.createHash('sha256').update('monarch_jwt_key:' + seed).digest('hex');
}

function b64u(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function unb64u(str) {
  const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : '';
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64').toString('utf8');
}

function signToken(user) {
  const payload = {
    id: user.id,
    name: user.name,
    role: user.role,
    branch: user.branch || 'All',
    email: user.email,
    exp: Date.now() + 12 * 3600 * 1000
  };
  const body = b64u(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', getSigningSecret()).update(body).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${body}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto.createHmac('sha256', getSigningSecret()).update(body).digest('base64')
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
      out[k] = decodeURIComponent(v);
    }
  });
  return out;
}

function verifySession(req) {
  const auth = (req.headers && (req.headers.authorization || req.headers.Authorization)) || '';
  if (auth.startsWith('Bearer ')) {
    const t = verifyToken(auth.slice(7).trim());
    if (t) return t;
  }
  const cookies = parseCookies(req);
  if (cookies.monarch_sess) {
    return verifyToken(cookies.monarch_sess);
  }
  return null;
}

function setSessionCookie(req, res, token) {
  const isHttps = (req.headers && req.headers['x-forwarded-proto'] === 'https') || process.env.VERCEL === '1';
  const parts = [
    `monarch_sess=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${12 * 3600}`
  ];
  if (isHttps) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearSessionCookie(req, res) {
  const isHttps = (req.headers && req.headers['x-forwarded-proto'] === 'https') || process.env.VERCEL === '1';
  const parts = ['monarch_sess=', 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (isHttps) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store');
}

function getClientIp(req) {
  const xf = req.headers && (req.headers['x-forwarded-for'] || req.headers['x-real-ip']);
  if (xf) return String(xf).split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function checkRateLimit(ip, limit = 15, windowMs = 5 * 60 * 1000) {
  const now = Date.now();
  const list = (rateBuckets.get(ip) || []).filter(t => now - t < windowMs);
  if (list.length >= limit) {
    rateBuckets.set(ip, list);
    return false;
  }
  list.push(now);
  rateBuckets.set(ip, list);
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

function getMongoUri() {
  // Credentials must come from environment variables (Vercel → Settings → Environment Variables).
  // Never hard-code them: this repository is public.
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  const { MONGODB_USERNAME: u, MONGODB_PASSWORD: p, MONGODB_HOST: h } = process.env;
  return u && p && h ? `mongodb+srv://${encodeURIComponent(u)}:${encodeURIComponent(p)}@${h}` : null;
}

async function getMongoCollection() {
  const uri = getMongoUri();
  if (!uri) return null;
  if (!cachedClient) {
    cachedClient = new MongoClient(uri, { serverSelectionTimeoutMS: 6000 });
    await cachedClient.connect();
  }
  const dbName = process.env.MONGODB_DB || 'monarch_pos';
  return cachedClient.db(dbName).collection('live_workspace_v2');
}

async function loadWorkspaceDoc() {
  const col = await getMongoCollection();
  if (col) {
    const doc = await col.findOne({ _id: 'monarch_live' });
    return { col, doc };
  }
  return { col: null, doc: memoryDoc };
}

async function saveWorkspaceDoc(col, state, rev) {
  const updatedAt = new Date();
  if (col) {
    await col.updateOne(
      { _id: 'monarch_live' },
      { $set: { state, rev, updatedAt } },
      { upsert: true }
    );
  } else {
    memoryDoc = { _id: 'monarch_live', state, rev, updatedAt };
  }
}

async function deleteWorkspaceDoc(col) {
  if (col) {
    await col.deleteOne({ _id: 'monarch_live' });
  }
  memoryDoc = null;
}

function normalizeEmployeeCreds(emp, existingEmp) {
  const out = { ...emp };
  // Hash any incoming newPassword / newPin or legacy plaintext password / pin
  if (out.newPassword && String(out.newPassword).trim()) {
    out.passwordHash = hashSecret(String(out.newPassword).trim());
  } else if (out.password && String(out.password).trim()) {
    out.passwordHash = hashSecret(String(out.password).trim());
  } else if (existingEmp && existingEmp.passwordHash) {
    out.passwordHash = existingEmp.passwordHash;
  } else if (!out.passwordHash) {
    out.passwordHash = hashSecret('staff123');
  }

  if (out.newPin && /^\d{4}$/.test(String(out.newPin).trim())) {
    out.pinHash = hashSecret(String(out.newPin).trim());
  } else if (out.pin && /^\d{4}$/.test(String(out.pin).trim())) {
    out.pinHash = hashSecret(String(out.pin).trim());
  } else if (existingEmp && existingEmp.pinHash) {
    out.pinHash = existingEmp.pinHash;
  } else if (!out.pinHash) {
    out.pinHash = hashSecret('1234');
  }

  delete out.password;
  delete out.pin;
  delete out.newPassword;
  delete out.newPin;
  delete out.altEmail;
  return out;
}

function sanitizeStateForClient(state) {
  if (!state || typeof state !== 'object') return null;
  const copy = JSON.parse(JSON.stringify(state));
  if (Array.isArray(copy.employees)) {
    copy.employees = copy.employees.map(e => {
      const safe = { ...e };
      safe.hasPin = !!(safe.pinHash || safe.pin);
      delete safe.password;
      delete safe.pin;
      delete safe.passwordHash;
      delete safe.pinHash;
      delete safe.newPassword;
      delete safe.newPin;
      delete safe.altEmail;
      return safe;
    });
  }
  if (copy.settings && typeof copy.settings === 'object') {
    delete copy.settings.managerPin;
  }
  return copy;
}

function getEffectiveEmployees(doc) {
  const emps = doc && doc.state && Array.isArray(doc.state.employees) && doc.state.employees.length
    ? doc.state.employees
    : DEFAULT_EMPLOYEES;
  return emps.map(e => normalizeEmployeeCreds(e, e));
}

module.exports = {
  PERSIST_KEYS,
  OWNER_ONLY_KEYS,
  DEFAULT_EMPLOYEES,
  hashSecret,
  safeEqualHex,
  signToken,
  verifyToken,
  verifySession,
  setSessionCookie,
  clearSessionCookie,
  setSecurityHeaders,
  getClientIp,
  checkRateLimit,
  stripDangerousKeys,
  loadWorkspaceDoc,
  saveWorkspaceDoc,
  deleteWorkspaceDoc,
  normalizeEmployeeCreds,
  sanitizeStateForClient,
  getEffectiveEmployees
};
