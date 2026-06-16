<template>
  <div class="code-hop" :class="{ embedded }" ref="gameContainer">
    <canvas
      ref="canvas"
      @mousedown.prevent="handlePress"
      @touchstart.prevent="handlePress"
    ></canvas>

    <div class="hop-hud">
      <div class="hud-left">
        <button class="hud-button" @click.stop="togglePause">
          {{ gameState === 'paused' ? 'RESUME' : 'MENU' }}
        </button>
        <span class="hint">SPACE / TAP</span>
      </div>
      <div class="hud-stats">
        <div>CODE HOP</div>
        <div>SCORE: {{ score }}</div>
        <div>SPEED: {{ speedLabel }}</div>
        <div>STREAK: {{ streak }}</div>
        <div class="best">BEST: {{ bestScore }}</div>
      </div>
    </div>

    <div v-if="gameState !== 'playing'" class="overlay">
      <div class="panel">
        <div class="panel-kicker">claude-code-inspired arcade</div>
        <h1>CODE HOP</h1>
        <p v-if="gameState === 'ready'">
          Jump the little code companion through syntax hoops. It gets faster
          until your timing gives out.
        </p>
        <p v-else-if="gameState === 'paused'">Paused. The build can wait.</p>
        <p v-else>
          Crash at {{ score }} points, speed {{ speedLabel }}. Ship another run.
        </p>
        <div class="panel-actions">
          <button class="primary" @click="startGame">
            {{ gameState === 'gameover' ? 'RUN AGAIN' : 'START RUN' }}
          </button>
          <button v-if="gameState === 'paused'" @click="resumeGame">RESUME</button>
        </div>
      </div>
    </div>

    <div class="floating-btns" v-if="!embedded">
      <router-link to="/windows95" class="floating-btn">win95</router-link>
      <router-link to="/space" class="floating-btn">space</router-link>
      <router-link to="/terminal" class="floating-btn">terminal</router-link>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-mixed-operators, no-param-reassign */
