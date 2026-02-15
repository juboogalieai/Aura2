const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// 1. Setup - Allows your students' app to talk to this server
app.use(cors());
app.use(express.json());

// 2. Initialize Gemini AI
// Note: You must set GEMINI_API_KEY in Render's "Environment Variables" settings
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// 3. Aura's School Persona
const SYSTEM_PROMPT = "You are Aura, a friendly AI for students. Keep answers simple, helpful, and school-safe.";

// 4. The main chat route
app.post('/aura-chat', async (req, res) => {
    const { message } = req.body;

    if (!message) return res.status(400).json({ error: "Empty message" });

    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: SYSTEM_PROMPT 
        });

        const result = await model.generateContent(message);
        res.json({ reply: result.response.text() });
    } catch (error) {
        console.error("Aura Error:", error);
        res.status(500).json({ error: "Aura is resting. Try again soon!" });
    }
});

// 5. Health check for Render
app.get('/', (req, res) => res.send("Aura is Online!"));

// 6. Port binding for Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on port ${PORT}`);
});
