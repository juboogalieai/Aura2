const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// This serves everything in your main folder (including index.html)
app.use(express.static(path.join(__dirname)));

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.Aura_API_KEY || "");
const SYSTEM_PROMPT = "You are Aura, a friendly ADHD Focus Assistant. Use bullet points and keep it concise.";

// Aura Chat API
app.post('/aura-chat', async (req, res) => {
    const { message, apiKey } = req.body;
    if (apiKey !== "Auraapi") return res.status(403).json({ error: "Invalid Key" });

    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_PROMPT 
        });
        const result = await model.generateContent(message);
        res.json({ reply: result.response.text() });
    } catch (error) {
        res.status(500).json({ error: "Aura is resting. Check your API Key in Render environment variables." });
    }
});

// Serve index.html as the main page
app.get('*', (req, res) => {
    res.sendFile(path.join(main, 'index.html'));
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Aura Server running on port ${port}`);
});
