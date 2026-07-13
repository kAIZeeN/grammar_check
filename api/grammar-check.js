const { connect } = require('./connect');
const { GoogleGenAI } = require('@google/genai');
const OpenAI = require('openai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const grok = new OpenAI({ apiKey: process.env.GROK_API_KEY, baseURL: 'https://api.x.ai/v1' });

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  try {
    await connect();

    const { text } = req.body || {};
    if (!text || typeof text !== 'string') return res.status(400).json({ message: 'Missing input text.' });
    if (text.length > 2000) return res.status(400).json({ message: 'Text must be 1-2000 characters' });

    const prompt = `You are an English grammar checker.\n\nAnalyze the following text.\n\nReturn ONLY valid JSON in this exact format:\n\n{\n  "score": 0,\n  "correctedText": "",\n  "mistakes": [\n  {\n    "original": "",\n    "correct": "",\n    "reason": ""\n  }\n  ]\n}\n\nScore the grammar from 0 to 100.\n\nText:\n${text}`;

    try {
      const geminiResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      let geminiText = geminiResponse?.text ?? geminiResponse?.output ?? JSON.stringify(geminiResponse);
      geminiText = geminiText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return res.json({ output: geminiText });
    } catch (err) {
      console.error('Gemini failed:', err?.message ?? err);
      try {
        const grokResponse = await grok.chat.completions.create({ model: 'grok-beta', messages: [{ role: 'user', content: prompt }] });
        let grokText = grokResponse?.choices?.[0]?.message?.content ?? JSON.stringify(grokResponse);
        grokText = grokText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return res.json({ output: grokText });
      } catch (grokErr) {
        console.error('Grok fallback failed:', grokErr?.message ?? grokErr);
        return res.status(500).json({ message: 'AI services unavailable' });
      }
    }
  } catch (e) {
    console.error('grammar-check error', e);
    return res.status(500).json({ message: e.message });
  }
};
