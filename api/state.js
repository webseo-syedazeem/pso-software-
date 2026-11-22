// Vercel Serverless Function + MongoDB Atlas Persistence Handler (/api/state)
const {
  PERSIST_KEYS,
  OWNER_ONLY_KEYS,
  verifySecret,
  getSigningSecret,
  verifyActiveSession,
  clearSessionCookie,
  setSecurityHeaders,
  stripDangerousKeys,
  loadWorkspaceDoc,
  saveWorkspaceDocAtomic,
  deleteWorkspaceDoc,
  normalizeEmployeeCreds,
  maskGiftCode,
  sanitizeStateForClient,
  serverHasPerm
} = require('./_security');

const MAX_PAYLOAD_BYTES = 2 * 1024 * 1024; // 2 MB cap

function mergeAppendOnly(existingArr, incomingArr, keyFn, maxLen = 500) {
  const existing = Array.isArray(existingArr) ? existingArr : [];
  const incoming = Array.isArray(incomingArr) ? incomingArr : [];
  const seen = new Set();
  const merged = [];
  // Keep all existing entries and add any genuinely new incoming entries
  for (const item of [...incoming, ...existing]) {
    if (!item || typeof item !== 'object') continue;
    const k = keyFn(item);
    if (!seen.has(k)) {
      seen.add(k);
      merged.push(item);
    }
  }
  merged.sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0));
  return merged.slice(0, maxLen);
}

function extractInvNum(inv) {
  const m = String(inv || '').match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : 0;
}

