// Vercel Serverless Function — Hardened Authentication, Manager PIN & Gift Card Verification (/api/auth)
const {
  verifySecret,
  getSigningSecret,
  signToken,
  verifyActiveSession,
  setSessionCookie,
  clearSessionCookie,
  setSecurityHeaders,
  getClientIp,
  checkRateLimit,
  loadWorkspaceDoc,
  getEffectiveEmployees,
  maskGiftCode
} = require('./_security');

module.exports = async function handler(req, res) {
  setSecurityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { db, doc } = await loadWorkspaceDoc();
    const secret = await getSigningSecret(db);

    if (req.method === 'GET') {
      const sess = verifyActiveSession(req, doc, secret);
      if (!sess) {
        clearSessionCookie(req, res);
        return res.status(401).json({ ok: false, error: 'Not authenticated' });
      }
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
      const sess = verifyActiveSession(req, doc, secret);
      if (!sess) {
        clearSessionCookie(req, res);
        return res.status(401).json({ ok: false, error: 'Not authenticated' });
      }
      return res.status(200).json({ ok: true, user: sess });
    }

    const ip = getClientIp(req);
    const ipAllowed = await checkRateLimit(db, 'ip:' + ip, 12, 5 * 60 * 1000);
    if (!ipAllowed) {
      return res.status(429).json({ ok: false, error: 'Too many attempts from this device. Please wait 5 minutes.' });
    }

    const employees = getEffectiveEmployees(doc, secret);

    if (action === 'login') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      if (!email || !password) {
        return res.status(400).json({ ok: false, error: 'Email and password are required' });
      }
      // Also rate-limit by target account email (blocks distributed/spoofed IP brute force)
      const acctAllowed = await checkRateLimit(db, 'acct:' + email, 10, 5 * 60 * 1000);
      if (!acctAllowed) {
        return res.status(429).json({ ok: false, error: 'Account temporarily locked due to failed attempts. Wait 5 minutes.' });
      }
      const emp = employees.find(e => e.email && e.email.toLowerCase() === email && e.active !== false);
      if (!emp || !verifySecret(password, emp.passwordHash)) {
        return res.status(401).json({ ok: false, error: 'Invalid email or password' });
      }
      const user = { id: emp.id, name: emp.name, role: emp.role, branch: emp.branch || 'All', email: emp.email };
      const token = signToken(emp, secret);
      // Session token is ONLY delivered via HttpOnly SameSite=Strict cookie (never exposed to browser JS)
      setSessionCookie(req, res, token);
      return res.status(200).json({ ok: true, user });
    }

    if (action === 'pin') {
      const pin = String(body.pin || '').replace(/\D/g, '');
      if (pin.length !== 4) {
        return res.status(400).json({ ok: false, error: 'A 4-digit PIN is required' });
      }
      // Global PIN-pad rate-limit per 5 minutes to defeat 4-digit brute force even across IPs
      const pinAllowed = await checkRateLimit(db, 'pin_pad:' + ip, 8, 5 * 60 * 1000);
      if (!pinAllowed) {
        return res.status(429).json({ ok: false, error: 'Too many PIN attempts. Try again in 5 minutes.' });
      }
      const emp = employees.find(e => e.active !== false && verifySecret(pin, e.pinHash));
      if (!emp) {
        return res.status(401).json({ ok: false, error: 'Invalid 4-digit POS PIN' });
      }
      const user = { id: emp.id, name: emp.name, role: emp.role, branch: emp.branch || 'All', email: emp.email };
      const token = signToken(emp, secret);
      setSessionCookie(req, res, token);
      return res.status(200).json({ ok: true, user });
    }

    if (action === 'verifyManagerPin') {
      const sess = verifyActiveSession(req, doc, secret);
      if (!sess) return res.status(401).json({ ok: false, error: 'Authentication required' });
      const pin = String(body.pin || '').replace(/\D/g, '');
      if (pin.length !== 4) return res.status(400).json({ ok: false, error: '4-digit PIN required' });
      const mgr = employees.find(e => e.active !== false && (e.role === 'Owner' || e.role === 'Manager') && verifySecret(pin, e.pinHash));
      if (!mgr) return res.status(403).json({ ok: false, error: 'Invalid Manager/Admin PIN' });
      return res.status(200).json({ ok: true, approver: mgr.name, role: mgr.role });
    }

    // Server-side gift card lookup so cashiers never receive the full list of unmasked gift card codes
    if (action === 'checkGiftCard') {
      const sess = verifyActiveSession(req, doc, secret);
      if (!sess) return res.status(401).json({ ok: false, error: 'Authentication required' });
      const code = String(body.code || '').trim().toUpperCase();
      if (!code) return res.status(400).json({ ok: false, error: 'Enter a gift card code' });
      const cards = (doc && doc.state && Array.isArray(doc.state.giftcards)) ? doc.state.giftcards : [];
      const card = cards.find(g => String(g.code || '').toUpperCase() === code && g.active !== false);
      if (!card) return res.status(404).json({ ok: false, error: 'Gift card not found' });
      if (card.exp && new Date(card.exp) < new Date()) {
        return res.status(400).json({ ok: false, error: 'Gift card has expired' });
      }
      return res.status(200).json({
        ok: true,
        card: {
          maskedCode: maskGiftCode(card.code),
          bal: Number(card.bal) || 0,
          exp: card.exp || null,
          to: card.to || 'Customer'
        }
      });
    }

    return res.status(400).json({ ok: false, error: 'Unknown auth action' });
  } catch (err) {
    console.error('[api/auth] Error:', err && err.message);
    return res.status(500).json({ ok: false, error: 'Authentication service error' });
  }
};