const CODE_SNIPPETS = [
  'claude --continue',
  'npm run build',
  'await jump()',
  'git diff --staged',
  '<hoop />',
  'const speed++',
  'ship it',
  'ctx.arc()',
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const roundedRect = (ctx, x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

export default {
  name: 'CodeHopHome',

  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      canvas: null,
      ctx: null,
      width: 0,
      height: 0,
      groundY: 0,
      animationId: null,
      resizeObserver: null,
      lastTime: 0,
      elapsed: 0,
      gameState: 'ready',
      score: 0,
      bestScore: 0,
      speed: 330,
      streak: 0,
      spawnTimer: 0,
      nextSpawn: 1,
      mascot: null,
      hoops: [],
      particles: [],
      codeBits: [],
    };
  },

  computed: {
    speedLabel() {
      return `${Math.round(this.speed / 10)}x`;
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.init();
    });
  },

  beforeDestroy() {
    this.cleanup();
  },

  methods: {
    init() {
      this.canvas = this.$refs.canvas;
      this.ctx = this.canvas.getContext('2d');
      this.bestScore = parseInt(localStorage.getItem('codeHopBest') || '0', 10);

      if (!this.embedded) {
        document.body.style.overflow = 'hidden';
        document.body.style.margin = '0';
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.margin = '0';
      }

      this.resize();
      window.addEventListener('resize', this.resize);
      window.addEventListener('keydown', this.onKeyDown);

      if (this.embedded && typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.$refs.gameContainer);
      }

      this.resetRun(false);
      this.animationId = requestAnimationFrame(this.gameLoop);
    },

    cleanup() {
      if (this.animationId) cancelAnimationFrame(this.animationId);
      window.removeEventListener('resize', this.resize);
      window.removeEventListener('keydown', this.onKeyDown);
      if (this.resizeObserver) this.resizeObserver.disconnect();

      if (!this.embedded) {
        document.body.style.overflow = '';
        document.body.style.margin = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.margin = '';
      }
    },

    resize() {
      const container = this.$refs.gameContainer;
      this.width = this.embedded ? container.clientWidth || 860 : window.innerWidth;
      this.height = this.embedded ? container.clientHeight || 560 : window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.groundY = Math.max(260, this.height - clamp(this.height * 0.18, 76, 132));

      if (this.mascot) {
        this.mascot.x = clamp(this.width * 0.22, 120, 260);
        this.mascot.y = Math.min(this.mascot.y, this.groundY - this.mascot.height / 2);
      }
      if (!this.codeBits.length) this.createCodeBits();
    },

    resetRun(makeReady) {
      const scale = clamp(this.width / 1200, 0.72, 1.08);
      this.score = 0;
      this.speed = 330;
      this.streak = 0;
      this.spawnTimer = 0.7;
      this.nextSpawn = 1;
      this.elapsed = 0;
      this.hoops = [];
      this.particles = [];
      this.lastTime = 0;
      this.mascot = {
        x: clamp(this.width * 0.22, 120, 260),
        y: this.groundY - 37 * scale,
        vy: 0,
        width: 56 * scale,
        height: 74 * scale,
        grounded: true,
        squash: 1,
      };
      if (makeReady) this.gameState = 'ready';
      this.createCodeBits();
    },

    createCodeBits() {
      this.codeBits = [];
      for (let i = 0; i < 26; i += 1) {
        this.codeBits.push({
          x: Math.random() * Math.max(this.width, 1),
          y: 38 + Math.random() * Math.max(this.groundY - 110, 80),
          text: CODE_SNIPPETS[i % CODE_SNIPPETS.length],
          speed: 14 + Math.random() * 42,
          alpha: 0.12 + Math.random() * 0.22,
        });
      }
    },

    startGame() {
      this.resetRun(false);
      this.gameState = 'playing';
    },

    resumeGame() {
      this.gameState = 'playing';
      this.lastTime = 0;
    },

    togglePause() {
      if (this.gameState === 'playing') {
        this.gameState = 'paused';
      } else if (this.gameState === 'paused') {
        this.resumeGame();
      }
    },

    handlePress() {
      if (this.gameState === 'ready' || this.gameState === 'gameover') {
        this.startGame();
        return;
      }
      if (this.gameState === 'paused') {
        this.resumeGame();
        return;
      }
      this.jump();
    },

    onKeyDown(event) {
      const key = event.key;
      if (key === ' ' || key === 'ArrowUp' || key === 'w' || key === 'W') {
        event.preventDefault();
        this.handlePress();
      } else if (key === 'p' || key === 'P' || key === 'Escape') {
        this.togglePause();
      } else if (key === 'r' || key === 'R') {
        this.startGame();
      }
    },

    jump() {
      if (!this.mascot || !this.mascot.grounded) return;
      const scale = clamp(this.height / 720, 0.8, 1.1);
      this.mascot.vy = -760 * scale;
      this.mascot.grounded = false;
      this.mascot.squash = 0.78;
      this.emitParticles(this.mascot.x - 8, this.groundY - 8, '#ffad62', 12);
    },

    gameLoop(currentTime = 0) {
      this.animationId = requestAnimationFrame(this.gameLoop);
      if (!this.lastTime) {
        this.lastTime = currentTime;
        this.render();
        return;
      }

      const dt = clamp((currentTime - this.lastTime) / 1000, 0, 0.05);
      this.lastTime = currentTime;
      this.elapsed += dt;
      this.updateAmbient(dt);
      if (this.gameState === 'playing') this.updateGame(dt);
      this.render();
    },

    updateAmbient(dt) {
      this.codeBits.forEach((bit) => {
        bit.x -= bit.speed * dt;
        if (bit.x < -180) {
          bit.x = this.width + Math.random() * 160;
          bit.y = 38 + Math.random() * Math.max(this.groundY - 110, 80);
          bit.text = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
        }
      });

      for (let i = this.particles.length - 1; i >= 0; i -= 1) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 360 * dt;
        p.life -= dt;
        if (p.life <= 0) this.particles.splice(i, 1);
      }
    },

    updateGame(dt) {
      const gravity = 1850;
      this.speed = Math.min(940, this.speed + dt * (8 + this.score / 260));
      this.score += Math.floor(dt * this.speed * 0.11);

      this.mascot.vy += gravity * dt;
      this.mascot.y += this.mascot.vy * dt;
      const floorY = this.groundY - this.mascot.height / 2;
      if (this.mascot.y >= floorY) {
        if (!this.mascot.grounded) {
          this.emitParticles(this.mascot.x - 10, this.groundY - 6, '#55f7dc', 8);
        }
        this.mascot.y = floorY;
        this.mascot.vy = 0;
        this.mascot.grounded = true;
        this.mascot.squash = Math.min(1.18, this.mascot.squash + dt * 3.5);
      } else {
        this.mascot.squash = Math.min(1, this.mascot.squash + dt * 2);
      }

      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnHoop();
        this.spawnTimer = this.nextSpawn;
        this.nextSpawn = Math.max(0.72, 1.5 - this.speed / 950 + Math.random() * 0.25);
      }

      for (let i = this.hoops.length - 1; i >= 0; i -= 1) {
        const hoop = this.hoops[i];
        hoop.x -= this.speed * dt;
        hoop.spin += dt * (1.6 + this.speed / 360);

        if (this.hitsHoop(hoop)) {
          this.endRun();
          return;
        }

        if (!hoop.scored && hoop.x < this.mascot.x + this.mascot.width * 0.12) {
          if (!this.passedThroughHoop(hoop)) {
            this.endRun();
            return;
          }
          hoop.scored = true;
          this.streak += 1;
          this.score += 80 + this.streak * 15;
          this.emitParticles(hoop.x, hoop.y, '#56f7d8', 18);
        }

        if (hoop.x < -hoop.radius - 80) this.hoops.splice(i, 1);
      }
    },

    spawnHoop() {
      const radius = clamp(this.height * 0.073, 34, 58);
      const offset = 82 + Math.random() * clamp(this.height * 0.08, 26, 74);
      this.hoops.push({
        x: this.width + radius + 40,
        y: this.groundY - offset,
        radius,
        inner: radius - 15,
        band: 15,
        spin: Math.random() * Math.PI,
        scored: false,
      });
    },

    hitsHoop(hoop) {
      const contact = this.getHoopContact(hoop);
      if (!contact.overlapsX) return false;
      return contact.distance > contact.opening && contact.distance < contact.outer;
    },

    passedThroughHoop(hoop) {
      const contact = this.getHoopContact(hoop);
      return contact.distance <= contact.opening;
    },

    getHoopContact(hoop) {
      const hitX = this.mascot.x + this.mascot.width * 0.08;
      const hitY = this.mascot.y - this.mascot.height * 0.02;
      const dx = hitX - hoop.x;
      const dy = hitY - hoop.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return {
        distance,
        opening: hoop.inner + this.mascot.width * 0.08,
        outer: hoop.radius + this.mascot.width * 0.16,
        overlapsX: Math.abs(dx) <= hoop.radius + this.mascot.width * 0.24,
      };
    },

    endRun() {
      this.gameState = 'gameover';
      this.emitParticles(this.mascot.x, this.mascot.y, '#ff6f3d', 28);
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem('codeHopBest', String(this.bestScore));
      }
    },

    emitParticles(x, y, color, count) {
      for (let i = 0; i < count; i += 1) {
        this.particles.push({
          x,
          y,
          vx: -80 - Math.random() * 240,
          vy: -80 - Math.random() * 240,
          size: 2 + Math.random() * 5,
          color,
          life: 0.35 + Math.random() * 0.45,
        });
      }
    },

    render() {
      if (!this.ctx) return;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);
      this.drawBackground(ctx);
      this.hoops.forEach(hoop => this.drawHoop(ctx, hoop));
      this.drawGround(ctx);
      this.drawParticles(ctx);
      this.drawMascot(ctx);
      if (this.gameState === 'ready') this.drawGhostHoops(ctx);
    },

    drawBackground(ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
      gradient.addColorStop(0, '#120f0c');
      gradient.addColorStop(0.55, '#17131c');
      gradient.addColorStop(1, '#241711');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.save();
      ctx.font = `${clamp(this.width * 0.012, 11, 16)}px "Courier New", monospace`;
      this.codeBits.forEach((bit) => {
        ctx.globalAlpha = bit.alpha;
        ctx.fillStyle = bit.text.indexOf('claude') >= 0 ? '#ffb36c' : '#62f6d8';
        ctx.fillText(bit.text, bit.x, bit.y);
      });
      ctx.restore();

      ctx.strokeStyle = 'rgba(255, 177, 100, 0.1)';
      ctx.lineWidth = 1;
      for (let x = (this.elapsed * -this.speed * 0.08) % 72; x < this.width; x += 72) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - this.width * 0.16, this.groundY);
        ctx.stroke();
      }
    },

    drawGround(ctx) {
      const scroll = (this.elapsed * this.speed) % 60;
      ctx.fillStyle = '#0d0b0a';
      ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
      ctx.strokeStyle = '#ff9f43';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, this.groundY);
      ctx.lineTo(this.width, this.groundY);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(86, 247, 216, 0.34)';
      ctx.lineWidth = 1;
      for (let x = -scroll; x < this.width + 80; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, this.groundY);
        ctx.lineTo(x + 34, this.height);
        ctx.stroke();
      }
    },

    drawHoop(ctx, hoop) {
      ctx.save();
      ctx.translate(hoop.x, hoop.y);
      ctx.rotate(Math.sin(hoop.spin) * 0.08);
      ctx.shadowColor = '#56f7d8';
      ctx.shadowBlur = 16;
      ctx.lineWidth = hoop.band;
      const gradient = ctx.createLinearGradient(-hoop.radius, 0, hoop.radius, 0);
      gradient.addColorStop(0, '#56f7d8');
      gradient.addColorStop(0.55, '#fff1c8');
      gradient.addColorStop(1, '#ff914d');
      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, hoop.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(20, 14, 12, 0.9)';
      ctx.beginPath();
      ctx.arc(0, 0, hoop.inner, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = `${Math.max(10, hoop.radius * 0.24)}px "Courier New", monospace`;
      ctx.fillStyle = '#fff1c8';
      ctx.fillText('</>', -hoop.radius * 0.32, 4);
      ctx.restore();
    },

    drawGhostHoops(ctx) {
      ctx.save();
      ctx.globalAlpha = 0.32;
      for (let i = 0; i < 3; i += 1) {
        this.drawHoop(ctx, {
          x: this.width * (0.55 + i * 0.18),
          y: this.groundY - 100 - i * 8,
          radius: 42,
          inner: 27,
          band: 15,
          spin: this.elapsed + i,
        });
      }
      ctx.restore();
    },

    drawMascot(ctx) {
      if (!this.mascot) return;
      const m = this.mascot;
      const run = Math.sin(this.elapsed * this.speed * 0.035);
      const squashX = 1 + (1 - m.squash) * 0.35;
      const squashY = m.squash;

      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.scale(squashX, squashY);
      ctx.rotate(clamp(m.vy / 1700, -0.28, 0.18));

      ctx.strokeStyle = '#2a1a13';
      ctx.lineWidth = 3;
      ctx.fillStyle = '#f7b267';
      roundedRect(ctx, -m.width * 0.48, -m.height * 0.42, m.width * 0.92, m.height * 0.78, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff0d2';
      roundedRect(ctx, -m.width * 0.34, -m.height * 0.3, m.width * 0.58, m.height * 0.38, 11);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1b1714';
      roundedRect(ctx, -m.width * 0.24, -m.height * 0.22, m.width * 0.38, m.height * 0.2, 5);
      ctx.fill();

      ctx.fillStyle = '#56f7d8';
      ctx.fillRect(-m.width * 0.17, -m.height * 0.15, 5, 5);
      ctx.fillRect(m.width * 0.02, -m.height * 0.15, 5, 5);

      ctx.strokeStyle = '#ff914d';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-m.width * 0.28, -m.height * 0.43);
      ctx.lineTo(-m.width * 0.42, -m.height * 0.66);
      ctx.moveTo(m.width * 0.15, -m.height * 0.44);
      ctx.lineTo(m.width * 0.12, -m.height * 0.68);
      ctx.stroke();

      ctx.strokeStyle = '#2a1a13';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-m.width * 0.2, m.height * 0.36);
      ctx.lineTo(-m.width * 0.32, m.height * (0.5 + run * 0.08));
      ctx.moveTo(m.width * 0.16, m.height * 0.35);
      ctx.lineTo(m.width * 0.3, m.height * (0.5 - run * 0.08));
      ctx.stroke();

      ctx.restore();
    },

    drawParticles(ctx) {
      this.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = clamp(p.life * 2, 0, 1);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      });
    },
  },
};
</script>

