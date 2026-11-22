// Vercel Serverless Function + MongoDB Atlas Persistence Handler (/api/state)
const { MongoClient } = require('mongodb');

let cachedClient = null;
let memoryState = null;

function getMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  const u = process.env.MONGODB_USERNAME || 'webseocompk1_db_user';
  const p = process.env.MONGODB_PASSWORD || 'L6EMkMXI3taQFcMd';
  const h = process.env.MONGODB_HOST || 'cluster0.mmakobx.mongodb.net';
  return `mongodb+srv://${u}:${p}@${h}`;
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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const col = await getMongoCollection();
    if (req.method === 'GET') {
      if (col) {
        const doc = await col.findOne({ _id: 'monarch_live' });
        return res.status(200).json({ ok: true, mongo: true, state: doc ? doc.state : null });
      }
      return res.status(200).json({ ok: true, mongo: false, state: memoryState });
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (col) {
        await col.updateOne(
          { _id: 'monarch_live' },
          { $set: { state: body, updatedAt: new Date() } },
          { upsert: true }
        );
        return res.status(200).json({ ok: true, mongo: true });
      }
      memoryState = body;
      return res.status(200).json({ ok: true, mongo: false });
    }
    if (req.method === 'DELETE') {
      if (col) {
        await col.deleteOne({ _id: 'monarch_live' });
      }
      memoryState = null;
      return res.status(200).json({ ok: true, mongo: !!col });
    }
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
