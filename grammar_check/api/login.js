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
    const user = await User.findOne({ email: normalized, password });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    return res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ message: err.message });
  }
};
