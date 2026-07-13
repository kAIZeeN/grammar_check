const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.warn('MONGO_URI not set in environment');
}

let cached = global._mongo;
if (!cached) cached = global._mongo = { conn: null, promise: null };

async function connect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
      .then((m) => {
        return m;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connect };
