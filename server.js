const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Static Files: This ensures files in your root (like index.html) are accessible
app.use(express.static(path.join(__dirname)));

// 2. Initialize Gemini AI
// Ensure you have "Aura_API_KEY" set in your Render Environment Variables
const genAI = new GoogleGenerativeAI(process.env.Aura_API_KEY || "");
const SYSTEM_PROMPT = "You are Aura, a friendly ADHD Focus Assistant. Use bullet points and keep it concise.";

// 3. Aura Chat Endpoint
app.post('/aura-chat', async (req, res) => {
    const { message, apiKey } = req.body;

    // Security check for your custom UI key
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
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "Aura's brain is fuzzy right now. Check API config." });
    }
});

// 4. THE FIX: Proper Home Route
// This explicitly sends index.html when someone visits your URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(port, "0.0.0.0", () => {
    console.log(`Aura Server is officially live on port ${port}`);
});
