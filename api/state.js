// Vercel Serverless Function + MongoDB Atlas Persistence Handler (/api/state)
const {
  PERSIST_KEYS,
  OWNER_ONLY_KEYS,
  verifySession,
  setSecurityHeaders,
  stripDangerousKeys,
  loadWorkspaceDoc,
  saveWorkspaceDoc,
  deleteWorkspaceDoc,
  normalizeEmployeeCreds,
  sanitizeStateForClient
} = require('./_security');

const MAX_PAYLOAD_BYTES = 2 * 1024 * 1024; // 2 MB cap

module.exports = async function handler(req, res) {
  setSecurityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Require a valid server-signed session for all state operations
    const session = verifySession(req);
    if (!session) {
      return res.status(401).json({ ok: false, error: 'Authentication required' });
    }

    const { col, doc } = await loadWorkspaceDoc();

    if (req.method === 'GET') {
      const safe = doc && doc.state ? sanitizeStateForClient(doc.state) : null;
      return res.status(200).json({ ok: true, mongo: !!col, rev: (doc && doc.rev) || 0, state: safe });
    }

    if (req.method === 'POST') {
      const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
      if (raw.length > MAX_PAYLOAD_BYTES) {
        return res.status(413).json({ ok: false, error: 'Payload exceeds 2 MB limit' });
      }
      const parsed = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!parsed || typeof parsed !== 'object') {
        return res.status(400).json({ ok: false, error: 'Invalid JSON body' });
      }

      const existingState = (doc && doc.state) || {};
      const serverRev = (doc && doc.rev) || 0;
      const clientRev = typeof parsed._rev === 'number' ? parsed._rev : null;
      const force = !!parsed._force;

      // Optimistic concurrency control: prevent silent overwrite across multiple registers
      if (!force && clientRev !== null && serverRev > 0 && clientRev < serverRev) {
        return res.status(409).json({
          ok: false,
          conflict: true,
          rev: serverRev,
          state: sanitizeStateForClient(existingState),
          error: 'Workspace was updated by another register. Syncing latest state.'
        });
      }

      // Whitelist only allowed top-level state keys & strip prototype pollution keys
      const incoming = stripDangerousKeys(parsed);
      const nextState = {};
      const isOwner = session.role === 'Owner';

      for (const key of PERSIST_KEYS) {
        if (!isOwner && OWNER_ONLY_KEYS.includes(key) && existingState[key] !== undefined) {
          // Server-side RBAC: non-Owner cannot overwrite employees, roles, matrix, or system settings
          nextState[key] = existingState[key];
          continue;
        }
        if (incoming[key] !== undefined) {
          nextState[key] = incoming[key];
        } else if (existingState[key] !== undefined) {
          nextState[key] = existingState[key];
        }
      }

      // Hash & preserve employee credentials server-side; never persist plaintext passwords/PINs
      if (Array.isArray(nextState.employees)) {
        const prevEmps = Array.isArray(existingState.employees) ? existingState.employees : [];
        nextState.employees = nextState.employees.map(emp => {
          const prev = prevEmps.find(x => x.id === emp.id || (x.email && emp.email && x.email.toLowerCase() === emp.email.toLowerCase()));
          return normalizeEmployeeCreds(emp, prev);
        });
      }
      if (nextState.settings && typeof nextState.settings === 'object') {
        delete nextState.settings.managerPin;
      }

      const nextRev = serverRev + 1;
      await saveWorkspaceDoc(col, nextState, nextRev);
      return res.status(200).json({ ok: true, mongo: !!col, rev: nextRev });
    }

    if (req.method === 'DELETE') {
      if (session.role !== 'Owner') {
        return res.status(403).json({ ok: false, error: 'Owner role required to wipe workspace' });
      }
      await deleteWorkspaceDoc(col);
      return res.status(200).json({ ok: true, mongo: !!col, rev: 0 });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/state] Error:', err && err.message);
    return res.status(500).json({ ok: false, error: 'Database operation failed' });
  }
};
