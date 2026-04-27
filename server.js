const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
// Render sets the PORT automatically; default to 3000 for local testing
const port = process.env.PORT || 3000;

/**
 * Aura Focus Engine Configuration
 * Project Identity: projects/532507346921
 * Project Number: 532507346921
 */

// SECURE: Pulls your API Key from Render's Environment Variables
// (Key: AIzaSyBuUkTCe7yNlmB246_-bioVp4Hanxy5fcM)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

// Basic health check to confirm server is active
app.get('/', (req, res) => {
    res.send('Aura Focus Engine [532507346921] is active.');
});

// The main link between your index.html and Gemini
app.post('/aura-chat', async (req, res) => {
    try {
        const { message, context } = req.body;

        // Model settings specifically tuned for ADHD focus support
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            systemInstruction: `You are Aura, an ADHD Focus Engine. 
            Project Context: projects/532507346921.
            
            ADHD Support Protocol:
            1. Keep responses under 3 sentences to prevent overwhelm.
            2. Suggest one "micro-step" (a task taking < 1 minute).
            3. Use bold text for the immediate physical action required.
            4. Mirror the user's "Why" to provide emotional motivation.
            5. Be high-energy but non-judgmental.`
        });

        // Prompt that includes the user's current goal context
        const prompt = `
            [SESSION CONTEXT]
            Current Goal: ${context.task || 'Undetermined'}
            Purpose (Why): ${context.why || 'Undetermined'}
            
            [USER MESSAGE]
            ${message}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });

    } catch (error) {
        console.error('Aura Server Error:', error);
        res.status(500).json({ 
            error: 'Connection to Aura core failed.',
            details: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Aura Server running on port ${port} for Project 532507346921`);
});
