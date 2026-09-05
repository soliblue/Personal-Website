<template>
  <div class="visitor-board">
    <div class="board-toolbar">
      <button class="board-button board-sign-button" @click="openComposer">
        <img :src="boardIcon" alt="">
        <span>Sign the board</span>
      </button>
      <span class="board-toolbar-separator" aria-hidden="true"></span>
      <span class="board-count">
        <strong>{{ total }}</strong> {{ total === 1 ? 'note' : 'notes' }} pinned
      </span>
      <button
        class="board-icon-button"
        :disabled="loading"
        title="Refresh board"
        aria-label="Refresh board"
        @click="loadEntries"
      >
        <img :src="refreshIcon" alt="">
      </button>
    </div>

    <div class="board-surface" :aria-busy="String(loading)">
      <div v-if="loading && !entries.length" class="board-state">
        <span class="board-hourglass" aria-hidden="true">⌛</span>
        <span>Checking the board...</span>
      </div>
      <div v-else-if="loadError && !entries.length" class="board-state board-error">
        <strong>Could not open the guestbook.</strong>
        <button class="board-button" @click="loadEntries">Try again</button>
      </div>
      <div v-else class="board-grid" role="list" aria-label="Visitor notes">
        <button
          v-for="(entry, index) in entries"
          :key="entry.id"
          class="visitor-note"
          :class="[
            'paper-' + entry.color,
            noteTilt(entry, index),
            {
              selected: selectedId === entry.id,
              'just-pinned': justPinnedId === entry.id,
            },
          ]"
          type="button"
          role="listitem"
          :aria-label="`${entry.name}: ${messageFor(entry.messageKey)}`"
          @click="selectEntry(entry)"
        >
          <span class="note-pin" aria-hidden="true"></span>
          <img class="note-stamp" :src="stampSource(entry.stamp)" alt="">
          <span class="note-copy">
            <strong class="note-name">{{ entry.name }}</strong>
            <span class="note-message">{{ messageFor(entry.messageKey) }}</span>
            <span class="note-time">{{ relativeTime(entry.createdAt) }}</span>
          </span>
        </button>
      </div>
    </div>

    <div class="board-status" role="status" aria-live="polite">
      <span>{{ statusText }}</span>
      <span v-if="loadError && entries.length">Refresh failed</span>
    </div>

    <div
      v-if="composerOpen"
      class="board-dialog-overlay"
      @click.self="closeComposer"
      @keydown.esc="closeComposer"
    >
      <section
        class="board-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="board-dialog-title"
      >
        <div class="board-dialog-titlebar">
          <span id="board-dialog-title">Sign the board</span>
          <button
            type="button"
            class="board-dialog-close"
            aria-label="Close"
            :disabled="submitting"
            @click="closeComposer"
          ></button>
        </div>

        <form class="board-form" @submit.prevent="pinNote">
          <div class="board-form-controls">
            <label class="board-field-label" for="visitor-name">
              <span>Display name</span>
              <span>{{ nameLength }}/24</span>
            </label>
            <input
              id="visitor-name"
              ref="nameInput"
              v-model="form.name"
              class="board-input"
              type="text"
              maxlength="24"
              autocomplete="nickname"
              spellcheck="false"
              placeholder="your name or alias"
              aria-describedby="visitor-name-help"
              required
            >
            <span id="visitor-name-help" class="board-field-help">
              Letters and numbers only, plus simple punctuation.
            </span>

            <fieldset class="board-fieldset">
              <legend>Pick a stamp</legend>
              <div class="stamp-options">
                <button
                  v-for="stamp in stamps"
                  :key="stamp.id"
                  class="stamp-option"
                  :class="{ selected: form.stamp === stamp.id }"
                  type="button"
                  :title="stamp.label"
                  :aria-label="stamp.label"
                  :aria-pressed="String(form.stamp === stamp.id)"
                  @click="form.stamp = stamp.id"
                >
                  <img :src="stamp.src" alt="">
                </button>
              </div>
            </fieldset>

            <fieldset class="board-fieldset">
              <legend>Paper color</legend>
              <div class="color-options">
                <button
                  v-for="color in colors"
                  :key="color.id"
                  class="color-option"
                  :class="[{ selected: form.color === color.id }, 'paper-' + color.id]"
                  type="button"
                  :title="color.label"
                  :aria-label="color.label"
                  :aria-pressed="String(form.color === color.id)"
                  @click="form.color = color.id"
                ></button>
              </div>
            </fieldset>

            <label class="board-field-label" for="visitor-message">Leave a note</label>
            <select id="visitor-message" v-model="form.messageKey" class="board-select">
              <option v-for="message in messages" :key="message.id" :value="message.id">
                {{ message.text }}
              </option>
            </select>

            <input
              v-model="form.website"
              class="board-honeypot"
              type="text"
              name="website"
              autocomplete="off"
              tabindex="-1"
              aria-hidden="true"
            >
          </div>

          <div class="board-preview-column">
            <span class="board-preview-label">Preview</span>
            <div class="visitor-note preview-note" :class="'paper-' + form.color">
              <span class="note-pin" aria-hidden="true"></span>
              <img class="note-stamp" :src="stampSource(form.stamp)" alt="">
              <span class="note-copy">
                <strong class="note-name">{{ previewName }}</strong>
                <span class="note-message">{{ messageFor(form.messageKey) }}</span>
                <span class="note-time">just now</span>
              </span>
            </div>
          </div>

          <div v-if="submitError" class="board-submit-error" role="alert">
            {{ submitError }}
          </div>

          <div class="board-dialog-footer">
            <span class="board-privacy">No email. Just a tiny hello.</span>
            <button
              type="button"
              class="board-button"
              :disabled="submitting"
              @click="closeComposer"
            >
              Cancel
            </button>
            <button type="submit" class="board-button primary" :disabled="submitting || !canSubmit">
              {{ submitting ? 'Pinning...' : 'Pin my note' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script>
import boardIcon from '@/assets/win95/visitor-board.svg';
import refreshIcon from '@/assets/win95/refresh.svg';
import starStamp from '@/assets/win95/visitor-stamps/star.svg';
import heartStamp from '@/assets/win95/visitor-stamps/heart.svg';
import floppyStamp from '@/assets/win95/visitor-stamps/floppy.svg';
import flowerStamp from '@/assets/win95/visitor-stamps/flower.svg';
import globeStamp from '@/assets/win95/visitor-stamps/globe.svg';
import coffeeStamp from '@/assets/win95/visitor-stamps/coffee.svg';
import rocketStamp from '@/assets/win95/visitor-stamps/rocket.svg';
import smileStamp from '@/assets/win95/visitor-stamps/smile.svg';

const STAMPS = [
  { id: 'star', label: 'Star', src: starStamp },
  { id: 'heart', label: 'Heart', src: heartStamp },
  { id: 'floppy', label: 'Floppy disk', src: floppyStamp },
  { id: 'flower', label: 'Flower', src: flowerStamp },
  { id: 'globe', label: 'Globe', src: globeStamp },
  { id: 'coffee', label: 'Coffee mug', src: coffeeStamp },
  { id: 'rocket', label: 'Rocket', src: rocketStamp },
  { id: 'smile', label: 'Smiley face', src: smileStamp },
];

const COLORS = [
  { id: 'lemon', label: 'Lemon yellow' },
  { id: 'mint', label: 'Mint green' },
  { id: 'peach', label: 'Peach orange' },
  { id: 'lavender', label: 'Lavender purple' },
  { id: 'sky', label: 'Sky blue' },
  { id: 'rose', label: 'Rose pink' },
];

const MESSAGES = [
  { id: 'was-here', text: 'I was here.' },
  { id: 'made-me-smile', text: 'This made me smile.' },
  { id: 'tiny-internet', text: 'I like this tiny internet.' },
  { id: 'squirrel', text: 'The squirrel sent me.' },
  { id: 'clicked-everything', text: 'I clicked everything.' },
  { id: 'keep-weird', text: 'Keep building weird things.' },
  { id: 'hello-future', text: 'Hello from the future.' },
  { id: 'good-vibes', text: 'Leaving good vibes here.' },
];

const MESSAGE_TEXT = MESSAGES.reduce((result, message) => ({
  ...result,
  [message.id]: message.text,
}), {
  welcome: 'You found the guestbook.',
});

const STAMP_SOURCES = STAMPS.reduce((result, stamp) => ({
  ...result,
  [stamp.id]: stamp.src,
}), {});

export default {
  name: 'VisitorBoard',
  data() {
    return {
      boardIcon,
      refreshIcon,
      stamps: STAMPS,
      colors: COLORS,
      messages: MESSAGES,
      entries: [],
      total: 0,
      loading: true,
      loadError: '',
      composerOpen: false,
      submitting: false,
      submitError: '',
      selectedId: null,
      justPinnedId: null,
      now: Date.now(),
      clockTimer: null,
      pinTimer: null,
      form: {
        name: localStorage.getItem('soli95-visitor-name') || '',
        stamp: 'star',
        color: 'lemon',
        messageKey: 'made-me-smile',
        website: '',
      },
    };
  },
  computed: {
    nameLength() {
      return Array.from(this.form.name.trim()).length;
    },
    canSubmit() {
      return this.nameLength >= 2 && this.nameLength <= 24;
    },
    previewName() {
      return this.form.name.trim() || 'your name';
    },
    selectedEntry() {
      return this.entries.find(entry => entry.id === this.selectedId);
    },
    statusText() {
      if (this.submitting) return 'Pinning your note...';
      if (this.selectedEntry) {
        return `Pinned by ${this.selectedEntry.name} - ${this.relativeTime(this.selectedEntry.createdAt)}`;
      }
      if (this.loading) return 'Refreshing...';
      return `${this.total} ${this.total === 1 ? 'visitor has' : 'visitors have'} signed the board`;
    },
  },
  mounted() {
    this.loadEntries();
    this.clockTimer = setInterval(() => { this.now = Date.now(); }, 60000);
  },
  beforeDestroy() {
    clearInterval(this.clockTimer);
    clearTimeout(this.pinTimer);
  },
  methods: {
    async loadEntries() {
      this.loading = true;
      this.loadError = '';
      try {
        const response = await fetch('/api/visitor-board', {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.entries)) throw new Error('load failed');
        this.entries = data.entries;
        this.total = Number(data.total || data.entries.length);
      } catch (error) {
        this.loadError = 'The board could not be loaded.';
      }
      this.loading = false;
    },
    openComposer() {
      this.composerOpen = true;
      this.submitError = '';
      this.$emit('sound', 'open');
      this.$nextTick(() => {
        if (this.$refs.nameInput) this.$refs.nameInput.focus();
      });
    },
    closeComposer() {
      if (this.submitting) return;
      this.composerOpen = false;
      this.submitError = '';
    },
    async pinNote() {
      if (!this.canSubmit || this.submitting) return;
      this.submitting = true;
      this.submitError = '';

      try {
        const response = await fetch('/api/visitor-board', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: this.form.name,
            stamp: this.form.stamp,
            color: this.form.color,
            messageKey: this.form.messageKey,
            website: this.form.website,
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.entry) {
          throw new Error(data.error || 'The note could not be pinned.');
        }

        this.entries.unshift(data.entry);
        this.total += 1;
        this.selectedId = data.entry.id;
        this.justPinnedId = data.entry.id;
        localStorage.setItem('soli95-visitor-name', this.form.name.trim());
        this.composerOpen = false;
        this.$emit('signed', data.entry);
        this.$emit('sound', 'send');
        clearTimeout(this.pinTimer);
        this.pinTimer = setTimeout(() => { this.justPinnedId = null; }, 800);
      } catch (error) {
        this.submitError = error.message || 'The note could not be pinned.';
        this.$emit('sound', 'error');
      }

      this.submitting = false;
    },
    selectEntry(entry) {
      this.selectedId = this.selectedId === entry.id ? null : entry.id;
      this.$emit('sound', 'click');
    },
    messageFor(key) {
      return MESSAGE_TEXT[key] || 'I was here.';
    },
    stampSource(id) {
      return STAMP_SOURCES[id] || starStamp;
    },
    noteTilt(entry, index) {
      const tilts = ['tilt-left', 'tilt-right', 'tilt-soft-left', 'tilt-none'];
      return tilts[(Number(entry.id) + index) % tilts.length];
    },
    relativeTime(timestamp) {
      const seconds = Math.max(0, Math.floor((this.now - (Number(timestamp) * 1000)) / 1000));
      if (seconds < 60) return 'just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
      return new Date(Number(timestamp) * 1000).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    },
  },
};
</script>

<style scoped>
.visitor-board {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  color: #111111;
  background: #c0c0c0;
  font-family: 'Pixelated MS Sans Serif', 'MS Sans Serif', Arial, sans-serif;
  font-size: 12px;
}

.board-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 5px 6px;
  border-bottom: 1px solid #808080;
  box-shadow: inset 0 -1px #ffffff;
}

.board-button,
.board-icon-button,
.stamp-option,
.color-option,
.board-dialog-close {
  border: 0;
  border-radius: 0;
  background: #c0c0c0;
  box-shadow:
    inset -1px -1px #0a0a0a,
    inset 1px 1px #ffffff,
    inset -2px -2px #808080,
    inset 2px 2px #dfdfdf;
  color: #111111;
  font: inherit;
  cursor: pointer;
}

.board-button:active:not(:disabled),
.board-icon-button:active:not(:disabled),
.stamp-option:active:not(:disabled),
.color-option:active:not(:disabled) {
  box-shadow:
    inset -1px -1px #ffffff,
    inset 1px 1px #0a0a0a,
    inset -2px -2px #dfdfdf,
    inset 2px 2px #808080;
}

.board-button:focus,
.board-icon-button:focus,
.stamp-option:focus,
.color-option:focus,
.board-input:focus,
.board-select:focus {
  outline: 1px dotted #000000;
  outline-offset: -4px;
}

.board-button:disabled,
.board-icon-button:disabled {
  color: #808080;
  cursor: default;
  text-shadow: 1px 1px #ffffff;
}

.board-button {
  min-height: 26px;
  min-width: 78px;
  padding: 3px 12px;
}

.board-sign-button {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-width: 128px;
  font-weight: bold;
}

.board-sign-button img,
.board-icon-button img {
  width: 20px;
  height: 20px;
  image-rendering: pixelated;
}

.board-toolbar-separator {
  width: 2px;
  height: 26px;
  border-left: 1px solid #808080;
  border-right: 1px solid #ffffff;
}

.board-count {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.board-icon-button {
  width: 28px;
  height: 28px;
  margin-left: auto;
  padding: 4px;
}

.board-icon-button img {
  width: 16px;
  height: 16px;
}

.board-surface {
  flex: 1;
  min-height: 0;
  overflow: auto;
  margin: 3px;
  background: #777777 url('../../assets/win95/visitor-board-texture.png') repeat;
  border: 2px solid;
  border-color: #404040 #ffffff #ffffff #404040;
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(142px, 1fr));
  align-items: start;
  gap: 28px 22px;
  padding: 28px 24px 40px;
}

.visitor-note {
  position: relative;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 9px;
  width: 100%;
  min-width: 0;
  min-height: 128px;
  padding: 25px 12px 12px;
  border: 0;
  border-radius: 0;
  box-shadow: 3px 4px 0 rgba(20, 20, 20, 0.38);
  color: #111111;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transform-origin: 50% 8px;
}

.visitor-note:hover,
.visitor-note:focus,
.visitor-note.selected {
  z-index: 2;
  outline: 2px dotted #000080;
  outline-offset: 3px;
  transform: rotate(0deg) translateY(-2px);
}

.visitor-note.tilt-left { transform: rotate(-1.1deg); }
.visitor-note.tilt-right { transform: rotate(1deg); }
.visitor-note.tilt-soft-left { transform: rotate(-0.45deg); }
.visitor-note.tilt-none { transform: rotate(0.35deg); }

.visitor-note.tilt-left:hover,
.visitor-note.tilt-left:focus,
.visitor-note.tilt-left.selected,
.visitor-note.tilt-right:hover,
.visitor-note.tilt-right:focus,
.visitor-note.tilt-right.selected,
.visitor-note.tilt-soft-left:hover,
.visitor-note.tilt-soft-left:focus,
.visitor-note.tilt-soft-left.selected,
.visitor-note.tilt-none:hover,
.visitor-note.tilt-none:focus,
.visitor-note.tilt-none.selected {
  transform: rotate(0deg) translateY(-2px);
}

.note-pin {
  position: absolute;
  top: -8px;
  left: calc(50% - 7px);
  width: 13px;
  height: 13px;
  border: 2px solid #082b70;
  border-radius: 50%;
  background: #155bd7;
  box-shadow: 1px 2px 0 rgba(0, 0, 0, 0.55);
}

.note-pin::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 3px;
  width: 3px;
  height: 3px;
  background: #b9d5ff;
}

