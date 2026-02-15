const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from the current directory
app.use(express.static(__dirname));

// Aura's Persona
const SYSTEM_PROMPT = "You are Aura, a friendly ADHD Focus Assistant. Use bullet points and keep it concise.";
const genAI = new GoogleGenerativeAI(process.env.Aura_API_KEY || "");

// Chat Endpoint
app.post('/aura-chat', async (req, res) => {
    const { message, apiKey } = req.body;
    if (apiKey !== "Auraapi") {
        return res.status(403).json({ error: "Invalid Key" });
    }
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_PROMPT 
        });
        const result = await model.generateContent(message);
        res.json({ reply: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: "Aura is resting." });
    }
});

// The FIX: Use path.resolve to ensure Render finds the file
app.get('/'index.html'));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
