<template>
  <div class="terminal-container">
    <div class="nav-links">
      <button @click="openModal('resume')">resume</button>
      <button @click="openModal('projects')">projects</button>
      <button @click="openModal('pins')">pins</button>
      <a href="https://cal.com/solimeet/15min" target="_blank">book a call</a>
    </div>
    <div class="terminal">
      <div class="terminal-header">
        <div class="terminal-buttons">
          <span class="btn close"></span>
          <span class="btn minimize"></span>
          <span class="btn maximize"></span>
        </div>
        <span class="terminal-title">soli.blue</span>
      </div>
      <div class="terminal-body" ref="terminalBody">
        <div class="terminal-line welcome">
          <span class="prompt">$</span>
          <span>Welcome! Ask me anything about Soli.</span>
        </div>
        <div class="terminal-line welcome">
          <span class="prompt">$</span>
          <span>Commands: <code>/projects</code> <code>/resume</code> <code>/pins</code> or just ask a question</span>
        </div>
        <div v-for="(msg, index) in messages" :key="index" class="terminal-line" :class="msg.role">
          <span class="prompt">{{ msg.role === 'user' ? '>' : '$' }}</span>
          <span v-html="formatMessage(msg.content)"></span>
        </div>
        <div v-if="isLoading" class="terminal-line assistant">
          <span class="prompt">$</span>
          <span class="typing">thinking<span class="dots"></span></span>
        </div>
        <div class="input-line">
          <span class="prompt">></span>
          <input
            ref="input"
            v-model="userInput"
            @keydown.enter="sendMessage"
            @keydown.tab.prevent="autocomplete"
            @keydown.down.prevent="nextSuggestion"
            @keydown.up.prevent="prevSuggestion"
            @keydown.escape="closeSuggestions"
            @input="updateSuggestions"
            placeholder="Type your question..."
            :disabled="isLoading"
            autofocus
          />
          <div v-if="showSuggestions && suggestions.length" class="suggestions">
            <div
              v-for="(cmd, i) in suggestions"
              :key="cmd"
              class="suggestion"
              :class="{ active: i === selectedSuggestion }"
              @click="selectSuggestion(cmd)"
            >
              {{ cmd }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="floating-btns">
      <router-link to="/animation" class="floating-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
        <span>classic</span>
      </router-link>
      <router-link to="/newspaper" class="floating-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
          <path d="M18 14h-8"></path>
          <path d="M15 18h-5"></path>
          <path d="M10 6h8v4h-8V6Z"></path>
        </svg>
        <span>newspaper</span>
      </router-link>
      <router-link to="/windows95" class="floating-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <rect x="2" y="2" width="9" height="9" fill="#f65314"/>
          <rect x="13" y="2" width="9" height="9" fill="#7cbb00"/>
          <rect x="2" y="13" width="9" height="9" fill="#00a1f1"/>
          <rect x="13" y="13" width="9" height="9" fill="#ffbb00"/>
        </svg>
        <span>win95</span>
      </router-link>
      <router-link to="/wikipedia" class="floating-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <text x="12" y="16" text-anchor="middle" font-size="12" fill="currentColor" stroke="none">W</text>
        </svg>
        <span>wiki</span>
      </router-link>
    </div>

    <!-- Modal -->
    <div v-if="activeModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ activeModal }}</h2>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <!-- Resume -->
          <div v-if="activeModal === 'resume'">
            <div v-for="exp in resume.experience" :key="exp.title" class="modal-item">
              <h3><a :href="exp.url" target="_blank">{{ exp.title }}</a></h3>
              <p class="subtitle">{{ exp.subtitle }} · {{ exp.start }} - {{ exp.end || 'Present' }}</p>
              <p v-if="exp.description">{{ exp.description }}</p>
            </div>
            <h2 class="section-title">Education</h2>
            <div v-for="edu in resume.education" :key="edu.title" class="modal-item">
              <h3>{{ edu.title }}</h3>
              <p class="subtitle">{{ edu.subtitle }} · {{ edu.start }} - {{ edu.end || 'Present' }}</p>
            </div>
            <h2 class="section-title">Languages</h2>
            <div class="languages">
              <span v-for="lang in resume.languages" :key="lang.name" class="lang-tag">
                {{ lang.name }} <small>({{ lang.level }})</small>
              </span>
            </div>
          </div>
          <!-- Projects -->
          <div v-if="activeModal === 'projects'">
            <div class="modal-tabs">
              <button :class="{ active: projectTab === 'live' }" @click="projectTab = 'live'">Live</button>
              <button :class="{ active: projectTab === 'graveyard' }" @click="projectTab = 'graveyard'">Graveyard</button>
            </div>
            <div v-for="project in filteredProjects" :key="project.title" class="modal-item">
              <h3>
                {{ project.title }}
                <a v-if="project.link" :href="project.link" target="_blank" class="icon-link" title="Open project">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
                <a v-if="project.press" :href="project.press" target="_blank" class="icon-link" title="Press coverage">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
                    <path d="M18 14h-8"></path>
                    <path d="M15 18h-5"></path>
                    <path d="M10 6h8v4h-8V6Z"></path>
                  </svg>
                </a>
              </h3>
              <p class="subtitle">{{ project.subtitle }} · {{ project.year }}</p>
              <p>{{ project.description }}</p>
              <div class="tags">
                <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
          </div>
          <!-- Pins -->
          <div v-if="activeModal === 'pins'">
            <div v-for="(pin, i) in pins" :key="i" class="modal-item">
              <div v-if="pin.type === 'quote'" class="quote">
                <p>"{{ pin.message }}"</p>
                <p class="author">— {{ pin.author }}</p>
              </div>
              <div v-else class="book">
                <img :src="pin.cover" :alt="pin.title" />
                <div>
                  <h3>{{ pin.title }}</h3>
                  <p class="subtitle">{{ pin.author }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import resume from '../assets/resume.json';
import projects from '../assets/projects.json';
import pins from '../assets/pins.json';

export default {
  name: 'TerminalHome',
  data() {
    return {
      userInput: '',
      messages: [],
      isLoading: false,
      sessionId: null,
      commands: ['/projects', '/resume', '/pins', '/help'],
      suggestions: [],
      showSuggestions: false,
      selectedSuggestion: 0,
      activeModal: null,
      projectTab: 'live',
      resume,
      projects,
      pins,
    };
  },
  computed: {
    filteredProjects() {
      return this.projects.filter(p => p.status === this.projectTab);
    },
  },
  mounted() {
    this.sessionId = Date.now().toString();
    this.$refs.input.focus();
  },
  methods: {
    async sendMessage() {
      const input = this.userInput.trim();
      if (!input || this.isLoading) return;

      this.messages.push({ role: 'user', content: input });
      this.userInput = '';

      // Handle local commands
      if (input.startsWith('/')) {
        const cmd = input.toLowerCase();
        if (cmd === '/projects') {
          this.openModal('projects');
          return;
        } else if (cmd === '/resume') {
          this.openModal('resume');
          return;
        } else if (cmd === '/pins') {
          this.openModal('pins');
          return;
        } else if (cmd === '/help') {
          this.messages.push({
            role: 'assistant',
            content: 'Available commands:\n\n/projects - View Soli\'s projects\n/resume - View Soli\'s resume\n/pins - View Soli\'s favorite quotes & books\n/help - Show this help\n\nOr just ask me anything about Soli!',
          });
          this.scrollToBottom();
          return;
        }
        this.messages.push({
          role: 'assistant',
          content: `Unknown command: ${input}\nTry \`/help\` for available commands.`,
        });
        this.scrollToBottom();
        return;
      }

      this.isLoading = true;
      this.scrollToBottom();

      try {
        // Use emulator URL in dev, production URL otherwise
        const apiUrl = window.location.hostname === 'localhost'
          ? 'http://127.0.0.1:5001/personal-website-e63ac/us-central1/chat'
          : '/api/chat';
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input, sessionId: this.sessionId }),
        });
        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Stream the response word by word
        await this.streamResponse(data.response);
        this.sessionId = data.sessionId;
      } catch (error) {
        console.error('Error:', error);
        this.messages.push({
          role: 'assistant',
          content: 'Oops, something went wrong. Try again?',
        });
      }

      this.isLoading = false;
      this.scrollToBottom();
      this.$nextTick(() => this.$refs.input.focus());
    },
    formatMessage(content) {
      return content
        // Code blocks (```code```)
        .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        // Inline code (`code`)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Bold (**text**)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic (*text*)
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // Links [text](url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
        // Headers (## text)
        .replace(/^### (.*$)/gm, '<strong class="h3">$1</strong>')
        .replace(/^## (.*$)/gm, '<strong class="h2">$1</strong>')
        .replace(/^# (.*$)/gm, '<strong class="h1">$1</strong>')
        // Unordered lists (- item)
        .replace(/^- (.*$)/gm, '<span class="list-item">• $1</span>')
        // Newlines
        .replace(/\n/g, '<br>');
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const body = this.$refs.terminalBody;
        body.scrollTop = body.scrollHeight;
      });
    },
    async streamResponse(text) {
      const msg = { role: 'assistant', content: '' };
      this.messages.push(msg);
      const words = text.split(/(\s+)/); // Split but keep whitespace
      for (let i = 0; i < words.length; i++) {
        msg.content += words[i];
        this.scrollToBottom();
        // Small delay between words (faster for whitespace)
        if (words[i].trim()) {
          await new Promise(r => setTimeout(r, 30));
        }
      }
    },
    updateSuggestions() {
      const input = this.userInput.toLowerCase();
      if (input.startsWith('/')) {
        this.suggestions = this.commands.filter(cmd =>
          cmd.toLowerCase().startsWith(input),
        );
        this.showSuggestions = this.suggestions.length > 0;
        this.selectedSuggestion = 0;
      } else {
        this.closeSuggestions();
      }
    },
    autocomplete() {
      if (this.suggestions.length > 0) {
        this.userInput = this.suggestions[this.selectedSuggestion];
        this.closeSuggestions();
      }
    },
    nextSuggestion() {
      if (this.showSuggestions && this.suggestions.length > 0) {
        this.selectedSuggestion = (this.selectedSuggestion + 1) % this.suggestions.length;
      }
    },
    prevSuggestion() {
      if (this.showSuggestions && this.suggestions.length > 0) {
        this.selectedSuggestion = this.selectedSuggestion === 0
          ? this.suggestions.length - 1
          : this.selectedSuggestion - 1;
      }
    },
    selectSuggestion(cmd) {
      this.userInput = cmd;
      this.closeSuggestions();
      this.$refs.input.focus();
    },
    closeSuggestions() {
      this.showSuggestions = false;
      this.suggestions = [];
      this.selectedSuggestion = 0;
    },
    openModal(name) {
      this.activeModal = name;
      document.body.style.overflow = 'hidden';
    },
    closeModal() {
      this.activeModal = null;
      document.body.style.overflow = '';
    },
  },
};
</script>

