<template>
  <div
    class="code-hop"
    :class="{ embedded }"
    ref="gameContainer"
    :data-state="gameState"
    :data-airborne="player ? String(!player.grounded) : 'false'"
    :data-score="score"
  >
    <canvas
      ref="canvas"
      @mousedown.prevent="handlePress"
      @touchstart.prevent="handlePress"
    ></canvas>

    <div class="hop-hud">
      <div class="hud-brand">
        <span class="claude-mark" aria-hidden="true"></span>
        <div>
          <strong>CLAUDE HOPS</strong>
          <span>WORLD {{ worldLabel }}</span>
        </div>
      </div>

      <div class="hud-stats">
        <span>SCORE: {{ score }}</span>
        <span>SPEED: {{ speedLabel }}</span>
        <span>BEST: {{ bestScore }}</span>
      </div>

      <button class="hud-button" @click.stop="toggleSound">
        {{ soundOn ? 'SND ON' : 'SND OFF' }}
      </button>

      <button class="hud-button" @click.stop="togglePause">
        {{ gameState === 'paused' ? 'RESUME' : 'MENU' }}
      </button>
    </div>

    <button
      v-if="isTouch && gameState === 'playing'"
      class="touch-jump"
      @touchstart.prevent="handlePress"
      @mousedown.prevent="handlePress"
    >
      HOP
    </button>

    <div v-if="gameState !== 'playing'" class="overlay">
      <div class="panel">
        <div class="panel-kicker">CLAUDE CODE PRESENTS</div>
        <h1>CLAUDE HOPS</h1>
        <p v-if="gameState === 'ready'">
          WORLD 1-1 / BUG BLOCK ROAD<br>
          {{ hopHint }}
          <span v-if="bestScore > 0"><br>BEST: {{ bestScore }}</span>
        </p>
        <p v-else-if="gameState === 'paused'">PAUSED / FLOPPY STILL SPINNING</p>
        <p v-else>
          CRASH AT {{ score }} / BEST {{ bestScore }}
          <span v-if="newBest" class="new-best">NEW BEST!</span>
        </p>
        <div class="panel-actions">
          <button class="primary" @click="startGame">
            {{ gameState === 'gameover' ? 'TRY AGAIN' : 'START' }}
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
import claudeHopsSprite from '@/assets/codehop/claude-hops-mascot.png';

const BEST_SCORE_KEY = 'claudeHopsBest';
const SOUND_KEY = 'claudeHopsSound';

const readStorage = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    return null;
  }
};

const writeStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    // Storage unavailable (private mode); play on without persistence.
  }
};

const OBSTACLE_TYPES = [
  {
    id: 'bug',
    label: 'BUG',
    width: 48,
    height: 42,
    color: '#8f3f2f',
    light: '#cf6b3f',
    dark: '#432016',
  },
  {
    id: 'todo',
    label: 'TODO',
    width: 66,
    height: 36,
    color: '#be7d3b',
    light: '#e2ab62',
    dark: '#50311f',
  },
  {
    id: 'pipe',
    label: '',
    width: 48,
    height: 58,
    color: '#3c8d65',
    light: '#74c68d',
    dark: '#204b3a',
  },
  {
    id: 'merge',
    label: 'MERGE',
    width: 58,
    height: 48,
    color: '#5b5f95',
    light: '#8d91c9',
    dark: '#252744',
  },
];

const FLYER_TYPE = {
  id: 'flyer',
  label: '404',
  width: 54,
  height: 34,
  color: '#7d4b8f',
  light: '#b07fc4',
  dark: '#3a2144',
};

const DUST_COLORS = ['#d49b57', '#f1cf8d'];
const SPARK_COLORS = ['#ffdf7e', '#fff6dc', '#f5c542'];
const PUFF_COLORS = ['#dfe8ef', '#9fb8d8'];
const CRASH_COLORS = ['#b95130', '#e8dcc0', '#3f2419'];

