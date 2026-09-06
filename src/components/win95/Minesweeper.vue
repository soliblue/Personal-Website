<template>
  <div class="minesweeper" @contextmenu.prevent>
    <div class="ms-toolbar">
      <select v-model="difficulty" aria-label="Difficulty" @change="reset">
        <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="expert">Expert</option>
      </select>
      <button type="button" :aria-pressed="flagMode" aria-label="Flag mode" @click="flagMode = !flagMode">🚩</button>
    </div>
    <div class="ms-header">
      <div class="ms-led">{{ mineDisplay }}</div>
      <button class="ms-face" type="button" aria-label="New game" @click="reset">{{ face }}</button>
      <div class="ms-led">{{ timeDisplay }}</div>
    </div>
    <div class="ms-grid" :style="{ gridTemplateColumns: `repeat(${cols}, 24px)` }">
      <button
        v-for="(cell, i) in board"
        :key="i"
        class="ms-cell"
        type="button"
        :aria-label="`Row ${Math.floor(i / cols) + 1}, column ${i % cols + 1}: ${cell.revealed ? (cell.mine ? 'mine' : cell.adjacent + ' adjacent mines') : cell.mark === 1 ? 'flagged' : 'covered'}`"
        :class="cellClass(cell, i)"
        @mousedown="onCellDown($event)"
        @click="onCellClick(i)"
        @contextmenu.prevent="onCellRightClick(i)"
        @touchstart="onTouchStart(i, $event)"
        @touchend="onTouchEnd($event)"
        @touchcancel="onTouchMove"
        @touchmove="onTouchMove"
      >{{ cellContent(cell) }}</button>
    </div>
    <div class="ms-status" role="status">{{ won ? 'Cleared! ' + time + ' seconds.' : lost ? 'Boom. One more round?' : started ? revealedCount + ' / ' + (rows * cols - mines) + ' cleared' : 'Ready' }}<span v-if="best">Best: {{ best }}s</span></div>
  </div>
</template>

<script>
import { safeStorage } from '@/utils/storage';
const DIFFICULTIES = { beginner: [9, 9, 10], intermediate: [12, 12, 24], expert: [16, 16, 40] };
const LONG_PRESS_MS = 400;
const SYMBOLS = ['💣', '🚩', '❌'];

