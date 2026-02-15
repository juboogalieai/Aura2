const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());

// 1. Serve static files from the current directory
app.use(express.static(__dirname));

// 2. Aura Chat Endpoint
app.post('/aura-chat', (req, res) => {
    const { message } = req.body;
    // Simple response logic for the Aura Engine
    res.json({ reply: `Aura received: ${message}. Systems standing by.` });
});

// 3. Robust Root Route
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    
    // Check if the file exists before trying to send it to prevent ENOENT crash
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error("Missing index.html! Use the UI code provided to create it.");
            res.status(404).send(`
                <div style="font-family:sans-serif; padding:40px; text-align:center;">
                    <h1>Server is LIVE 🚀</h1>
                    <p>But <b>index.html</b> is missing from your GitHub repo.</p>
                    <p>Paste your UI code into a new file named <code>index.html</code> to finish the setup.</p>
                </div>
            `);
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
