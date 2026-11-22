const http = require('http');
const fs = require('fs');
const path = require('path');

// Load .env if present (local development only)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  });
}

const PORT = process.env.PORT || 3000;
const ROOT_DIR = path.resolve(__dirname);
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const stateHandler = require('./api/state.js');
const authHandler = require('./api/auth.js');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const BLOCKED_PREFIXES = ['/.env', '/.git', '/api/', '/server.js', '/package.json', '/package-lock.json', '/vercel.json', '/node_modules/'];

function runApiHandler(handler, req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  let raw = '';
  let aborted = false;
  req.on('data', chunk => {
    raw += chunk;
    if (raw.length > MAX_BODY_BYTES && !aborted) {
      aborted = true;
      res.statusCode = 413;
      res.end(JSON.stringify({ ok: false, error: 'Payload too large' }));
      req.destroy();
    }
  });
  req.on('end', async () => {
    if (aborted) return;
    try {
      req.body = raw ? JSON.parse(raw) : {};
    } catch {
      req.body = {};
    }
    const wrapRes = {
      setHeader: (k, v) => res.setHeader(k, v),
      status: code => ({
        json: obj => { res.statusCode = code; res.end(JSON.stringify(obj)); },
        end: () => { res.statusCode = code; res.end(); }
      })
    };
    await handler(req, wrapRes);
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/api/state') return runApiHandler(stateHandler, req, res);
  if (pathname === '/api/auth') return runApiHandler(authHandler, req, res);

  if (BLOCKED_PREFIXES.some(p => pathname === p || pathname.startsWith(p))) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }

  const target = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  let filePath = path.resolve(ROOT_DIR, target);
  if (filePath !== ROOT_DIR && !filePath.startsWith(ROOT_DIR + path.sep)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(ROOT_DIR, 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Monarch Retail OS (Hardened Server) running at http://localhost:${PORT}`);
});
