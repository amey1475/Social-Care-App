// Minimal Express proxy for Generative Language API
// Reads API key from process.env.GOOGLE_API_KEY and forwards requests from /api/generate
// Load environment variables from .env (if present)
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PROXY_PORT || 3001;

app.use(bodyParser.json());
app.use(cors());
// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Serve static files (so visiting / will serve index.html from project root)
app.use(express.static(path.join(__dirname)));

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).send('Missing prompt');

  const apiKey = process.env.GOOGLE_API_KEY || 'AIzaSyC_gmTugk-OcAxTUBb0SnHw8YOlAQryB48'; // Temporary fallback

  // Try a couple of model names / endpoint variants if one returns 404
  const modelCandidates = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest'
  ];
for (const model of modelCandidates) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
        const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // Ensure this structure is EXACT
                system_instruction: {
                    parts: [
                        { text: "You are a professional therapist. You are expert in helping elderly people with their mental health and emotional well-being.Keep your responses concise and supportive. Suggest them activities and remedies. Give responses which can be suitable for text to speech." }
                    ]
                },
                contents: [
                    {
                        role: "user", // Adding the role explicitly helps the REST API
                        parts: [{ text: prompt }]
                    }
                ]
            })
        });

        const respText = await r.text();
        console.log(`Model ${model} status: ${r.status}`);

        if (r.status === 404) continue; // Try next model if this one isn't found

        if (!r.ok) {
            console.error(`API Error: ${respText}`);
            return res.status(r.status).json({ error: "API Error", details: respText });
        }

        const data = JSON.parse(respText);
        if (data.candidates && data.candidates[0].content) {
            const text = data.candidates[0].content.parts[0].text;
            return res.json({ text, modelUsed: model });
        }
    } catch (err) {
        console.error('Fetch error:', err);
    }
}
  // If we exhausted modelCandidates
  res.status(404).json({ error: 'Model not found on Google Generative Language API.' });
});

// Simple status endpoint to help debugging (does not return your API key)
app.get('/status', (req, res) => {
  console.log('Environment check:');
  console.log('GOOGLE_API_KEY exists:', !!process.env.GOOGLE_API_KEY);
  console.log('GOOGLE_API_KEY length:', process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.length : 0);
  console.log('CWD:', process.cwd());
  res.json({
    ok: true,
    hasApiKey: !!process.env.GOOGLE_API_KEY,
    port: PORT,
    cwd: process.cwd(),
    modelCandidates: [
      'gemini-2.5-flash',
      'gemini-2.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest'
    ]
  });
});

app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));