<style scoped>
.terminal-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1em;
  gap: 1em;
}

.nav-links {
  display: flex;
  gap: 1.5em;
}

.nav-links button,
.nav-links a {
  background: none;
  border: none;
  color: #888;
  font-family: 'SF Mono', 'Fira Code', 'Monaco', monospace;
  font-size: 0.9em;
  cursor: pointer;
  text-decoration: none;
  padding: 0.3em 0;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
}

.nav-links button:hover,
.nav-links a:hover {
  color: #6dd1b0;
  border-bottom-color: #6dd1b0;
}

.terminal {
  width: min(95%, 700px);
  max-height: 80vh;
  background: #1e1e1e;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.terminal-header {
  background: #323232;
  padding: 0.8em 1em;
  display: flex;
  align-items: center;
  gap: 1em;
}

.terminal-buttons {
  display: flex;
  gap: 0.5em;
}

.btn {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.btn.close { background: #ff5f56; }
.btn.minimize { background: #ffbd2e; }
.btn.maximize { background: #27ca40; }

.terminal-title {
  color: #888;
  font-size: 0.85em;
  flex: 1;
  text-align: center;
  margin-right: 3em;
}

.terminal-body {
  padding: 1em;
  overflow-y: auto;
  flex: 1;
  font-family: 'SF Mono', 'Fira Code', 'Monaco', monospace;
  font-size: 16px;
  line-height: 1.6;
}

.terminal-line {
  margin-bottom: 0.5em;
  display: flex;
  gap: 0.6em;
  align-items: flex-start;
}

.terminal-line.welcome {
  color: #888;
}

.terminal-line.user {
  color: #6dd1b0;
}

.terminal-line.assistant {
  color: #e0e0e0;
}

.terminal-line.assistant span:last-child {
  flex: 1;
}

.prompt {
  color: #6495ed;
  font-weight: bold;
  flex-shrink: 0;
}

.terminal-line.user .prompt {
  color: #6dd1b0;
}

.input-line {
  display: flex;
  gap: 0.6em;
  align-items: center;
  margin-top: 0.5em;
  position: relative;
  flex-wrap: wrap;
}

.input-line input {
  flex: 1;
  background: transparent;
  border: none;
  color: #6dd1b0;
  font-family: inherit;
  font-size: 16px; /* Prevents iOS zoom on focus */
  outline: none;
}

.input-line input::placeholder {
  color: #555;
}

.suggestions {
  position: absolute;
  bottom: 100%;
  left: 1.5em;
  background: #2a2a3a;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 0.3em;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
}

.suggestion {
  padding: 0.4em 0.8em;
  cursor: pointer;
  color: #aaa;
  font-size: 0.9em;
}

.suggestion:hover,
.suggestion.active {
  background: #3a3a4a;
  color: #6dd1b0;
}

.typing .dots::after {
  content: '';
  animation: dots 1.5s infinite;
}

@keyframes dots {
  0%, 20% { content: ''; }
  40% { content: '.'; }
  60% { content: '..'; }
  80%, 100% { content: '...'; }
}

.floating-btns {
  position: fixed;
  bottom: 1em;
  left: 1em;
  display: flex;
  gap: 0.5em;
  z-index: 1000;
}

.floating-btn {
  background: var(--surface);
  color: var(--text);
  padding: 0.6em 1em;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5em;
  text-decoration: none;
  font-size: 0.9em;
  opacity: 0.8;
  transition: opacity 0.2s, background 0.2s;
}

.floating-btn:hover {
  opacity: 1;
  background: var(--surface-hover);
}

/* Links in messages */
.terminal-line a {
  color: #87ceeb;
  text-decoration: underline;
}

.terminal-line a:hover {
  color: #b0e0ff;
}

/* Markdown styles */
.terminal-line code {
  background: #2a2a3a;
  padding: 0.15em 0.4em;
  border-radius: 4px;
  font-size: 0.9em;
  color: #f8f8f2;
}

.terminal-line pre {
  background: #2a2a3a;
  padding: 0.8em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.terminal-line pre code {
  background: none;
  padding: 0;
}

.terminal-line .h1 {
  font-size: 1.3em;
  color: #87ceeb;
}

.terminal-line .h2 {
  font-size: 1.15em;
  color: #87ceeb;
}

.terminal-line .h3 {
  font-size: 1.05em;
  color: #87ceeb;
}

.terminal-line .list-item {
  display: block;
  padding-left: 0.5em;
}

.welcome code {
  background: #2a2a3a;
  padding: 0.15em 0.4em;
  border-radius: 4px;
  color: #6dd1b0;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1em;
}

.modal {
  background: var(--bg);
  border-radius: 12px;
  width: min(95%, 600px);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em 1.5em;
  border-bottom: 1px solid var(--surface-hover);
}

.modal-header h2 {
  margin: 0;
  color: var(--accent-solid);
  font-size: 1.2em;
  text-transform: capitalize;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5em;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.modal-close:hover {
  color: var(--text);
}

.modal-body {
  padding: 1.5em;
  overflow-y: auto;
  color: var(--text);
  flex: 1;
}

.modal-item {
  margin-bottom: 1.5em;
  padding-bottom: 1.5em;
  border-bottom: 1px solid var(--surface);
}

.modal-item:last-child,
.modal-body > div > .modal-item:last-child {
  border-bottom: none !important;
  margin-bottom: 0;
  padding-bottom: 0;
}

.modal-item h3 {
  margin: 0 0 0.3em 0;
  color: var(--text);
  font-size: 1em;
}

.modal-item h3 a {
  color: var(--link);
  text-decoration: none;
}

.modal-item h3 a:hover {
  text-decoration: underline;
}

.modal-item .subtitle {
  color: var(--text-secondary);
  font-size: 0.85em;
  margin: 0 0 0.5em 0;
}

.modal-item p {
  margin: 0.5em 0;
  font-size: 0.9em;
  line-height: 1.5;
}

.modal-item .external {
  color: var(--accent-solid);
  margin-left: 0.3em;
  text-decoration: none;
}

.modal-item .tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4em;
  margin-top: 0.5em;
}

.modal-item .tag {
  background: var(--surface);
  color: var(--text-secondary);
  padding: 0.2em 0.5em;
  border-radius: 4px;
  font-size: 0.75em;
}

.section-title {
  color: var(--accent-solid);
  font-size: 1em;
  margin: 1em 0;
}

.quote p {
  font-style: italic;
  margin: 0;
  line-height: 1.6;
}

.quote .author {
  font-style: normal;
  color: var(--accent-solid);
  margin-top: 0.5em;
}

.book {
  display: flex;
  gap: 1em;
  align-items: flex-start;
}

.book img {
  width: 60px;
  border-radius: 4px;
}

.book h3 {
  margin: 0;
}

.book .subtitle {
  margin: 0.3em 0 0 0;
}

.languages {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6em;
}

.lang-tag {
  background: var(--surface);
  color: var(--text);
  padding: 0.4em 0.8em;
  border-radius: 6px;
  font-size: 0.9em;
}

.lang-tag small {
  color: var(--text-secondary);
}

.modal-tabs {
  display: flex;
  gap: 0.5em;
  margin-bottom: 1.5em;
}

.modal-tabs button {
  padding: 0.5em 1.2em;
  border: none;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  font-size: 0.9em;
  border-radius: 8px;
  transition: background 0.2s;
}

.modal-tabs button.active {
  background: var(--accent);
  color: white;
}

.modal-tabs button:hover:not(.active) {
  background: var(--surface-hover);
}

.icon-link {
  display: inline-flex;
  align-items: center;
  margin-left: 0.4em;
  color: var(--text-secondary);
  vertical-align: middle;
  transition: color 0.2s;
}

.icon-link:hover {
  color: var(--accent-solid);
}

.icon-link svg {
  vertical-align: middle;
}
</style>