module.exports = async function handler(req, res) {
  setSecurityHeaders(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { db, col, doc } = await loadWorkspaceDoc();
    const secret = await getSigningSecret(db);

    // Verify signed HttpOnly cookie AND live employee active status / role / credVersion in DB
    const session = verifyActiveSession(req, doc, secret);
    if (!session) {
      clearSessionCookie(req, res);
      return res.status(401).json({ ok: false, error: 'Authentication required' });
    }

    if (req.method === 'GET') {
      const safe = doc && doc.state ? sanitizeStateForClient(doc.state, session.role) : null;
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
      const force = !!parsed._force && session.role === 'Owner';

      // Optimistic concurrency check before processing
      if (!force && clientRev !== null && serverRev > 0 && clientRev < serverRev) {
        return res.status(409).json({
          ok: false,
          conflict: true,
          rev: serverRev,
          state: sanitizeStateForClient(existingState, session.role),
          error: 'Workspace updated by another register. Merging and retrying.'
        });
      }

      const incoming = stripDangerousKeys(parsed);
      const nextState = {};
      const isOwner = session.role === 'Owner';
      const matrix = existingState.matrix || incoming.matrix;
      const canPrice = serverHasPerm(session.role, 'price', matrix);
      const canStock = serverHasPerm(session.role, 'stock', matrix);
      const canPO = serverHasPerm(session.role, 'po', matrix);
      const canRefund = serverHasPerm(session.role, 'refund', matrix);
      const canSettings = serverHasPerm(session.role, 'settings', matrix);

      // Copy whitelisted keys with strict Owner-only key protection
      for (const key of PERSIST_KEYS) {
        if (!isOwner && OWNER_ONLY_KEYS.includes(key) && existingState[key] !== undefined) {
          nextState[key] = JSON.parse(JSON.stringify(existingState[key]));
          continue;
        }
        if (incoming[key] !== undefined) {
          nextState[key] = incoming[key];
        } else if (existingState[key] !== undefined) {
          nextState[key] = existingState[key];
        }
      }

      // 1. IMMUTABLE APPEND-ONLY LOGS: audit, logins, zreports, movements can never be wiped via POST
      if (!force) {
        if (Array.isArray(existingState.audit)) {
          nextState.audit = mergeAppendOnly(existingState.audit, nextState.audit, x => `${x.time}|${x.who}|${x.what}|${x.ref}`, 600);
        }
        if (Array.isArray(existingState.logins)) {
          nextState.logins = mergeAppendOnly(existingState.logins, nextState.logins, x => `${x.time}|${x.who}|${x.dev}|${x.ok}`, 300);
        }
        if (Array.isArray(existingState.movements)) {
          nextState.movements = mergeAppendOnly(existingState.movements, nextState.movements, x => `${x.time}|${x.pid}|${x.qty}|${x.reason}`, 800);
        }
        if (Array.isArray(existingState.zreports)) {
          nextState.zreports = mergeAppendOnly(existingState.zreports, nextState.zreports, x => `${x.time}|${x.reg}|${x.who}|${x.counted}`, 300);
        }
      }

      // 2. SERVER-SIDE RBAC ON PRODUCTS (Cashiers cannot change prices, costs, names, or delete products)
      if (!canPrice && Array.isArray(existingState.products)) {
        const incMap = new Map((Array.isArray(incoming.products) ? incoming.products : []).map(p => [p.id, p]));
        nextState.products = existingState.products.map(oldP => {
          const incP = incMap.get(oldP.id);
          if (!incP) return oldP;
          const nextStock = Number(incP.stock);
          const safeStock = Number.isFinite(nextStock) && nextStock >= 0
            ? (canStock ? nextStock : Math.min(oldP.stock, nextStock))
            : oldP.stock;
          const nextSold = Number(incP.sold30);
          const safeSold = Number.isFinite(nextSold) && nextSold >= (oldP.sold30 || 0) ? nextSold : (oldP.sold30 || 0);
          return { ...oldP, stock: safeStock, sold30: safeSold };
        });
      }

      // 3. SERVER-SIDE RBAC ON SUPPLIERS & PURCHASE ORDERS (Cashiers cannot tamper with suppliers / POs)
      if (!canPO) {
        if (existingState.suppliers !== undefined) nextState.suppliers = existingState.suppliers;
        if (existingState.pos !== undefined) nextState.pos = existingState.pos;
      }

      // 4. SERVER-SIDE RBAC ON BRANCHES, DEVICES, BACKUPS
      if (!canSettings && !isOwner) {
        if (existingState.branches !== undefined) nextState.branches = existingState.branches;
        if (existingState.devices !== undefined) nextState.devices = existingState.devices;
        if (existingState.backups !== undefined) nextState.backups = existingState.backups;
      }

      // 5. SERVER-SIDE RBAC ON PROMOTIONS & COUPONS (non-price roles can only increment uses/rev)
      if (!canPrice) {
        if (Array.isArray(existingState.promotions)) {
          const incPromos = new Map((Array.isArray(incoming.promotions) ? incoming.promotions : []).map(p => [p.id, p]));
          nextState.promotions = existingState.promotions.map(oldP => {
            const incP = incPromos.get(oldP.id);
            if (!incP) return oldP;
            return {
              ...oldP,
              uses: Math.max(oldP.uses || 0, Number(incP.uses) || 0),
              rev: Math.max(oldP.rev || 0, Number(incP.rev) || 0)
            };
          });
        }
        if (Array.isArray(existingState.coupons)) {
          const incCoup = new Map((Array.isArray(incoming.coupons) ? incoming.coupons : []).map(c => [c.code, c]));
          nextState.coupons = existingState.coupons.map(oldC => {
            const incC = incCoup.get(oldC.code);
            if (!incC) return oldC;
            return { ...oldC, uses: Math.max(oldC.uses || 0, Number(incC.uses) || 0) };
          });
        }
      }

      // 6. SERVER-SIDE GIFT CARD CODE PRESERVATION & BALANCE PROTECTION
      if (Array.isArray(existingState.giftcards)) {
        const incCards = Array.isArray(incoming.giftcards) ? incoming.giftcards : [];
        const newOrders = Array.isArray(incoming.orders)
          ? incoming.orders.filter(o => !(existingState.orders || []).some(e => e.id === o.id))
          : [];
        // Sum any gift card redemptions from newly submitted orders
        const redemptionsByCode = {};
        newOrders.forEach(o => {
          (o.pays || []).forEach(p => {
            if (p.method === 'Gift card' && p.ref) {
              const codeKey = String(p.ref).trim().toUpperCase();
              redemptionsByCode[codeKey] = (redemptionsByCode[codeKey] || 0) + (Number(p.amount) || 0);
            }
          });
        });

        if (!canPrice && !canSettings) {
          // Cashiers can never create gift cards, unmask codes, or increase balances — only valid sale deductions apply
          nextState.giftcards = existingState.giftcards.map(oldG => {
            const codeKey = String(oldG.code || '').toUpperCase();
            const deduct = redemptionsByCode[codeKey] || 0;
            const nextBal = Math.max(0, Math.round(((Number(oldG.bal) || 0) - deduct) * 100) / 100);
            return { ...oldG, bal: nextBal };
          });
        } else {
          // Privileged users: ensure any masked code coming back never overwrites real code
          nextState.giftcards = incCards.map(g => {
            const matchOld = existingState.giftcards.find(og => og.code === g.code || maskGiftCode(og.code) === g.code);
            return matchOld && g.masked ? { ...g, code: matchOld.code, masked: false } : g;
          });
        }
      }

      // 7. SERVER-SIDE ORDER PROTECTION (Existing orders cannot be deleted; refunds require permission)
      if (!force && Array.isArray(existingState.orders)) {
        const incOrders = Array.isArray(incoming.orders) ? incoming.orders : [];
        const incById = new Map(incOrders.map(o => [o.id, o]));
        const preserved = existingState.orders.map(oldO => {
          const incO = incById.get(oldO.id);
          if (!incO || !canRefund) return oldO;
          return incO;
        });
        const existingIds = new Set(existingState.orders.map(o => o.id));
        const added = incOrders.filter(o => o && o.id && !existingIds.has(o.id));
        nextState.orders = [...added, ...preserved];
      }

      // 8. SERVER-SIDE MONOTONIC INVOICE NUMBERING (Fixes duplicate invoices on Cashier tills!)
      if (nextState.settings && typeof nextState.settings === 'object') {
        const allOrders = Array.isArray(nextState.orders) ? nextState.orders : [];
        const maxInv = allOrders.reduce((mx, o) => Math.max(mx, extractInvNum(o.inv)), 1000);
        const curNext = Number(nextState.settings.nextInv) || 1001;
        const incNext = Number(incoming.settings && incoming.settings.nextInv) || 0;
        nextState.settings.nextInv = Math.max(curNext, maxInv + 1, isOwner ? incNext : 0);
        delete nextState.settings.managerPin;
      }

      // 9. EMPLOYEE CREDENTIALS: SCRYPT HASHING + UNIQUE PIN & UNIQUE EMAIL ENFORCEMENT
      if (Array.isArray(nextState.employees)) {
        const prevEmps = Array.isArray(existingState.employees) ? existingState.employees : [];
        const normalized = [];

        for (const emp of nextState.employees) {
          const prev = prevEmps.find(x => x.id === emp.id || (x.email && emp.email && x.email.toLowerCase() === emp.email.toLowerCase()));
          const rawNewPin = (emp.newPin && /^\d{4}$/.test(String(emp.newPin).trim())) ? String(emp.newPin).trim() : null;
          // If a new PIN is being assigned, verify it does not collide with ANY other active employee's pinHash
          if (rawNewPin) {
            const clash = prevEmps.find(other => other.id !== emp.id && other.active !== false && verifySecret(rawNewPin, other.pinHash));
            if (clash) {
              return res.status(400).json({ ok: false, error: 'That 4-digit POS PIN is already assigned to another staff member. Choose a unique PIN.' });
            }
          }
          normalized.push(normalizeEmployeeCreds(emp, prev, secret));
        }

        // Enforce uniqueness across all active employees for both email and pinFp
        const seenEmails = new Set();
        const seenPinFps = new Set();
        for (const e of normalized) {
          if (e.active === false) continue;
          const emKey = String(e.email || '').trim().toLowerCase();
          if (emKey) {
            if (seenEmails.has(emKey)) {
              return res.status(400).json({ ok: false, error: `Duplicate email address (${e.email}) is not allowed.` });
            }
            seenEmails.add(emKey);
          }
          if (e.pinFp) {
            if (seenPinFps.has(e.pinFp)) {
              return res.status(400).json({ ok: false, error: 'Two active staff members cannot share the same 4-digit POS PIN.' });
            }
            seenPinFps.add(e.pinFp);
          }
        }
        nextState.employees = normalized;
      }

      // 10. ATOMIC COMPARE-AND-SWAP WRITE TO MONGODB
      const nextRev = serverRev + 1;
      const saved = await saveWorkspaceDocAtomic(col, nextState, serverRev, nextRev, force);
      if (!saved) {
        const latest = await loadWorkspaceDoc();
        const latestRev = (latest.doc && latest.doc.rev) || nextRev;
        return res.status(409).json({
          ok: false,
          conflict: true,
          rev: latestRev,
          state: sanitizeStateForClient(latest.doc && latest.doc.state, session.role),
          error: 'Concurrent update detected. Merging and retrying.'
        });
      }

      return res.status(200).json({
        ok: true,
        mongo: !!col,
        rev: nextRev,
        nextInv: nextState.settings ? nextState.settings.nextInv : undefined
      });
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
