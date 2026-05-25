const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
// Render automatically provides a PORT environment variable (usually 10000)
const port = process.env.PORT || 3000;

/**
 * Aura Focus Engine - Project Configuration
 * Project Identity: projects/532507346921
 * Project Number: 532507346921
 */

// Initialize the Gemini API client using the environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Enable CORS so your frontend can communicate with this backend
app.use(cors());
app.use(express.json());

// 1. Serve static files (like index.html, images, CSS) directly from the root directory
app.use(express.static(__dirname));

// 2. Serve index.html if it exists in the repo, otherwise fall back to the status message
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'), (err) => {
        if (err) {
            // Graceful fallback if index.html is missing from the server
            res.send('Aura Focus Engine [532507346921] is active.');
        }
    });
});

// The main chat endpoint called by index.html (POST to /aura-chat)
app.post('/aura-chat', async (req, res) => {
    try {
        const { message, context } = req.body;

        // Model settings optimized for ADHD cognitive assistance
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            systemInstruction: `You are Aura, a focus engine for someone with ADHD. 
            Project Context: projects/532507346921.
            
            Strict Behavioral Protocol:
            1. Keep responses extremely brief (max 2-3 sentences) to prevent cognitive overload.
            2. Identify the 'Starting Friction'.
            3. Use bold text for the very first physical action required (e.g., **open the tab**, **pick up the pen**).
            4. Suggest a single "micro-step" that takes less than 60 seconds to complete.
            5. Provide dopamine-positive, direct, and non-judgmental reinforcement matching their "Why".`
        });

        // Construct the context-aware prompt
        const prompt = `
            [SESSION CONTEXT]
            Current Task: ${context?.task || 'Not specified'}
            Motivation (Why): ${context?.why || 'Not specified'}
            
            [USER INPUT]
            ${message}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Send the generated reply back to the frontend
        res.json({ reply: text });

    } catch (error) {
        console.error('Aura Core Error:', error);
        res.status(500).json({ 
            error: 'Connection to Aura core failed.',
            details: error.message 
        });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Aura Server running on port ${port} for Project 532507346921`);
});
