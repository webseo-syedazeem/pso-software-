// Vercel Serverless Function + MongoDB Persistence Handler (/api/state)
let cachedClient = null;
let memoryState = null;

async function getMongoCollection() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  const { MongoClient } = require('mongodb');
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }
  const dbName = process.env.MONGODB_DB || 'monarch_pos';
  return cachedClient.db(dbName).collection('workspace_state');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const col = await getMongoCollection();
    if (req.method === 'GET') {
      if (col) {
        const doc = await col.findOne({ _id: 'monarch_main' });
        return res.status(200).json({ ok: true, mongo: true, state: doc ? doc.state : null });
      }
      return res.status(200).json({ ok: true, mongo: false, state: memoryState });
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (col) {
        await col.updateOne(
          { _id: 'monarch_main' },
          { $set: { state: body, updatedAt: new Date() } },
          { upsert: true }
        );
        return res.status(200).json({ ok: true, mongo: true });
      }
      memoryState = body;
      return res.status(200).json({ ok: true, mongo: false });
    }
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