<style scoped>
.code-hop {
  position: fixed;
  inset: 0;
  /* Compensate for body zoom: 0.9 - Chrome calculates viewport units before zoom is applied */
  width: calc(100vw / 0.9);
  height: calc(100vh / 0.9);
  overflow: hidden;
  background: #120f0c;
  color: #fff1c8;
  font-family: 'Courier New', monospace;
}

.code-hop.embedded {
  position: relative;
  width: 100%;
  height: 100%;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.hop-hud {
  position: absolute;
  top: 18px;
  left: 18px;
  right: 18px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: none;
  text-shadow: 0 0 12px rgba(86, 247, 216, 0.35);
}

.hud-left,
.hud-stats {
  pointer-events: auto;
}

.hud-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hud-button,
.panel button,
.floating-btn {
  border: 2px solid #56f7d8;
  background: rgba(18, 15, 12, 0.72);
  color: #56f7d8;
  font-family: inherit;
  font-weight: bold;
  letter-spacing: 0;
  cursor: pointer;
}

.hud-button {
  padding: 9px 14px;
}

.hint {
  color: rgba(255, 241, 200, 0.62);
  font-size: 13px;
}

.hud-stats {
  min-width: 176px;
  text-align: right;
  color: #56f7d8;
  font-size: clamp(14px, 2.1vw, 24px);
  font-weight: bold;
  line-height: 1.32;
}

.hud-stats > div:first-child,
.best {
  color: #ffb36c;
}

.overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: auto;
  background: radial-gradient(circle at 50% 45%, rgba(255, 145, 77, 0.16), transparent 42%);
}