.note-stamp {
  width: 42px;
  height: 42px;
  image-rendering: pixelated;
}

.note-copy {
  display: flex;
  min-width: 0;
  min-height: 88px;
  flex-direction: column;
}

.note-name,
.note-message {
  overflow-wrap: anywhere;
}

.note-name {
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.2;
}

.note-message {
  font-size: 12px;
  line-height: 1.35;
}

.note-time {
  margin-top: auto;
  padding-top: 8px;
  color: #4c4c4c;
  font-size: 10px;
}

.paper-lemon { background: #fff2a8; }
.paper-mint { background: #bfe8c8; }
.paper-peach { background: #f6c49c; }
.paper-lavender { background: #cdb8ed; }
.paper-sky { background: #b8daf0; }
.paper-rose { background: #efb5c3; }

.board-state {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #ffffff;
  font-size: 13px;
  text-shadow: 1px 1px #202020;
}

.board-state .board-button {
  text-shadow: none;
}

.board-hourglass {
  font-size: 26px;
}

.board-status {
  display: flex;
  justify-content: space-between;
  min-height: 22px;
  margin: 0 3px 3px;
  padding: 3px 6px;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  font-size: 10px;
}

.board-dialog-overlay {
  position: absolute;
  z-index: 10;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  background: rgba(0, 0, 0, 0.22);
}

.board-dialog {
  width: min(590px, 100%);
  max-height: 100%;
  overflow: auto;
  padding: 3px;
  background: #c0c0c0;
  box-shadow:
    inset -1px -1px #0a0a0a,
    inset 1px 1px #dfdfdf,
    inset -2px -2px #808080,
    inset 2px 2px #ffffff,
    3px 4px 0 rgba(0, 0, 0, 0.38);
}

.board-dialog-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 22px;
  padding: 3px 3px 3px 5px;
  background: #000080;
  color: #ffffff;
  font-weight: bold;
}

.board-dialog-close {
  width: 18px;
  height: 16px;
  background-color: #c0c0c0;
  background-image: url('~98.css/icon/close.svg');
  background-position: top 4px left 5px;
  background-repeat: no-repeat;
}

.board-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 168px;
  gap: 14px 18px;
  padding: 16px;
}

.board-form-controls {
  min-width: 0;
}

.board-field-label,
.board-preview-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-weight: bold;
}

.board-input,
.board-select {
  width: 100%;
  min-height: 27px;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  border-radius: 0;
  background: #ffffff;
  color: #111111;
  font: inherit;
  box-sizing: border-box;
}

.board-input {
  padding: 3px 5px;
}

.board-select {
  padding: 2px 4px;
}

.board-field-help {
  display: block;
  margin-top: 3px;
  color: #505050;
  font-size: 10px;
  line-height: 1.3;
}

.board-fieldset {
  min-width: 0;
  margin: 12px 0 0;
  padding: 0;
  border: 0;
}

.board-fieldset legend {
  margin-bottom: 5px;
  padding: 0;
  font-weight: bold;
}

.stamp-options,
.color-options {
  display: grid;
  gap: 5px;
}

.stamp-options {
  grid-template-columns: repeat(8, minmax(30px, 1fr));
}

.color-options {
  grid-template-columns: repeat(6, minmax(34px, 1fr));
  margin-bottom: 12px;
}

.stamp-option {
  display: flex;
  aspect-ratio: 1;
  min-width: 0;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.stamp-option img {
  width: 28px;
  height: 28px;
  image-rendering: pixelated;
}

.stamp-option.selected,
.color-option.selected {
  outline: 2px dotted #000080;
  outline-offset: -5px;
  box-shadow:
    inset -1px -1px #ffffff,
    inset 1px 1px #0a0a0a,
    inset -2px -2px #dfdfdf,
    inset 2px 2px #808080;
}

.color-option {
  height: 30px;
}

.board-preview-column {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.preview-note {
  grid-template-columns: 36px minmax(0, 1fr);
  min-height: 152px;
  padding: 25px 10px 12px;
  cursor: default;
  transform: rotate(0.7deg);
}

.preview-note:hover {
  outline: 0;
  transform: rotate(0.7deg);
}

.preview-note .note-stamp {
  width: 36px;
  height: 36px;
}

.board-submit-error {
  grid-column: 1 / -1;
  padding: 6px 8px;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  background: #ffffff;
  color: #800000;
  line-height: 1.35;
}

.board-dialog-footer {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #808080;
  box-shadow: inset 0 1px #ffffff;
}

.board-privacy {
  margin-right: auto;
  color: #404040;
}

.board-button.primary {
  outline: 1px solid #000000;
  outline-offset: 2px;
}

.board-honeypot {
  position: absolute;
  left: -10000px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

@keyframes pin-note {
  0% { transform: rotate(-2deg) translateY(-18px); opacity: 0; }
  65% { transform: rotate(0.7deg) translateY(2px); opacity: 1; }
  100% { transform: rotate(0deg) translateY(0); opacity: 1; }
}

.visitor-note.just-pinned {
  animation: pin-note 360ms steps(4, end) !important;
}

@media (max-width: 620px) {
  .board-grid {
    grid-template-columns: repeat(2, minmax(126px, 1fr));
    gap: 25px 16px;
    padding: 26px 16px 36px;
  }

  .board-form {
    grid-template-columns: 1fr;
    padding: 12px;
  }

  .board-preview-column {
    display: none;
  }

  .board-dialog-footer {
    grid-column: 1;
    flex-wrap: wrap;
  }

  .board-privacy {
    width: 100%;
    margin: 0 0 4px;
  }
}

@media (max-width: 370px) {
  .board-grid {
    grid-template-columns: 1fr;
  }

  .stamp-options {
    grid-template-columns: repeat(4, 1fr);
  }

  .board-count {
    display: none;
  }
}

@media (pointer: coarse) {
  .board-input,
  .board-select {
    font-size: 18px;
  }

  .board-button,
  .stamp-option,
  .color-option,
  .board-icon-button {
    min-height: 34px;
  }
}
</style>
