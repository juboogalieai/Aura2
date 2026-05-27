nst express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

// Serve the frontend files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// --- IN-MEMORY DATABASE ---
// No Firebase needed. Sessions are managed directly on the server!
let sessions = [
    {
        id: "default-session",
        task: "Explore my new Aura Engine",
        why: "To break executive paralysis",
        messages: [
            { role: 'bot', text: "Welcome to your new **Aura Engine**. All systems are online. What are we focusing on right now?" }
        ],
        minutes: 0,
        updatedAt: new Date()
    }
];

// Get all active sessions
app.get('/api/sessions', (req, res) => {
    // Sort by latest update
    const sorted = [...sessions].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json(sorted);
});

// Create a new session
app.post('/api/sessions', (req, res) => {
    const newSession = {
        id: 'session-' + Date.now(),
        task: "",
        why: "",
        messages: [],
        minutes: 0,
        updatedAt: new Date()
    };
    sessions.push(newSession);
    res.json(newSession);
});

// Update an existing session's metadata (task, why, minutes)
app.put('/api/sessions/:id', (req, res) => {
    const { id } = req.params;
    const { task, why, minutes } = req.body;
    
    const session = sessions.find(s => s.id === id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    if (task !== undefined) session.task = task;
    if (why !== undefined) session.why = why;
    if (minutes !== undefined) session.minutes = minutes;
    session.updatedAt = new Date();

    res.json(session);
});

// Post a chat message and run the Gemini AI model
app.post('/api/sessions/:id/chat', async (req, res) => {
    const { id } = req.params;
    const { message } = req.body;

    const session = sessions.find(s => s.id === id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            systemInstruction: `You are Aura, an elite focus coach for someone with ADHD. 
            Keep responses extremely short (2-3 sentences max) to bypass executive fatigue.
            Focus on identifying starting friction, suggest a physical action in **bold** that takes under 60 seconds, and match their "Why" directly.`
        });

        const prompt = `
            [FOCUS SESSION]
            Task: ${session.task || 'Not defined yet'}
            Motivation: ${session.why || 'Not specified'}
            
            [USER MESSAGE]
            ${message}
        `;

        // Save user message to history
        session.messages.push({ role: 'user', text: message });

        const result = await model.generateContent(prompt);
        const botText = result.response.text();

        // Save bot response to history
        session.messages.push({ role: 'bot', text: botText });
        session.updatedAt = new Date();

        res.json({ reply: botText, session });

    } catch (error) {
        console.error('Aura Core Error:', error);
        res.status(500).json({ error: 'AI processing failed' });
    }
});

// Serve frontend dashboard on root access
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Aura Database-Free Server active on port ${port}`);
});