const CLOUDS = [
  { x: 70, y: 80, width: 88, speed: 0.14 },
  { x: 310, y: 42, width: 70, speed: 0.1 },
  { x: 570, y: 96, width: 110, speed: 0.12 },
  { x: 860, y: 58, width: 84, speed: 0.08 },
  { x: 1130, y: 118, width: 96, speed: 0.11 },
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const overlaps = (a, b) => (
  a.x < b.x + b.width
  && a.x + a.width > b.x
  && a.y < b.y + b.height
  && a.y + a.height > b.y
);

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
      dpr: 1,
      scale: 1,
      tile: 28,
      groundY: 0,
      animationId: null,
      resizeObserver: null,
      lastTime: 0,
      elapsed: 0,
      floorOffset: 0,
      gameState: 'ready',
      score: 0,
      bestScore: 0,
      newBest: false,
      speed: 225,
      passed: 0,
      tokens: 0,
      spawnTimer: 1.25,
      shakeTime: 0,
      soundOn: true,
      isTouch: false,
      player: null,
      spriteImage: null,
      spriteLoaded: false,
      obstacles: [],
      clouds: [],
      particles: [],
      coins: [],
      popups: [],
    };
  },

  computed: {
    speedLabel() {
      return `${Math.round(this.speed / 18)}`;
    },

    worldLabel() {
      return `1-${clamp(Math.floor(this.elapsed / 28) + 1, 1, 4)}`;
    },

    hopHint() {
      return this.isTouch
        ? 'TAP TO HOP / TAP MID-AIR TO DOUBLE HOP'
        : 'SPACE TO HOP / AGAIN MID-AIR TO DOUBLE HOP';
    },
  },

  created() {
    this.audioCtx = null;
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
      this.bestScore = parseInt(readStorage(BEST_SCORE_KEY) || '0', 10);
      this.soundOn = readStorage(SOUND_KEY) !== 'off';
      this.isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
      this.loadSprite();

      if (!this.embedded) {
        document.body.style.overflow = 'hidden';
        document.body.style.margin = '0';
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.margin = '0';
      }

      this.resize();
      this.resetRun(true);
      window.addEventListener('resize', this.resize);
      window.addEventListener('keydown', this.onKeyDown);
      window.addEventListener('blur', this.resetFrameClock);
      document.addEventListener('visibilitychange', this.onVisibilityChange);

      if (this.embedded && typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.$refs.gameContainer);
      }

      this.animationId = requestAnimationFrame(this.gameLoop);
    },

    loadSprite() {
      const image = new Image();
      image.onload = () => {
        this.spriteLoaded = true;
      };
      image.src = claudeHopsSprite;
      this.spriteImage = image;
    },

    cleanup() {
      if (this.animationId) cancelAnimationFrame(this.animationId);
      window.removeEventListener('resize', this.resize);
      window.removeEventListener('keydown', this.onKeyDown);
      window.removeEventListener('blur', this.resetFrameClock);
      document.removeEventListener('visibilitychange', this.onVisibilityChange);
      if (this.resizeObserver) this.resizeObserver.disconnect();

      if (this.audioCtx) {
        this.audioCtx.close();
        this.audioCtx = null;
      }

      if (!this.embedded) {
        document.body.style.overflow = '';
        document.body.style.margin = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.margin = '';
      }
    },

    resize() {
      const container = this.$refs.gameContainer;
      this.width = this.embedded ? container.clientWidth || 900 : window.innerWidth / 0.9;
      this.height = this.embedded ? container.clientHeight || 650 : window.innerHeight / 0.9;
      this.dpr = clamp(window.devicePixelRatio || 1, 1, 2);
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.ctx.imageSmoothingEnabled = false;

      const oldGround = this.groundY || this.height;
      this.scale = clamp(Math.min(this.width / 1050, this.height / 650), 0.72, 1.18);
      this.tile = Math.max(20, Math.round(30 * this.scale));
      this.groundY = this.height - clamp(this.height * 0.18, 86, 132);

      if (this.player) {
        const distanceAboveGround = Math.max(0, oldGround - (this.player.y + this.player.height));
        const wasGrounded = this.player.grounded;
        this.player.width = 66 * this.scale;
        this.player.height = 54 * this.scale;
        this.player.x = clamp(this.width * 0.18, 78, 172);
        this.player.y = wasGrounded
          ? this.groundY - this.player.height
          : this.groundY - this.player.height - distanceAboveGround;
      }

      this.obstacles.forEach((obstacle) => {
        obstacle.width = obstacle.type.width * this.scale;
        obstacle.height = obstacle.type.height * this.scale;
        obstacle.y = obstacle.flying
          ? this.groundY - obstacle.altitude * this.scale - obstacle.height
          : this.groundY - obstacle.height;
      });

      this.coins.forEach((coin) => {
        coin.size = 18 * this.scale;
        coin.y = this.groundY - coin.altitude * this.scale;
      });

      this.createClouds();
    },

    resetRun(makeReady) {
      this.elapsed = 0;
      this.floorOffset = 0;
      this.score = 0;
      this.newBest = false;
      this.speed = 225;
      this.passed = 0;
      this.tokens = 0;
      this.spawnTimer = 1.35;
      this.shakeTime = 0;
      this.lastTime = 0;
      this.obstacles = [];
      this.particles = [];
      this.coins = [];
      this.popups = [];
      this.player = {
        x: clamp(this.width * 0.18, 78, 172),
        y: this.groundY - 54 * this.scale,
        width: 66 * this.scale,
        height: 54 * this.scale,
        velocityY: 0,
        grounded: true,
        runFrame: 0,
        jumpsUsed: 0,
        stretch: 1,
      };
      this.createClouds();
      if (makeReady) this.gameState = 'ready';
    },

    createClouds() {
      const wrap = Math.max(this.width, 1);
      this.clouds = CLOUDS.map((cloud, index) => ({
        x: (cloud.x * this.scale + index * 37) % (wrap + 200),
        y: clamp(cloud.y * this.scale, 28, Math.max(40, this.groundY - 210)),
        width: cloud.width * this.scale,
        speed: cloud.speed,
      }));
    },

    gameLoop(timestamp) {
      if (!this.lastTime) this.lastTime = timestamp;
      const delta = clamp((timestamp - this.lastTime) / 1000, 0, 0.05);
      this.lastTime = timestamp;

      if (this.gameState === 'playing') {
        this.updateGame(delta);
      } else {
        this.updateIdle(delta);
      }

      if (this.shakeTime > 0) this.shakeTime = Math.max(0, this.shakeTime - delta);
      this.draw();
      this.animationId = requestAnimationFrame(this.gameLoop);
    },

    updateIdle(delta) {
      this.updateClouds(delta, 12);
      this.updateParticles(delta);
      this.updatePopups(delta);
    },

    updateGame(delta) {
      this.elapsed += delta;
      this.speed = clamp(225 + this.elapsed * 10 + this.passed * 8, 225, 540);
      this.floorOffset = (
        this.floorOffset + this.speed * 0.55 * delta
      ) % (this.tile * 2);

      this.updateClouds(delta, 48);
      this.updatePlayer(delta);
      this.updateObstacles(delta);
      this.updateCoins(delta);
      this.updateParticles(delta);
      this.updatePopups(delta);

      this.score = Math.max(
        0,
        Math.floor(this.elapsed * 9) + this.passed * 35 + this.tokens * 40,
      );
      this.collectCoins();
      this.checkCollisions();
    },

    updateClouds(delta, pace) {
      this.clouds.forEach((cloud) => {
        cloud.x -= pace * cloud.speed * delta;
        if (cloud.x + cloud.width < -20) {
          cloud.x = this.width + cloud.width + Math.random() * 120;
          cloud.y = clamp(
            36 + Math.random() * this.groundY * 0.28,
            28,
            this.groundY - 140,
          );
        }
      });
    },

    updatePlayer(delta) {
      const gravity = 1780 * this.scale;
      const player = this.player;
      player.runFrame += delta * this.speed * 0.045;
      player.velocityY += gravity * delta;
      player.y += player.velocityY * delta;

      if (player.y + player.height >= this.groundY) {
        const wasAirborne = !player.grounded;
        player.y = this.groundY - player.height;
        player.velocityY = 0;
        player.grounded = true;
        player.jumpsUsed = 0;
        if (wasAirborne) {
          player.stretch = 0.72;
          this.emitDust(player.x + player.width * 0.5, this.groundY, 8);
          this.playLand();
        }
      }

      const target = player.grounded
        ? 1
        : clamp(1 + Math.abs(player.velocityY) / 3200, 1, 1.18);
      player.stretch += (target - player.stretch) * clamp(delta * 12, 0, 1);
    },

    updateObstacles(delta) {
      this.spawnTimer -= delta;
      if (this.spawnTimer <= 0) {
        this.spawnObstacle();
        const cadence = clamp(1.32 - (this.speed - 225) / 520, 0.78, 1.32);
        this.spawnTimer = cadence + Math.random() * 0.35;
      }

      this.obstacles.forEach((obstacle) => {
        obstacle.x -= this.speed * delta;
        if (obstacle.flying) {
          obstacle.y = this.groundY - obstacle.altitude * this.scale - obstacle.height
            + Math.sin(this.elapsed * 3.2 + obstacle.phase) * 6 * this.scale;
        }
        if (!obstacle.passed && obstacle.x + obstacle.width < this.player.x) {
          obstacle.passed = true;
          this.passed += 1;
          this.emitDust(obstacle.x + obstacle.width, obstacle.y + obstacle.height, 5);
        }
      });

      this.obstacles = this.obstacles.filter(obstacle => obstacle.x + obstacle.width > -40);
    },

    updateCoins(delta) {
      this.coins.forEach((coin) => {
        coin.x -= this.speed * delta;
        coin.phase += delta * 6;
      });
      this.coins = this.coins.filter(coin => !coin.taken && coin.x > -40);
    },

    updatePopups(delta) {
      this.popups.forEach((popup) => {
        popup.life -= delta;
        popup.y -= 46 * this.scale * delta;
      });
      this.popups = this.popups.filter(popup => popup.life > 0);
    },

    updateParticles(delta) {
      this.particles.forEach((particle) => {
        particle.life -= delta;
        particle.x += particle.velocityX * delta;
        particle.y += particle.velocityY * delta;
        particle.velocityY += 500 * delta;
      });
      this.particles = this.particles.filter(particle => particle.life > 0);
    },

    spawnObstacle() {
      const flyerChance = clamp(0.1 + this.elapsed / 260, 0.1, 0.32);
      const flying = this.elapsed > 16 && Math.random() < flyerChance;
      const type = flying
        ? FLYER_TYPE
        : OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
      const width = type.width * this.scale;
      const height = type.height * this.scale;
      const last = this.obstacles[this.obstacles.length - 1];
      const minGap = clamp(210 * this.scale + this.speed * 0.18, 190, 310);
      const startX = Math.max(
        this.width + 34,
        last ? last.x + last.width + minGap : this.width + 80,
      );
      const altitude = flying ? 78 + Math.random() * 30 : 0;

      this.obstacles.push({
        type,
        x: startX,
        y: this.groundY - altitude * this.scale - height,
        width,
        height,
        passed: false,
        flying,
        altitude,
        phase: Math.random() * Math.PI * 2,
      });

      if (!flying && Math.random() < 0.5) this.spawnCoins(startX, width, type.height);
    },

    spawnCoins(obstacleX, obstacleWidth, obstacleHeight) {
      const count = 1 + Math.floor(Math.random() * 3);
      const centerX = obstacleX + obstacleWidth / 2;
      const baseAltitude = obstacleHeight + 64 + Math.random() * 26;

      for (let index = 0; index < count; index += 1) {
        const step = index - (count - 1) / 2;
        const altitude = baseAltitude - Math.abs(step) * 8;
        this.coins.push({
          x: centerX + step * 30 * this.scale,
          y: this.groundY - altitude * this.scale,
          altitude,
          size: 18 * this.scale,
          phase: Math.random() * Math.PI * 2,
          taken: false,
        });
      }
    },

    collectCoins() {
      const bounds = this.getPlayerBounds();
      this.coins.forEach((coin) => {
        if (coin.taken) return;
        const half = coin.size / 2;
        const coinBounds = {
          x: coin.x - half,
          y: coin.y - half,
          width: coin.size,
          height: coin.size,
        };
        if (overlaps(bounds, coinBounds)) {
          coin.taken = true;
          this.tokens += 1;
          this.emitDust(coin.x, coin.y, 8, SPARK_COLORS);
          this.popups.push({ x: coin.x, y: coin.y - coin.size, text: '+40', life: 0.8 });
          this.playCoin();
        }
      });
    },

    checkCollisions() {
      const playerBounds = this.getPlayerBounds();
      const hit = this.obstacles.some((obstacle) => {
        const inset = Math.max(3, 5 * this.scale);
        const obstacleBounds = {
          x: obstacle.x + inset,
          y: obstacle.y + inset,
          width: obstacle.width - inset * 2,
          height: obstacle.height - inset,
        };
        return overlaps(playerBounds, obstacleBounds);
      });

      if (hit) this.endGame();
    },

    getPlayerBounds() {
      const player = this.player;
      return {
        x: player.x + player.width * 0.16,
        y: player.y + player.height * 0.1,
        width: player.width * 0.68,
        height: player.height * 0.82,
      };
    },

    startGame() {
      this.resetRun(false);
      this.gameState = 'playing';
      this.resetFrameClock();
      this.emitDust(this.player.x + this.player.width * 0.4, this.groundY, 10);
      this.playStart();
    },

    resumeGame() {
      if (this.gameState === 'paused') {
        this.gameState = 'playing';
        this.resetFrameClock();
      }
    },

    togglePause() {
      if (this.gameState === 'playing') {
        this.gameState = 'paused';
        this.resetFrameClock();
      } else if (this.gameState === 'paused') {
        this.resumeGame();
      }
    },

    endGame() {
      this.gameState = 'gameover';
      this.resetFrameClock();
      this.shakeTime = 0.45;
      this.emitDust(
        this.player.x + this.player.width * 0.5,
        this.player.y + this.player.height,
        18,
        CRASH_COLORS,
      );
      this.playCrash();

      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        this.newBest = true;
        writeStorage(BEST_SCORE_KEY, String(this.bestScore));
        this.playBest();
      }
    },

    handlePress() {
      this.ensureAudio();
      if (this.gameState === 'playing') {
        this.jump();
      } else if (this.gameState === 'ready' || this.gameState === 'gameover') {
        this.startGame();
      }
    },

    jump() {
      const player = this.player;
      if (!player) return;

      if (player.grounded) {
        player.velocityY = -760 * this.scale;
        player.grounded = false;
        player.jumpsUsed = 1;
        player.stretch = 1.2;
        this.emitDust(player.x + player.width * 0.28, this.groundY, 8);
        this.playJump();
      } else if (player.jumpsUsed === 1) {
        player.velocityY = -640 * this.scale;
        player.jumpsUsed = 2;
        player.stretch = 1.22;
        this.emitDust(
          player.x + player.width * 0.5,
          player.y + player.height,
          10,
          PUFF_COLORS,
        );
        this.playDoubleJump();
      }
    },

    onKeyDown(event) {
      const key = (event.key || '').toLowerCase();
      if (key === ' ' || key === 'arrowup' || key === 'w') {
        event.preventDefault();
        if (!event.repeat) this.handlePress();
      } else if (key === 'p' || key === 'escape') {
        event.preventDefault();
        this.togglePause();
      } else if (key === 'enter' && this.gameState !== 'playing') {
        event.preventDefault();
        this.ensureAudio();
        this.startGame();
      }
    },

    toggleSound() {
      this.soundOn = !this.soundOn;
      writeStorage(SOUND_KEY, this.soundOn ? 'on' : 'off');
      if (this.soundOn) {
        this.ensureAudio();
        this.playTone(660, 880, 0.08);
      }
    },

    ensureAudio() {
      if (!this.audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) this.audioCtx = new Ctx();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    },

    playTone(freq, endFreq, duration, type = 'square', volume = 0.12, when = 0) {
      if (!this.soundOn || !this.audioCtx) return;
      const audio = this.audioCtx;
      const start = audio.currentTime + when;
      const osc = audio.createOscillator();
      const gain = audio.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      if (endFreq !== freq) {
        osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration);
      }

      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(audio.destination);
      osc.start(start);
      osc.stop(start + duration + 0.05);
    },

    playStart() {
      this.playTone(392, 523.25, 0.1, 'square', 0.08);
      this.playTone(659.25, 659.25, 0.1, 'square', 0.08, 0.1);
    },

    playJump() {
      this.playTone(300, 620, 0.14, 'square', 0.1);
    },

    playDoubleJump() {
      this.playTone(440, 940, 0.16, 'square', 0.1);
    },

    playLand() {
      this.playTone(150, 90, 0.07, 'triangle', 0.08);
    },

    playCoin() {
      this.playTone(980, 980, 0.06, 'square', 0.09);
      this.playTone(1470, 1470, 0.12, 'square', 0.09, 0.06);
    },

    playCrash() {
      this.playTone(320, 48, 0.5, 'sawtooth', 0.16);
    },

    playBest() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, index) => {
        this.playTone(freq, freq, 0.12, 'square', 0.09, 0.45 + index * 0.11);
      });
    },

    onVisibilityChange() {
      if (document.hidden) this.resetFrameClock();
    },

    resetFrameClock() {
      this.lastTime = 0;
    },

    emitDust(x, y, count, colors) {
      const palette = colors || DUST_COLORS;
      for (let index = 0; index < count; index += 1) {
        this.particles.push({
          x,
          y,
          size: (2 + Math.random() * 4) * this.scale,
          velocityX: (-110 + Math.random() * 220) * this.scale,
          velocityY: (-160 - Math.random() * 80) * this.scale,
          color: palette[Math.floor(Math.random() * palette.length)],
          life: 0.35 + Math.random() * 0.28,
        });
      }
    },

    draw() {
      if (!this.ctx) return;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);
      ctx.imageSmoothingEnabled = false;

      ctx.save();
      if (this.shakeTime > 0) {
        const power = this.shakeTime * 26 * this.scale;
        ctx.translate(
          (Math.random() - 0.5) * power,
          (Math.random() - 0.5) * power,
        );
      }

      this.drawSky();
      this.drawClouds();
      this.drawDistantBlocks();
      this.drawGround();
      this.obstacles.forEach(this.drawObstacle);
      this.coins.forEach(this.drawCoin);
      this.drawClaude();
      this.drawParticles();
      this.drawPopups();
      ctx.restore();
    },

    drawSky() {
      this.block(0, 0, this.width, this.height, '#8db2bf');
      this.block(0, this.height * 0.34, this.width, this.height * 0.16, '#b6cba9');
      this.block(0, this.height * 0.5, this.width, this.groundY - this.height * 0.5, '#d7b76f');

      this.block(0, this.groundY - 2 * this.scale, this.width, 2 * this.scale, '#b18f55');
    },

    drawClouds() {
      this.clouds.forEach((cloud) => {
        const unit = Math.max(5, Math.round(7 * this.scale));
        this.block(cloud.x, cloud.y + unit, cloud.width * 0.7, unit * 3, '#f5ead2');
        this.block(cloud.x + unit * 2, cloud.y, cloud.width * 0.45, unit * 2, '#fff6dc');
        this.block(cloud.x + cloud.width * 0.52, cloud.y + unit * 2, cloud.width * 0.35, unit * 2, '#e3d2af');
        this.block(cloud.x - unit, cloud.y + unit * 3, cloud.width * 0.92, unit, '#cdbb99');
      });
    },

    drawDistantBlocks() {
      const baseY = this.groundY - 78 * this.scale;
      const gap = this.tile * 5.2;
      for (let x = -this.tile; x < this.width + gap; x += gap) {
        this.block(x, baseY + this.tile, this.tile * 3, this.tile, '#6f7a68');
        this.block(x + this.tile, baseY, this.tile * 2, this.tile, '#778872');
        this.block(x + this.tile * 2, baseY - this.tile * 0.65, this.tile, this.tile * 0.65, '#59675a');
      }
    },

    drawGround() {
      const top = this.groundY;
      this.block(0, top, this.width, this.height - top, '#67422b');
      this.block(0, top, this.width, 9 * this.scale, '#3c9564');
      this.block(0, top + 9 * this.scale, this.width, 4 * this.scale, '#1e563f');

      const tile = this.tile;
      const offset = this.floorOffset % (tile * 2);
      for (let x = -tile * 2 - offset; x < this.width + tile * 2; x += tile) {
        const odd = Math.floor((x + offset) / tile) % 2;
        this.block(x, top + tile * 0.85, tile, 3 * this.scale, odd ? '#9d6a3f' : '#4f3426');
        this.block(x + tile * 0.18, top + tile * 1.55, tile * 0.46, 3 * this.scale, odd ? '#4f3426' : '#9d6a3f');
        this.block(x, top + tile * 2.25, tile, 2 * this.scale, odd ? '#3d291f' : '#7d5233');
      }
    },

    drawObstacle(obstacle) {
      if (obstacle.type.id === 'pipe') {
        this.drawPipe(obstacle);
      } else if (obstacle.type.id === 'flyer') {
        this.drawFlyer(obstacle);
      } else {
        this.drawBugBlock(obstacle);
      }
    },

    drawFlyer(obstacle) {
      const unit = Math.max(3, 4 * this.scale);
      const flap = Math.floor(this.elapsed * 9) % 2 ? -unit : unit * 0.5;
      this.block(obstacle.x - unit * 2, obstacle.y + flap, unit * 3, unit, '#d8d3c3');
      this.block(
        obstacle.x + obstacle.width - unit,
        obstacle.y + flap,
        unit * 3,
        unit,
        '#d8d3c3',
      );

      this.block(obstacle.x, obstacle.y, obstacle.width, obstacle.height, obstacle.type.dark);
      this.block(
        obstacle.x + unit,
        obstacle.y + unit,
        obstacle.width - unit * 2,
        obstacle.height - unit * 2,
        obstacle.type.color,
      );
      this.block(
        obstacle.x + unit * 2,
        obstacle.y + unit * 2,
        obstacle.width * 0.34,
        unit,
        obstacle.type.light,
      );

      const ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = '#fff2c9';
      ctx.font = `${Math.max(9, Math.round(10 * this.scale))}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        obstacle.type.label,
        obstacle.x + obstacle.width / 2,
        obstacle.y + obstacle.height / 2,
      );
      ctx.restore();
    },

    drawCoin(coin) {
      const size = coin.size;
      const x = coin.x - size / 2;
      const y = coin.y - size / 2 + Math.sin(coin.phase) * 3 * this.scale;
      const unit = Math.max(2, size * 0.18);

      this.block(x, y, size, size, '#8a5a1c');
      this.block(x + unit, y + unit, size - unit * 2, size - unit * 2, '#f5c542');
      this.block(x + unit, y + unit, size - unit * 2, unit, '#ffe9a0');
      this.block(
        x + size / 2 - unit / 2,
        y + size / 2 - unit,
        unit,
        unit * 2,
        '#8a5a1c',
      );
    },

    drawPipe(obstacle) {
      const unit = Math.max(3, 4 * this.scale);
      this.block(
        obstacle.x,
        obstacle.y + unit * 2,
        obstacle.width,
        obstacle.height - unit * 2,
        obstacle.type.dark,
      );
      this.block(
        obstacle.x + unit,
        obstacle.y + unit * 3,
        obstacle.width - unit * 2,
        obstacle.height - unit * 3,
        obstacle.type.color,
      );
      this.block(
        obstacle.x - unit,
        obstacle.y,
        obstacle.width + unit * 2,
        unit * 5,
        obstacle.type.dark,
      );
      this.block(obstacle.x, obstacle.y + unit, obstacle.width, unit * 3, obstacle.type.light);
      this.block(
        obstacle.x + obstacle.width * 0.58,
        obstacle.y + unit * 4,
        unit,
        obstacle.height - unit * 6,
        '#1d4a36',
      );
    },

    drawBugBlock(obstacle) {
      const unit = Math.max(3, 4 * this.scale);
      this.block(obstacle.x, obstacle.y, obstacle.width, obstacle.height, obstacle.type.dark);
      this.block(
        obstacle.x + unit,
        obstacle.y + unit,
        obstacle.width - unit * 2,
        obstacle.height - unit * 2,
        obstacle.type.color,
      );
      this.block(
        obstacle.x + unit * 2,
        obstacle.y + unit * 2,
        obstacle.width * 0.38,
        unit,
        obstacle.type.light,
      );
      this.block(obstacle.x + obstacle.width - unit * 3, obstacle.y + unit * 2, unit, unit, '#141414');
      this.block(obstacle.x + unit * 2, obstacle.y + obstacle.height - unit * 3, unit, unit, '#141414');

      if (obstacle.type.label) {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = '#fff2c9';
        ctx.font = `${Math.max(9, Math.round(10 * this.scale))}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          obstacle.type.label,
          obstacle.x + obstacle.width / 2,
          obstacle.y + obstacle.height / 2,
        );
        ctx.restore();
      }
    },

    drawClaude() {
      const player = this.player;
      if (!player) return;
      const ctx = this.ctx;
      const unit = player.width / 16;
      const run = Math.floor(player.runFrame) % 2;
      const bob = player.grounded ? Math.sin(player.runFrame) * unit * 0.18 : -unit * 0.35;
      const x = player.x;
      const y = player.y + bob;

      if (player.grounded) {
        this.block(
          x + unit * 2,
          this.groundY + unit * 0.22,
          unit * 12,
          unit * 0.5,
          'rgba(45, 30, 24, 0.3)',
        );
      }

      const stretch = clamp(player.stretch || 1, 0.7, 1.25);
      const feetX = x + player.width / 2;
      const feetY = player.y + player.height;
      ctx.save();
      ctx.translate(feetX, feetY);
      ctx.scale(clamp(2 - stretch, 0.8, 1.2), stretch);
      ctx.translate(-feetX, -feetY);

      if (this.spriteLoaded && this.spriteImage) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          this.spriteImage,
          Math.round(x),
          Math.round(y),
          player.width,
          player.height,
        );
        ctx.restore();
        return;
      }

      const orange = '#d87655';
      const shade = '#bd6049';
      const highlight = '#e39875';

      this.block(x + unit * 2.4, y + unit * 1.05, unit * 11.2, unit * 8.2, orange);
      this.block(x + unit * 0.65, y + unit * 4.15, unit * 1.95, unit * 2.35, orange);
      this.block(x + unit * 13.4, y + unit * 4.15, unit * 1.95, unit * 2.35, orange);
      this.block(x + unit * 2.45, y + unit * 9, unit * 1.55, unit * 2.85, orange);
      this.block(x + unit * 5.1, y + unit * 9, unit * 1.55, unit * 2.85, orange);
      this.block(x + unit * 10.15, y + unit * 9, unit * 1.55, unit * 2.85, orange);
      this.block(x + unit * 13, y + unit * 9, unit * 1.55, unit * 2.85, orange);
      this.block(x + unit * 2.65, y + unit * 1.35, unit * 7.2, unit * 0.7, highlight);
      this.block(x + unit * 12.8, y + unit * 1.15, unit * 0.8, unit * 8.1, shade);

      const eyeY = y + (player.grounded ? unit * 3.5 : unit * 3.15);
      this.drawClaudeEye(x + unit * 3.2, eyeY, unit, 'right');
      this.drawClaudeEye(x + unit * 10.2, eyeY, unit, 'left');

      const stepA = player.grounded && run ? unit * 0.25 : 0;
      const stepB = player.grounded && !run ? unit * 0.25 : 0;
      this.block(x + unit * 2.45, y + unit * 11.2 + stepA, unit * 1.55, unit * 0.65, shade);
      this.block(x + unit * 5.1, y + unit * 11.2 + stepB, unit * 1.55, unit * 0.65, shade);
      this.block(x + unit * 10.15, y + unit * 11.2 + stepB, unit * 1.55, unit * 0.65, shade);
      this.block(x + unit * 13, y + unit * 11.2 + stepA, unit * 1.55, unit * 0.65, shade);

      ctx.restore();
    },

    drawClaudeEye(x, y, unit, direction) {
      const ctx = this.ctx;
      const flip = direction === 'left' ? -1 : 1;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(flip, 1);
      ctx.fillStyle = '#070707';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(unit * 3.05, unit * 1.05);
      ctx.lineTo(unit * 3.05, unit * 1.95);
      ctx.lineTo(0, unit * 3.05);
      ctx.lineTo(0, unit * 2.05);
      ctx.lineTo(unit * 1.72, unit * 1.52);
      ctx.lineTo(0, unit * 0.92);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },

    drawParticles() {
      const ctx = this.ctx;
      this.particles.forEach((particle) => {
        ctx.save();
        ctx.globalAlpha = clamp(particle.life / 0.5, 0, 1);
        this.block(particle.x, particle.y, particle.size, particle.size, particle.color);
        ctx.restore();
      });
    },

    drawPopups() {
      const ctx = this.ctx;
      this.popups.forEach((popup) => {
        ctx.save();
        ctx.globalAlpha = clamp(popup.life / 0.8, 0, 1);
        ctx.font = `bold ${Math.max(12, Math.round(14 * this.scale))}px "Courier New", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#3f2419';
        ctx.fillText(popup.text, popup.x + 2, popup.y + 2);
        ctx.fillStyle = '#ffdf7e';
        ctx.fillText(popup.text, popup.x, popup.y);
        ctx.restore();
      });
    },

    block(x, y, width, height, color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(
        Math.round(x),
        Math.round(y),
        Math.ceil(width),
        Math.ceil(height),
      );
    },
  },
};
</script>

<style scoped>
.code-hop {
  position: fixed;
  top: 0;
  left: 0;
  width: calc(100vw / 0.9);
  height: calc(100vh / 0.9);
  overflow: hidden;
  background: #19233d;
  color: #21170f;
  font-family: 'Courier New', monospace;
  margin: 0;
  padding: 0;
  user-select: none;
}

.code-hop.embedded {
  position: relative;
  width: 100%;
  height: 100%;
}

canvas {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.hop-hud {
  position: fixed;
  top: 16px;
  left: 16px;
  right: 16px;
  z-index: 4;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  align-items: start;
  pointer-events: none;
}

.embedded .hop-hud {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
}

.hud-brand,
.hud-stats,
.hud-button,
.panel,
.floating-btn {
  border: 3px solid #1d1712;
  box-shadow: 5px 5px 0 rgba(35, 21, 14, 0.45);
}

.hud-brand,
.hud-stats {
  background: #f2d59d;
}

.hud-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding: 8px 12px;
}

.hud-brand strong {
  display: block;
  font-size: 18px;
  line-height: 1.1;
}

.hud-brand span:not(.claude-mark) {
  display: block;
  margin-top: 3px;
  color: #6a3b25;
  font-size: 12px;
  font-weight: 700;
}

.claude-mark {
  position: relative;
  width: 36px;
  height: 31px;
  display: inline-block;
  background:
    linear-gradient(#d87655 0 0) 8px 3px / 20px 21px,
    linear-gradient(#d87655 0 0) 3px 13px / 8px 7px,
    linear-gradient(#d87655 0 0) 25px 13px / 8px 7px,
    linear-gradient(#d87655 0 0) 7px 24px / 4px 5px,
    linear-gradient(#d87655 0 0) 12px 24px / 4px 5px,
    linear-gradient(#d87655 0 0) 22px 24px / 4px 5px,
    linear-gradient(#d87655 0 0) 27px 24px / 4px 5px;
  background-repeat: no-repeat;
  image-rendering: pixelated;
}

.claude-mark::before,
.claude-mark::after {
  content: "";
  position: absolute;
  top: 12px;
  width: 8px;
  height: 8px;
  background: #050505;
  clip-path: polygon(
    0 0,
    100% 36%,
    100% 66%,
    0 100%,
    0 70%,
    56% 50%,
    0 30%
  );
}

.claude-mark::before {
  left: 8px;
}

.claude-mark::after {
  left: 22px;
  transform: scaleX(-1);
}

.hud-stats {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px 14px;
  min-height: 52px;
  padding: 12px;
  color: #21170f;
  font-size: 15px;
  font-weight: 700;
  margin-left: auto;
}

.hud-button,
.panel-actions button {
  background: #2b4779;
  color: #fff6d9;
  border-color: #1d1712;
  cursor: pointer;
  font-family: inherit;
  font-weight: 700;
}

.hud-button {
  min-width: 92px;
  min-height: 52px;
  padding: 0 14px;
  pointer-events: auto;
}

.hud-button:hover,
.panel-actions button:hover,
.floating-btn:hover {
  background: #395c9d;
}

.overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(21, 24, 36, 0.16);
  pointer-events: none;
}

.panel {
  width: 440px;
  max-width: calc(100vw - 48px);
  background: #f4d69a;
  padding: 24px;
  text-align: center;
  pointer-events: auto;
}

.panel-kicker {
  display: inline-block;
  margin-bottom: 12px;
  padding: 5px 9px;
  background: #2f6f58;
  color: #fff4d5;
  border: 2px solid #1d1712;
  font-size: 12px;
  font-weight: 700;
}

h1 {
  margin: 0;
  color: #b95130;
  font-size: 56px;
  line-height: 0.9;
  text-shadow: 4px 4px 0 #3f2419;
}

.panel p {
  min-height: 24px;
  margin: 18px 0 22px;
  color: #3b2b1c;
  font-size: 16px;
  font-weight: 700;
}

.panel-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.panel-actions button {
  min-width: 112px;
  min-height: 44px;
  padding: 0 18px;
  border-width: 3px;
  box-shadow: 4px 4px 0 rgba(35, 21, 14, 0.45);
}

.panel-actions .primary {
  background: #b95130;
}

.touch-jump {
  position: absolute;
  right: 20px;
  bottom: 20px;
  z-index: 4;
  width: 88px;
  height: 88px;
  border: 3px solid #1d1712;
  box-shadow: 5px 5px 0 rgba(35, 21, 14, 0.45);
  background: #b95130;
  color: #fff6d9;
  font-family: inherit;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.touch-jump:active {
  transform: translate(2px, 2px);
  box-shadow: 3px 3px 0 rgba(35, 21, 14, 0.45);
}

.new-best {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 7px;
  background: #b95130;
  color: #fff4d5;
  border: 2px solid #1d1712;
  font-size: 12px;
}

.floating-btns {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 6;
  display: flex;
  gap: 8px;
}

.floating-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 12px;
  background: #f2d59d;
  color: #21170f;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 720px) {
  .hud-stats {
    flex-basis: 100%;
    justify-content: flex-start;
    margin-left: 0;
  }

  h1 {
    font-size: 38px;
  }

  .panel {
    padding: 20px 16px;
  }
}

@media (max-width: 420px) {
  .hud-brand strong {
    font-size: 15px;
  }

  .hud-brand,
  .hud-button {
    min-height: 46px;
  }

  .hud-button {
    min-width: 78px;
    padding: 0 10px;
  }

  .hud-stats {
    font-size: 13px;
  }
}
</style>
