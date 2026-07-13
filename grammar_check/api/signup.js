const { connect } = require('./connect');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  try {
    await connect();
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const normalized = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalized });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const u = new User({ email: normalized, password });
    await u.save();
    return res.status(201).json({ message: 'User created' });
  } catch (err) {
    console.error('signup error', err);
    return res.status(500).json({ message: err.message });
  }
};
