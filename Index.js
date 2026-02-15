/**
 * AURA FOCUS ENGINE - Node.js Production Server
 * Designed for deployment on Render/GitHub/Heroku
 * Handles API logic server-side for security.
 */

const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // Ensure 'node-fetch' is in your package.json
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Configuration - Use Environment Variables for production
const CONFIG = {
    USER_ID: "17040095986901884715",
    GEMINI_KEY: process.env.GEMINI_KEY || "", 
    AURA_API_KEY: process.env.AURA_API_KEY || "Aura_API_KEY",
    AURA_ENDPOINT: "https://auraapi.com/v1",
    MODEL: "gemini-2.5-flash-preview-09-2025"
};

// Route: Aura Intelligence (Proxy to protect API Key)
app.post('/api/aura-intel', async (req, res) => {
    const { task } = req.body;
    try {
        const response = await fetch(`${CONFIG.AURA_ENDPOINT}/analysis`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${CONFIG.AURA_API_KEY}` 
            },
            body: JSON.stringify({ task, userId: CONFIG.USER_ID })
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Aura API unreachable", fallback: "Execute immediate micro-task." });
    }
});

// Route: Gemini Chat (Proxy to protect Gemini Key)
app.post('/api/chat', async (req, res) => {
    const { messages, task } = req.body;
    const systemPrompt = `Aura ADHD Focus Coach. User UID: ${CONFIG.USER_ID}. Task: ${task}. Rules: 1. Bullets. 2. Concise. 3. 2-min win suggestions.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.MODEL}:generateContent?key=${CONFIG.GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: messages.map(m => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.text }]
                })),
                systemInstruction: { parts: [{ text: systemPrompt }] }
            })
        });
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "AI service offline." });
    }
});

// Serve Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Aura Engine running on port ${PORT}`);
});
