<template>
  <div class="messenger-app">
    <div class="messenger-status">
      <span class="status-dot"></span>
      <span class="status-name">soli (Online)</span>
      <span class="status-note">ask me anything</span>
    </div>
    <div
      ref="conversation"
      class="messenger-conversation"
      :class="{ nudging: isNudging }"
    >
      <div v-for="(msg, index) in messages" :key="index" class="msg">
        <div class="msg-sender" :class="msg.role === 'assistant' ? 'sender-soli' : 'sender-you'">
          {{ msg.role === 'assistant' ? 'soli says:' : 'you say:' }}
        </div>
        <div
          v-if="msg.role === 'assistant'"
          class="msg-body markdown-body"
          v-html="renderMarkdown(msg.content)"
        ></div>
        <div v-else class="msg-body">{{ msg.content }}</div>
      </div>
      <div v-if="isSending" class="msg typing-indicator">soli is typing...</div>
    </div>
    <div class="messenger-input-area">
      <textarea
        ref="input"
        v-model="draft"
        class="messenger-input"
        rows="2"
        :maxlength="maxMessageLength"
        placeholder="Type a message..."
        @keydown.enter.exact.prevent="sendMessage"
      ></textarea>
      <div class="messenger-buttons">
        <button
          class="messenger-btn send-btn"
          :disabled="isSending || !draft.trim()"
          @click="sendMessage"
        >
          Send
        </button>
        <button class="messenger-btn" :disabled="isNudging" @click="sendNudge">
          Nudge
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { marked } from 'marked/lib/marked.cjs';

const MAX_MESSAGE_LENGTH = 1200; // mirrors functions/api/chat.js
const MAX_HISTORY = 12;

const escapeHtml = value => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const markdownRenderer = new marked.Renderer();

markdownRenderer.html = html => escapeHtml(html);
markdownRenderer.image = (href, title, text) => escapeHtml(text || '');
markdownRenderer.link = (href, title, text) => {
  const safeHref = /^(https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href || '');
  if (!safeHref) return text;

  const titleAttribute = title ? ` title="${escapeHtml(title)}"` : '';
  return `<a href="${escapeHtml(href)}"${titleAttribute} target="_blank" rel="noopener noreferrer">${text}</a>`;
};

export default {
  name: 'MessengerApp',
  data() {
    return {
      messages: [],
      draft: '',
      isSending: false,
      isNudging: false,
      maxMessageLength: MAX_MESSAGE_LENGTH,
    };
  },
  mounted() {
    this.messages.push({
      role: 'assistant',
      content: 'yo 👋 i\'m soli\'s AI. ask me about my projects, resume, or whatever',
    });
    this.scrollToBottom();
  },
  methods: {
    renderMarkdown(content) {
      return marked(content || '', {
        renderer: markdownRenderer,
        headerIds: false,
        mangle: false,
        breaks: true,
      });
    },
    async sendMessage() {
      const input = this.draft.trim();
      if (!input || this.isSending) return;

      this.draft = '';
      this.messages.push({ role: 'user', content: input });
      this.$emit('sound', 'send');
      this.isSending = true;
      this.scrollToBottom();

      try {
        // `wrangler pages dev` serves /api/* locally, same as production.
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Edge functions are stateless — send recent history for context.
          body: JSON.stringify({
            message: input,
            history: this.messages.slice(0, -1).slice(-MAX_HISTORY),
          }),
        });
        const data = await res.json();

        if (res.status === 429) {
          throw new Error('whoa, slow down! give me a minute to catch my breath 😅');
        }
        if (data.error) {
          throw new Error('hmm, something broke on my end. try again in a sec?');
        }

        this.messages.push({ role: 'assistant', content: data.response });
        this.$emit('sound', 'receive');
      } catch (error) {
        this.messages.push({
          role: 'assistant',
          content: error.message || 'hmm, something broke on my end. try again in a sec?',
        });
      }

      this.isSending = false;
      this.scrollToBottom();
      this.$nextTick(() => {
        if (this.$refs.input) this.$refs.input.focus();
      });
    },
    sendNudge() {
      if (this.isNudging) return;
      this.$emit('sound', 'nudge');
      this.isNudging = true;
      this.messages.push({ role: 'assistant', content: '*you have just sent a nudge*' });
      this.scrollToBottom();
      setTimeout(() => {
        this.isNudging = false;
      }, 600);
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.conversation;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
  },
};
</script>

