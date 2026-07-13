const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
let requestCount = 0;
const MAX_REQUESTS = 999999; // Basically no limit
dotenv.config({ path: path.join(__dirname, 'api.env') });
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const grok = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
  console.error('MONGO_URI is not set. Set it in your environment or in backend/api.env');
}

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  console.log('Signup request received for:', email);

  try {
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ email: normalizedEmail, password });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body || {};

  console.log('Login attempt for:', email);

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail, password });

    if (!user) {
      console.log('Login failed for:', normalizedEmail);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful for:', normalizedEmail);
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

app.post('/grammar-check', async (req, res) => {
  if (requestCount >= MAX_REQUESTS) {
    return res.status(429).json({ message: 'Daily limit reached.' });
  }

  requestCount++;

  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ message: 'Missing input text.' });
  }

  if (text.length > 2000) {
    return res.status(400).json({ message: 'Text must be 1-2000 characters' });
  }

  const prompt = `
You are an English grammar checker.

Analyze the following text.

Return ONLY valid JSON in this exact format:

{
  "score": 0,
  "correctedText": "",
  "mistakes": [
  {
    "original": "",
    "correct": "",
    "reason": ""
  }
  ]
}

Score the grammar from 0 to 100.

Text:\n${text}
`;

  try {
    console.log('Sending to Gemini:', { model: 'gemini-2.5-flash', apiKey: process.env.GEMINI_API_KEY ? 'exists' : 'MISSING' });
    const geminiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let geminiText = geminiResponse?.text ?? geminiResponse?.output ?? JSON.stringify(geminiResponse);
    
    // Remove markdown code blocks if present
    geminiText = geminiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    return res.json({ output: geminiText });
  } catch (err) {
    console.error('Gemini failed - DETAILS:', {
      message: err?.message,
      status: err?.status,
      code: err?.code,
      full: JSON.stringify(err)
    });

    try {
      const grokResponse = await grok.chat.completions.create({
        model: 'grok-beta',
        messages: [
          { role: 'user', content: prompt }
        ]
      });

      let grokText = grokResponse?.choices?.[0]?.message?.content ?? JSON.stringify(grokResponse);
      
      // Remove markdown code blocks if present
      grokText = grokText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return res.json({ output: grokText });
    } catch (grokErr) {
      console.error('Grok fallback failed:', grokErr?.message ?? grokErr);
      return res.status(500).json({ message: 'AI services unavailable' });
    }
  }
});



app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