export default {
  name: 'Minesweeper',
  emits: ['sound', 'resize'],
  data() {
    return {
      board: [],
      difficulty: 'beginner',
      flagMode: false,
      best: 0,
      started: false,
      lost: false,
      won: false,
      pressing: false,
      time: 0,
      timerId: null,
      touchTimer: null,
      longPressFired: false,
      boomIndex: -1,
    };
  },
  computed: {
    rows() { return DIFFICULTIES[this.difficulty][0]; },
    cols() { return DIFFICULTIES[this.difficulty][1]; },
    mines() { return DIFFICULTIES[this.difficulty][2]; },
    revealedCount() { return this.board.filter(cell => cell.revealed && !cell.mine).length; },
    gameOver() {
      return this.lost || this.won;
    },
    flagCount() {
      return this.board.filter(cell => cell.mark === 1).length;
    },
    mineDisplay() {
      return this.formatLed(this.mines - this.flagCount);
    },
    timeDisplay() {
      return this.formatLed(this.time);
    },
    face() {
      if (this.lost) return '💀';
      if (this.won) return '😎';
      if (this.pressing) return '😮';
      return '🙂';
    },
  },
  created() {
    this.reset();
  },
  mounted() {
    document.addEventListener('mouseup', this.onDocMouseUp);
  },
  beforeUnmount() {
    document.removeEventListener('mouseup', this.onDocMouseUp);
    this.stopTimer();
    clearTimeout(this.touchTimer);
  },
  methods: {
    reset() {
      this.stopTimer();
      clearTimeout(this.touchTimer);
      this.longPressFired = false;
      this.best = Number(safeStorage.getItem('minesweeper-best-' + this.difficulty)) || 0;
      const board = [];
      for (let i = 0; i < this.rows * this.cols; i += 1) {
        board.push({
          mine: false,
          revealed: false,
          mark: 0, // 0 = clear, 1 = flag, 2 = question
          adjacent: 0,
        });
      }
      this.board = board;
      this.started = false;
      this.lost = false;
      this.won = false;
      this.pressing = false;
      this.time = 0;
      this.boomIndex = -1;
      this.$emit('resize', { width: this.cols * 24 + 32, height: this.rows * 24 + 150 });
    },
    placeMines(excluded = []) {
      let placed = 0;
      while (placed < this.mines) {
        const i = Math.floor(Math.random() * this.board.length);
        if (!this.board[i].mine && !excluded.includes(i)) {
          this.board[i].mine = true;
          placed += 1;
        }
      }
    },
    neighbors(i) {
      const r = Math.floor(i / this.cols);
      const c = i % this.cols;
      const result = [];
      for (let dr = -1; dr <= 1; dr += 1) {
        for (let dc = -1; dc <= 1; dc += 1) {
          if (dr !== 0 || dc !== 0) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
              result.push((nr * this.cols) + nc);
            }
          }
        }
      }
      return result;
    },
    computeAdjacents() {
      for (let i = 0; i < this.board.length; i += 1) {
        const cell = this.board[i];
        cell.adjacent = this.neighbors(i).filter(n => this.board[n].mine).length;
      }
    },
    onCellDown(e) {
      if (e.button === 0 && !this.gameOver) this.pressing = true;
    },
    onDocMouseUp() {
      this.pressing = false;
    },
    onCellClick(i) {
      if (this.gameOver) return;
      if (this.flagMode) { this.cycleMark(i); return; }
      const cell = this.board[i];
      if (cell.revealed) {
        this.chord(i);
        return;
      }
      if (cell.mark === 1) return;
      if (!this.started) this.handleFirstClick(i);
      if (cell.mine) {
        this.loseGame(i);
        return;
      }
      this.floodReveal(i);
      this.$emit('sound', 'reveal');
      this.checkWin();
    },
    onCellRightClick(i) {
      this.cycleMark(i);
    },
    handleFirstClick(i) {
      this.started = true;
      // Generate after the opening move so its entire neighborhood is safe.
      this.placeMines([i, ...this.neighbors(i)]);
      this.computeAdjacents();
      this.startTimer();
    },
    cycleMark(i) {
      if (this.gameOver) return;
      const cell = this.board[i];
      if (cell.revealed) return;
      cell.mark = (cell.mark + 1) % 3;
      if (cell.mark === 1) this.$emit('sound', 'flag');
    },
    floodReveal(start) {
      const stack = [start];
      while (stack.length) {
        const i = stack.pop();
        const cell = this.board[i];
        if (!cell.revealed && cell.mark !== 1 && !cell.mine) {
          cell.revealed = true;
          cell.mark = 0;
          if (cell.adjacent === 0) {
            const nbs = this.neighbors(i);
            for (let k = 0; k < nbs.length; k += 1) {
              if (!this.board[nbs[k]].revealed) stack.push(nbs[k]);
            }
          }
        }
      }
    },
    chord(i) {
      const cell = this.board[i];
      if (!cell.revealed || cell.adjacent === 0) return;
      const nbs = this.neighbors(i);
      const flags = nbs.filter(n => this.board[n].mark === 1).length;
      if (flags !== cell.adjacent) return;
      const targets = nbs.filter(n => !this.board[n].revealed && this.board[n].mark !== 1);
      if (!targets.length) return;
      const mineHit = targets.find(n => this.board[n].mine);
      if (mineHit !== undefined) {
        this.loseGame(mineHit);
        return;
      }
      for (let k = 0; k < targets.length; k += 1) {
        this.floodReveal(targets[k]);
      }
      this.$emit('sound', 'reveal');
      this.checkWin();
    },
    loseGame(i) {
      this.lost = true;
      this.boomIndex = i;
      this.pressing = false;
      this.stopTimer();
      for (let j = 0; j < this.board.length; j += 1) {
        const cell = this.board[j];
        if (cell.mine && cell.mark !== 1) cell.revealed = true;
      }
      this.$emit('sound', 'boom');
    },
    checkWin() {
      if (this.board.some(cell => !cell.mine && !cell.revealed)) return;
      this.won = true;
      if (!this.best || this.time < this.best) {
        this.best = Math.max(1, this.time);
        safeStorage.setItem('minesweeper-best-' + this.difficulty, String(this.best));
      }
      this.pressing = false;
      this.stopTimer();
      for (let j = 0; j < this.board.length; j += 1) {
        const cell = this.board[j];
        if (cell.mine) cell.mark = 1;
      }
      this.$emit('sound', 'win');
    },
    onTouchStart(i, e) {
      if (this.gameOver) return;
      this.longPressFired = false;
      const cell = this.board[i];
      if (cell.revealed) return;
      this.pressing = true;
      clearTimeout(this.touchTimer);
      this.touchTimer = setTimeout(() => {
        this.longPressFired = true;
        this.pressing = false;
        this.cycleMark(i);
      }, LONG_PRESS_MS);
      if (e.touches.length > 1) this.onTouchMove();
    },
    onTouchEnd(e) {
      clearTimeout(this.touchTimer);
      this.pressing = false;
      // Suppress the synthetic click after a long-press flag
      if (this.longPressFired) e.preventDefault();
    },
    onTouchMove() {
      clearTimeout(this.touchTimer);
      this.pressing = false;
    },
    startTimer() {
      this.timerId = setInterval(() => {
        if (this.time < 999) this.time += 1;
      }, 1000);
    },
    stopTimer() {
      clearInterval(this.timerId);
      this.timerId = null;
    },
    formatLed(n) {
      const v = Math.max(-99, Math.min(999, n));
      if (v < 0) return `-${`0${-v}`.slice(-2)}`;
      return `00${v}`.slice(-3);
    },
    cellContent(cell) {
      if (this.lost && cell.mine && cell.mark !== 1) return '💣';
      if (this.lost && !cell.mine && cell.mark === 1) return '❌';
      if (!cell.revealed && cell.mark === 1) return '🚩';
      if (!cell.revealed && cell.mark === 2) return '?';
      if (cell.revealed && !cell.mine && cell.adjacent > 0) return String(cell.adjacent);
      return '';
    },
    cellClass(cell, i) {
      const classes = [];
      if (cell.revealed) classes.push('revealed');
      if (cell.mark !== 0 && !cell.revealed) classes.push('marked');
      if (i === this.boomIndex) classes.push('boom');
      if (cell.revealed && !cell.mine && cell.adjacent > 0) classes.push(`n${cell.adjacent}`);
      if (SYMBOLS.indexOf(this.cellContent(cell)) !== -1) classes.push('sym');
      return classes;
    },
  },
};
</script>