<style scoped>
.messenger-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  background: #c0c0c0;
  font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, sans-serif;
  font-size: 11px;
  padding: 4px 4px 8px;
}

.messenger-status {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 5px;
  margin-bottom: 4px;
  background: #c0c0c0;
  border: 1px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00a800;
  border: 1px solid #005400;
  flex-shrink: 0;
}

.status-name {
  font-weight: bold;
}

.status-note {
  color: #808080;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.messenger-conversation {
  flex: 1;
  overflow-y: auto;
  background: #ffffff;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  padding: 5px;
}

.messenger-conversation.nudging {
  animation: nudge-shake 0.6s linear;
}

@keyframes nudge-shake {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-4px, -2px); }
  20% { transform: translate(4px, 2px); }
  30% { transform: translate(-4px, 2px); }
  40% { transform: translate(4px, -2px); }
  50% { transform: translate(-3px, -1px); }
  60% { transform: translate(3px, 1px); }
  70% { transform: translate(-2px, 1px); }
  80% { transform: translate(2px, -1px); }
  90% { transform: translate(-1px, 0); }
}

.msg {
  margin-bottom: 6px;
}

.msg-sender {
  font-weight: bold;
}

.sender-soli {
  color: #b40000;
}

.sender-you {
  color: #00007c;
}

.msg-body {
  padding-left: 12px;
  color: #000000;
  white-space: pre-wrap;
  word-break: break-word;
}

.markdown-body {
  white-space: normal;
}

.markdown-body >>> p {
  margin: 0 0 6px;
}

.markdown-body >>> p:last-child {
  margin-bottom: 0;
}

.markdown-body >>> a {
  color: #0000ee;
  text-decoration: underline;
}

.markdown-body >>> ul,
.markdown-body >>> ol {
  margin: 4px 0 6px;
  padding-left: 22px;
}

.markdown-body >>> li {
  margin-bottom: 2px;
}

.markdown-body >>> h1,
.markdown-body >>> h2,
.markdown-body >>> h3 {
  margin: 6px 0 4px;
  font-size: 11px;
}

.markdown-body >>> code {
  padding: 1px 2px;
  background: #e8e8e8;
  font-family: 'Courier New', monospace;
}

.markdown-body >>> pre {
  margin: 4px 0 6px;
  padding: 5px;
  overflow-x: auto;
  background: #e8e8e8;
  border: 1px solid #808080;
  white-space: pre-wrap;
}

.markdown-body >>> pre code {
  padding: 0;
}

.markdown-body >>> blockquote {
  margin: 4px 0 6px 8px;
  padding-left: 7px;
  border-left: 2px solid #808080;
}

.typing-indicator {
  color: #808080;
  font-style: italic;
}

.messenger-input-area {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.messenger-input {
  flex: 1;
  background: #ffffff;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  font-family: inherit;
  font-size: 11px;
  padding: 3px;
  resize: none;
  outline: none;
}

/* iOS auto-zooms any focused input with font-size < 16px.
   Bump to 16px on touch devices to keep the phone from zooming in. */
@media (pointer: coarse) {
  .messenger-input {
    font-size: 16px;
  }
}

.messenger-buttons {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.messenger-btn {
  min-width: 60px;
  padding: 3px 8px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #404040 #404040 #ffffff;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
}

.messenger-btn:active:not(:disabled) {
  border-color: #404040 #ffffff #ffffff #404040;
}

.messenger-btn:disabled {
  color: #808080;
  text-shadow: 1px 1px 0 #ffffff;
  cursor: default;
}

.send-btn {
  font-weight: bold;
}
</style>
