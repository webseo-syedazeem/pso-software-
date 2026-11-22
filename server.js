const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/state') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    // If MONGODB_URI is configured, delegate to the Vercel handler
    if (process.env.MONGODB_URI) {
      let raw = '';
      req.on('data', c => (raw += c));
      req.on('end', async () => {
        req.body = raw ? JSON.parse(raw) : {};
        const handler = require('./api/state.js');
        const wrapRes = {
          setHeader: (k, v) => res.setHeader(k, v),
          status: code => ({
            json: obj => { res.statusCode = code; res.end(JSON.stringify(obj)); },
            end: () => { res.statusCode = code; res.end(); }
          })
        };
        await handler(req, wrapRes);
      });
      return;
    }

    // Local disk persistence fallback (data/state.json)
    if (req.method === 'GET') {
      const state = fs.existsSync(STATE_FILE)
        ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
        : null;
      res.end(JSON.stringify({ ok: true, mongo: false, state }));
      return;
    }
    if (req.method === 'POST') {
      let raw = '';
      req.on('data', chunk => (raw += chunk));
      req.on('end', () => {
        try {
          fs.writeFileSync(STATE_FILE, raw, 'utf8');
          res.end(JSON.stringify({ ok: true, mongo: false }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      });
      return;
    }
  }

  let filePath = path.join(__dirname, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(__dirname, 'index.html');
  }
  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Monarch Retail OS running at http://localhost:${PORT}`);
});