.panel {
  width: min(520px, calc(100vw - 40px));
  border: 2px solid rgba(255, 179, 108, 0.74);
  background: rgba(18, 15, 12, 0.88);
  box-shadow: 0 0 24px rgba(255, 145, 77, 0.24);
  padding: 26px;
  text-align: center;
}

.panel-kicker {
  color: #56f7d8;
  font-size: 13px;
  text-transform: uppercase;
}

.panel h1 {
  margin: 8px 0 10px;
  color: #ffb36c;
  font-size: clamp(40px, 7vw, 78px);
  line-height: 0.95;
}

.panel p {
  margin: 0 auto 20px;
  max-width: 390px;
  color: rgba(255, 241, 200, 0.78);
  line-height: 1.45;
}

.panel-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.panel button {
  padding: 11px 16px;
}

.panel button.primary {
  border-color: #ffb36c;
  color: #18120e;
  background: #ffb36c;
}

.floating-btns {
  position: absolute;
  left: 18px;
  bottom: 18px;
  display: flex;
  gap: 10px;
}

.floating-btn {
  padding: 8px 10px;
  text-decoration: none;
  font-size: 12px;
}

@media (max-width: 700px) {
  .hop-hud {
    top: 12px;
    left: 12px;
    right: 12px;
  }

  .hint {
    display: none;
  }

  .hud-stats {
    font-size: 13px;
  }
}
</style>
