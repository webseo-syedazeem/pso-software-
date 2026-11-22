// Vercel Serverless Function — Authentication & Manager PIN Verification (/api/auth)
const {
  hashSecret,
  safeEqualHex,
  signToken,
  verifySession,
  setSessionCookie,
  clearSessionCookie,
  setSecurityHeaders,
  getClientIp,
  checkRateLimit,
  loadWorkspaceDoc,
  getEffectiveEmployees
} = require('./_security');

module.exports = async function handler(req, res) {
  setSecurityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const sess = verifySession(req);
      if (!sess) return res.status(401).json({ ok: false, error: 'Not authenticated' });
      return res.status(200).json({ ok: true, user: sess });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
    if (raw.length > 16384) return res.status(413).json({ ok: false, error: 'Payload too large' });
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const action = String(body.action || '');

    if (action === 'logout') {
      clearSessionCookie(req, res);
      return res.status(200).json({ ok: true });
    }

    if (action === 'me') {
      const sess = verifySession(req);
      if (!sess) return res.status(401).json({ ok: false, error: 'Not authenticated' });
      return res.status(200).json({ ok: true, user: sess });
    }

    const ip = getClientIp(req);
    if (!checkRateLimit(ip, 15, 5 * 60 * 1000)) {
      return res.status(429).json({ ok: false, error: 'Too many authentication attempts. Try again in 5 minutes.' });
    }

    const { doc } = await loadWorkspaceDoc();
    const employees = getEffectiveEmployees(doc);

    if (action === 'login') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (!email || !password) {
        return res.status(400).json({ ok: false, error: 'Email and password are required' });
      }
      const emp = employees.find(e => e.email && e.email.toLowerCase() === email && e.active !== false);
      const pwHash = hashSecret(password);
      if (!emp || !safeEqualHex(pwHash, emp.passwordHash)) {
        return res.status(401).json({ ok: false, error: 'Invalid email or password' });
      }
      const user = { id: emp.id, name: emp.name, role: emp.role, branch: emp.branch || 'All', email: emp.email };
      const token = signToken(user);
      setSessionCookie(req, res, token);
      return res.status(200).json({ ok: true, user, token });
    }

    if (action === 'pin') {
      const pin = String(body.pin || '').replace(/\D/g, '');
      if (pin.length !== 4) {
        return res.status(400).json({ ok: false, error: 'A 4-digit PIN is required' });
      }
      const pHash = hashSecret(pin);
      const emp = employees.find(e => e.active !== false && safeEqualHex(pHash, e.pinHash));
      if (!emp) {
        return res.status(401).json({ ok: false, error: 'Invalid 4-digit POS PIN' });
      }
      const user = { id: emp.id, name: emp.name, role: emp.role, branch: emp.branch || 'All', email: emp.email };
      const token = signToken(user);
      setSessionCookie(req, res, token);
      return res.status(200).json({ ok: true, user, token });
    }

    if (action === 'verifyManagerPin') {
      const sess = verifySession(req);
      if (!sess) return res.status(401).json({ ok: false, error: 'Authentication required' });
      const pin = String(body.pin || '').replace(/\D/g, '');
      if (pin.length !== 4) return res.status(400).json({ ok: false, error: '4-digit PIN required' });
      const pHash = hashSecret(pin);
      const mgr = employees.find(e => e.active !== false && (e.role === 'Owner' || e.role === 'Manager') && safeEqualHex(pHash, e.pinHash));
      if (!mgr) return res.status(403).json({ ok: false, error: 'Invalid Manager/Admin PIN' });
      return res.status(200).json({ ok: true, approver: mgr.name, role: mgr.role });
    }

    return res.status(400).json({ ok: false, error: 'Unknown auth action' });
  } catch (err) {
    console.error('[api/auth] Error:', err && err.message);
    return res.status(500).json({ ok: false, error: 'Authentication service error' });
  }
};
