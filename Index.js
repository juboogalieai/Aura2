/**
 * AURA FOCUS ENGINE - PURE JAVASCRIPT
 * ADHD Executive Function Support
 * User ID: 17040095986901884715
 */

(function() {
    // --- Configuration ---
    const CONFIG = {
        USER_ID: "17040095986901884715",
        GEMINI_KEY: "", // Environment provides key
        AURA_API_KEY: "Aura_API_KEY",
        AURA_ENDPOINT: "https://auraapi.com/v1",
        STORAGE_KEY: "aura_js_v7"
    };

    const State = {
        sessions: [],
        activeId: null,
        isThinking: false,

        init() {
            const saved = localStorage.getItem(`${CONFIG.STORAGE_KEY}_${CONFIG.USER_ID}`);
            if (saved) {
                try {
                    this.sessions = JSON.parse(saved);
                    this.activeId = this.sessions[0]?.id || this.createNewSession().id;
                } catch (e) { this.createNewSession(); }
            } else {
                this.createNewSession();
            }
        },

        save() {
            localStorage.setItem(`${CONFIG.STORAGE_KEY}_${CONFIG.USER_ID}`, JSON.stringify(this.sessions));
        },

        createNewSession() {
            const id = Date.now().toString();
            const session = {
                id,
                task: "",
                messages: [],
                minutes: 0
            };
            this.sessions.unshift(session);
            this.activeId = id;
            this.save();
            return session;
        },

        getActive() {
            return this.sessions.find(s => s.id === this.activeId);
        }
    };

    // --- Dynamic CSS Injection ---
    const injectStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=JetBrains+Mono&display=swap');
            :root { --bg: #030407; --panel: #0d1117; --accent: #818cf8; --text: #f1f5f9; --border: rgba(255,255,255,0.08); }
            body, html { margin: 0; padding: 0; height: 100%; width: 100%; background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; overflow: hidden; }
            .aura-root { display: flex; height: 100vh; width: 100vw; }
            .aura-sidebar { width: 260px; background: var(--panel); border-right: 1px solid var(--border); display: flex; flex-direction: column; }
            .aura-main { flex: 1; display: flex; flex-direction: column; position: relative; min-width: 0; }
            .aura-header { height: 60px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 20px; justify-content: space-between; }
            .aura-chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
            .aura-input-area { padding: 20px; border-top: 1px solid var(--border); }
            .aura-wrapper { max-width: 800px; margin: 0 auto; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; padding: 4px; display: flex; }
            .aura-field { background: transparent; border: none; color: white; flex: 1; padding: 10px; outline: none; font-size: 14px; }
            .aura-msg { max-width: 85%; padding: 12px 16px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
            .msg-user { align-self: flex-end; background: #fff; color: #000; }
            .msg-bot { align-self: flex-start; background: var(--panel); border: 1px solid var(--border); }
            .aura-btn { background: var(--accent); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 11px; font-weight: 600; text-transform: uppercase; }
            .session-tab { padding: 12px 20px; font-size: 13px; cursor: pointer; opacity: 0.5; transition: 0.2s; }
            .session-tab.active { opacity: 1; color: var(--accent); background: rgba(129,140,248,0.05); }
            .mono { font-family: 'JetBrains Mono', monospace; font-size: 10px; opacity: 0.4; }
        `;
        document.head.appendChild(style);
    };

    // --- Build UI Components ---
    const build = () => {
        const active = State.getActive();
        const root = document.getElementById('aura-app') || document.createElement('div');
        root.id = 'aura-app';
        root.className = 'aura-root';
        root.innerHTML = `
            <div class="aura-sidebar">
                <div style="padding: 20px; border-bottom: 1px solid var(--border)">
                    <div style="font-weight:600; font-size:16px;">Aura Engine</div>
                    <div class="mono">UID: ${CONFIG.USER_ID}</div>
                    <button id="new-btn" class="aura-btn" style="width:100%; margin-top:16px;">+ New Focus</button>
                </div>
                <div id="side-list" style="flex:1; overflow-y:auto"></div>
            </div>
            <div class="aura-main">
                <div class="aura-header">
                    <input id="task-name" type="text" placeholder="Current Task..." value="${active.task}" style="background:transparent; border:none; color:white; font-weight:600; outline:none; width:50%;">
                    <div style="display:flex; gap:10px; align-items:center;">
                        <button id="aura-intel" class="aura-btn" style="background:transparent; border:1px solid var(--accent); color:var(--accent)">Aura Intel</button>
                        <div class="mono" id="timer">${active.minutes}M</div>
                    </div>
                </div>
                <div class="aura-chat" id="chat-box">
                    <div id="intel-zone"></div>
                    <div id="msg-anchor" style="display:flex; flex-direction:column; gap:16px;"></div>
                </div>
                <div class="aura-input-area">
                    <div class="aura-wrapper">
                        <input id="chat-in" class="aura-field" placeholder="Break this down...">
                        <button id="send-btn" class="aura-btn">Send</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(root);
        attach();
        update();
    };

    const update = () => {
        const side = document.getElementById('side-list');
        side.innerHTML = State.sessions.map(s => `
            <div class="session-tab ${s.id === State.activeId ? 'active' : ''}" data-id="${s.id}">
                ${s.task || "New Session"}
            </div>
        `).join('');

        const anchor = document.getElementById('msg-anchor');
        const active = State.getActive();
        anchor.innerHTML = active.messages.map(m => `
            <div class="aura-msg ${m.role === 'user' ? 'msg-user' : 'msg-bot'}">${m.text.replace(/\n/g, '<br>')}</div>
        `).join('');
        const chat = document.getElementById('chat-box');
        chat.scrollTop = chat.scrollHeight;
    };

    // --- Interaction Logic ---
    const attach = () => {
        document.getElementById('new-btn').onclick = () => { State.createNewSession(); build(); };
        document.getElementById('task-name').onchange = (e) => {
            const active = State.getActive();
            active.task = e.target.value;
            State.save();
            update();
        };
        document.querySelectorAll('.session-tab').forEach(el => {
            el.onclick = () => { State.activeId = el.dataset.id; build(); };
        });
        document.getElementById('send-btn').onclick = () => handleChat();
        document.getElementById('chat-in').onkeydown = (e) => { if (e.key === 'Enter') handleChat(); };
        document.getElementById('aura-intel').onclick = () => handleIntel();
    };

    const handleIntel = async () => {
        const active = State.getActive();
        if (!active.task) return;
        const zone = document.getElementById('intel-zone');
        zone.innerHTML = `<div class="mono" style="padding:10px;">ANALYZING...</div>`;

        try {
            const res = await fetch(`${CONFIG.AURA_ENDPOINT}/analysis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CONFIG.AURA_API_KEY}` },
                body: JSON.stringify({ task: active.task, userId: CONFIG.USER_ID })
            });
            const data = await res.json();
            zone.innerHTML = `<div style="padding:15px; border:1px solid var(--accent); border-radius:8px; margin-bottom:16px;">${data.analysis || "Micro-task identified: Break inertia now."}</div>`;
        } catch (e) {
            zone.innerHTML = `<div class="mono" style="padding:10px;">AURA INTELLIGENCE READY.</div>`;
        }
    };

    const handleChat = async () => {
        const input = document.getElementById('chat-in');
        const text = input.value.trim();
        if (!text || State.isThinking) return;

        const active = State.getActive();
        active.messages.push({ role: 'user', text });
        input.value = '';
        update();

        State.isThinking = true;
        const btn = document.getElementById('send-btn');
        btn.innerText = '...';

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${CONFIG.GEMINI_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: active.messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
                    systemInstruction: { parts: [{ text: `Aura Focus Coach. User UID: ${CONFIG.USER_ID}. ADHD Rules: 1. Use bullets. 2. Be concise. 3. Suggest a 2-minute win.` }] }
                })
            });
            const data = await response.json();
            active.messages.push({ role: 'bot', text: data.candidates?.[0]?.content?.parts?.[0]?.text || "Refocusing error." });
            State.save();
            update();
        } catch (e) {
            active.messages.push({ role: 'bot', text: "Signal lost." });
            update();
        } finally {
            State.isThinking = false;
            btn.innerText = 'Send';
        }
    };

    // --- Initialize ---
    window.onload = () => {
        State.init();
        injectStyles();
        build();
        setInterval(() => {
            const active = State.getActive();
            if (active) {
                active.minutes++;
                State.save();
                const timer = document.getElementById('timer');
                if (timer) timer.innerText = `${active.minutes}M`;
            }
        }, 60000);
    };
})();
