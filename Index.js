/**
 * AURA JAVASCRIPT ENGINE 
 * Logic-first architecture for the ADHD Focus Engine.
 */

const Aura = {
    // 1. STATE MANAGEMENT
    state: {
        sessions: JSON.parse(localStorage.getItem('aura_data')) || [],
        activeId: null,
        isThinking: false,
        uid: "17040095986901884715"
    },

    // 2. INITIALIZATION
    init() {
        if (this.state.sessions.length === 0) {
            this.createSession("New Deep Work");
        } else {
            this.state.activeId = this.state.sessions[0].id;
        }
        this.render();
        this.startPulse();
    },

    // 3. CORE ACTIONS
    save() {
        localStorage.setItem('aura_data', JSON.stringify(this.state.sessions));
    },

    createSession(title) {
        const id = Date.now().toString();
        const session = {
            id,
            title: title || "New Session",
            goal: "",
            minutes: 0,
            history: [{ role: 'aura', text: "Systems online. What are we focusing on right now?" }]
        };
        this.state.sessions.unshift(session);
        this.state.activeId = id;
        this.save();
        this.render();
    },

    async sendMessage() {
        const input = document.getElementById('aura-input');
        if (!input) return;

        const text = input.value.trim();
        if (!text || this.state.isThinking) return;

        const session = this.state.sessions.find(s => s.id === this.state.activeId);
        if (!session) return;

        // Push user message
        session.history.push({ role: 'user', text });
        
        input.value = '';
        this.state.isThinking = true;
        this.renderChat();

        try {
            // NOTE: Replace '/aura-chat' with your actual endpoint
            const response = await fetch('/aura-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, apiKey: "Auraapi" })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            session.history.push({ role: 'aura', text: data.reply || "Connection lost." });
        } catch (e) {
            session.history.push({ 
                role: 'aura', 
                text: "Error connecting to server. Ensure your backend is running at /aura-chat." 
            });
        } finally {
            this.state.isThinking = false;
            this.save();
            this.renderChat();
        }
    },

    // 4. UI COMPONENTS
    render() {
        const app = document.getElementById('aura-app');
        const activeSession = this.state.sessions.find(s => s.id === this.state.activeId);
        if (!app || !activeSession) return;

        app.innerHTML = `
            <div style="width: 280px; background: var(--sidebar); border-right: 1px solid var(--border); display: flex; flex-direction: column;">
                <div style="padding: 24px; border-bottom: 1px solid var(--border)">
                    <h2 style="margin: 0; color: var(--accent); font-size: 1.2rem;">Aura Engine</h2>
                    <code style="font-size: 10px; opacity: 0.5;">ID: ${this.state.uid}</code>
                    <button onclick="Aura.createSession()" style="width: 100%; margin-top: 20px; padding: 10px; background: var(--glass); border: 1px solid var(--border); color: white; border-radius: 8px; cursor: pointer; transition: 0.2s hover;">+ New Focus</button>
                </div>
                <div id="session-list" style="flex: 1; overflow-y: auto; padding: 10px;">
                    ${this.renderSessionList()}
                </div>
            </div>

            <div style="flex: 1; display: flex; flex-direction: column; position: relative;">
                <div style="height: 64px; border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 24px; justify-content: space-between;">
                    <input id="goal-input" onchange="Aura.updateGoal(this.value)" value="${activeSession.goal}" placeholder="What is the objective?" style="background:transparent; border:none; color:white; font-size: 15px; width: 60%; outline:none;">
                    <div id="timer-display" style="font-family: 'JetBrains Mono'; background: var(--glass); padding: 6px 14px; border-radius: 20px; font-size: 12px; color: var(--accent);">
                        ${activeSession.minutes}m focus
                    </div>
                </div>

                <div id="chat-window" style="flex: 1; overflow-y: auto; padding: 30px; display: flex; flex-direction: column; gap: 20px;">
                    </div>

                <div style="padding: 30px; background: linear-gradient(to top, var(--bg) 60%, transparent);">
                    <div style="max-width: 800px; margin: 0 auto; background: var(--glass); border: 1px solid var(--border); border-radius: 16px; padding: 8px; display: flex; backdrop-filter: blur(10px);">
                        <input id="aura-input" type="text" placeholder="Where is the friction?" style="flex: 1; background: transparent; border: none; color: white; padding: 12px 18px; outline: none; font-size: 15px;">
                        <button onclick="Aura.sendMessage()" style="background: var(--accent); color: white; border: none; padding: 10px 24px; border-radius: 12px; cursor: pointer; font-weight: 600;">Ask</button>
                    </div>
                </div>
            </div>
        `;
        this.renderChat();
        this.setupInputs();
    },

    renderSessionList() {
        return this.state.sessions.map(s => `
            <div onclick="Aura.switchSession('${s.id}')" style="padding: 12px 16px; margin-bottom: 4px; border-radius: 10px; cursor: pointer; font-size: 14px; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; ${s.id === this.state.activeId ? 'background: rgba(99, 102, 241, 0.12); color: var(--accent);' : 'opacity: 0.6;'}">
                <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width: 180px;">${s.title}</span>
                <span onclick="event.stopPropagation(); Aura.deleteSession('${s.id}')" style="opacity: 0.3; padding: 4px; hover: opacity: 1;">✕</span>
            </div>
        `).join('');
    },

    renderChat() {
        const win = document.getElementById('chat-window');
        if (!win) return;
        const session = this.state.sessions.find(s => s.id === this.state.activeId);
        
        win.innerHTML = session.history.map(m => `
            <div style="align-self: ${m.role === 'user' ? 'flex-end' : 'flex-start'}; 
                        max-width: 80%; padding: 16px 20px; border-radius: 18px; font-size: 14px; line-height: 1.6;
                        ${m.role === 'user' ? 'background: white; color: black; border-bottom-right-radius: 4px;' : 'background: var(--glass); border: 1px solid var(--border); border-bottom-left-radius: 4px;'}">
                ${m.text.replace(/\n/g, '<br>')}
            </div>
        `).join('');
        
        if (this.state.isThinking) {
            win.innerHTML += `<div style="opacity:0.5; font-size: 12px; padding-left: 10px; animation: pulse 1.5s infinite;">Aura is thinking...</div>`;
        }
        
        win.scrollTop = win.scrollHeight;
    },

    // 5. HELPER LOGIC
    setupInputs() {
        const input = document.getElementById('aura-input');
        if (input) {
            input.addEventListener('keypress', (e) => { 
                if(e.key === 'Enter') this.sendMessage(); 
            });
        }
    },

    updateGoal(val) {
        const session = this.state.sessions.find(s => s.id === this.state.activeId);
        if (session) {
            session.goal = val;
            session.title = val.substring(0, 25) || "Deep Work";
            this.save();
            this.render();
        }
    },

    switchSession(id) {
        this.state.activeId = id;
        this.render();
    },

    deleteSession(id) {
        this.state.sessions = this.state.sessions.filter(s => s.id !== id);
        if (this.state.activeId === id) {
            this.state.activeId = this.state.sessions[0]?.id || null;
        }
        if (!this.state.activeId) this.createSession();
        this.save();
        this.render();
    },

    startPulse() {
        // Updates the "Focus Time" every minute
        setInterval(() => {
            const session = this.state.sessions.find(s => s.id === this.state.activeId);
            if (session) {
                session.minutes++;
                this.save();
                const timer = document.getElementById('timer-display');
                if (timer) timer.innerText = `${session.minutes}m focus`;
            }
        }, 60000);
    }
};

// Start the engine
window.onload = () => Aura.init();