<style scoped>
.minesweeper {
  display: inline-block;
  background: #c0c0c0;
  padding: 6px;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  font-family: 'MS Sans Serif', 'Segoe UI', Tahoma, sans-serif;
  font-size: 11px;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}
.ms-toolbar { display: flex; gap: 8px; margin-bottom: 8px; }
.ms-toolbar select { flex: 1; min-width: 0; color: #111; background: white; font: inherit; min-height: 28px; }
.ms-toolbar button { min-width: 32px; border-radius: 0; }
.ms-toolbar button[aria-pressed="true"] { background: #fff2a8; border-style: inset; }
.ms-status { display: flex; justify-content: space-between; gap: 8px; padding-top: 8px; color: #111; font-size: 11px; }

/* Header: mine counter, smiley, timer */
.ms-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 5px;
  margin-bottom: 6px;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
}

.ms-led {
  min-width: 33px;
  padding: 1px 2px;
  background: #000000;
  color: #ff0000;
  font-family: 'Courier New', monospace;
  font-size: 16px;
  font-weight: bold;
  line-height: 18px;
  letter-spacing: 0;
  text-align: center;
  border: 1px solid;
  border-color: #808080 #ffffff #ffffff #808080;
}

.ms-face {
  width: 26px;
  height: 26px;
  padding: 0 0 1px 0;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #404040 #404040 #ffffff;
  outline: 1px solid #808080;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ms-face:active {
  border-color: #404040 #ffffff #ffffff #404040;
}

/* Minefield */
.ms-grid {
  display: grid;
  grid-template-columns: repeat(9, 24px);
  grid-auto-rows: 24px;
  border: 3px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  width: max-content;
  box-sizing: content-box;
}

.ms-cell {
  width: 24px;
  height: 24px;
  min-width: 0;
  min-height: 0;
  padding: 0;
  border-radius: 0;
  color: #111;
  box-sizing: border-box;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: bold;
  line-height: 1;
  overflow: hidden;
}

.ms-cell:not(.revealed):not(.marked):active {
  border: 1px solid #c0c0c0;
  border-top-color: #808080;
  border-left-color: #808080;
}

.ms-cell.revealed {
  border: 1px solid #c0c0c0;
  border-top-color: #808080;
  border-left-color: #808080;
}

.ms-cell.boom {
  background: #ff0000;
}

.ms-cell.sym {
  font-size: 13px;
}

/* Classic number colors */
.ms-cell.n1 { color: #0000ff; }
.ms-cell.n2 { color: #008000; }
.ms-cell.n3 { color: #ff0000; }
.ms-cell.n4 { color: #000080; }
.ms-cell.n5 { color: #800000; }
.ms-cell.n6 { color: #008080; }
.ms-cell.n7 { color: #000000; }
.ms-cell.n8 { color: #808080; }
</style>
