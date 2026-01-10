<template>
  <div class="space-game" ref="gameContainer">
    <canvas ref="canvas"></canvas>

    <!-- HUD -->
    <div class="hud">
      <div class="hud-left">
        <button class="menu-btn" @click="toggleMenu">MENU</button>
        <button class="theme-btn" @click="toggleTheme" :title="isDarkTheme ? 'Switch to light' : 'Switch to dark'">
          {{ isDarkTheme ? '☀' : '☾' }}
        </button>
        <button class="sound-btn" @click="toggleSound" :title="soundEnabled ? 'Mute sounds' : 'Enable sounds'">
          {{ soundEnabled ? '🔊' : '🔇' }}
        </button>
      </div>
      <div class="hud-right" :style="hudRightStyle">
        <div class="stat">SCORE: {{ score }}</div>
        <div class="stat">LEVEL: {{ level }}</div>
        <div class="stat multiplier" v-if="multiplier > 1" :style="multiplierStyle">{{ multiplier.toFixed(1) }}x</div>
        <div class="stat high">HIGH: {{ highScore }}</div>
      </div>
    </div>

    <!-- Controls legend (desktop only) -->
    <div class="controls-legend" v-if="!isMobile">
      <span>[P] Pause</span>
      <span>[←][→][↑][↓] Move</span>
    </div>

    <!-- Pause Menu -->
    <div class="menu-overlay" v-if="gameState === 'paused' && !contentView" @click.self="toggleMenu">
      <div class="menu-panel">
        <h2>PAUSED</h2>
        <button @click="resumeGame" class="menu-item">Resume Game</button>
        <div class="menu-divider"></div>
        <button @click="showContent('resume')" class="menu-item">Resume/CV</button>
        <button @click="showContent('projects')" class="menu-item">Projects</button>
        <button @click="showContent('pins')" class="menu-item">Pins</button>
        <div class="menu-divider"></div>
        <div class="menu-submenu">
          <span class="menu-label">Other Homepages</span>
          <a href="/animation" target="_blank" class="menu-item small">Animation</a>
          <a href="/terminal" target="_blank" class="menu-item small">Terminal</a>
          <a href="/newspaper" target="_blank" class="menu-item small">Newspaper</a>
          <a href="/windows95" target="_blank" class="menu-item small">Windows 95</a>
          <a href="/wikipedia" target="_blank" class="menu-item small">Wikipedia</a>
        </div>
      </div>
    </div>

    <!-- In-Game Content Viewer -->
    <div class="menu-overlay content-viewer" v-if="contentView" @click.self="closeContent">
      <div class="content-panel">
        <button class="close-btn" @click="closeContent">×</button>

        <!-- Resume Content -->
        <div v-if="contentView === 'resume'" class="content-scroll">
          <h2>RESUME / CV</h2>

          <div class="content-section">
            <h3>EXPERIENCE</h3>
            <div v-for="(job, idx) in resumeData.experience" :key="'exp-' + idx" class="content-item">
              <div class="item-title">{{ job.title }}</div>
              <div class="item-subtitle">
                <a v-if="job.url" :href="job.url" target="_blank">{{ job.subtitle }}</a>
                <span v-else>{{ job.subtitle }}</span>
              </div>
              <div class="item-date">{{ job.start }} - {{ job.end || 'Present' }}</div>
              <div v-if="job.description" class="item-desc">{{ job.description }}</div>
            </div>
          </div>

          <div class="content-section">
            <h3>EDUCATION</h3>
            <div v-for="(edu, idx) in resumeData.education" :key="'edu-' + idx" class="content-item">
              <div class="item-title">{{ edu.title }}</div>
              <div class="item-subtitle">{{ edu.subtitle }}</div>
              <div class="item-date">{{ edu.start }} - {{ edu.end || 'Present' }}</div>
            </div>
          </div>

          <div class="content-section">
            <h3>LANGUAGES</h3>
            <div class="languages-grid">
              <div v-for="(lang, idx) in resumeData.languages" :key="'lang-' + idx" class="lang-item">
                <span class="lang-name">{{ lang.name }}</span>
                <span class="lang-level">{{ lang.level }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Projects Content -->
        <div v-if="contentView === 'projects'" class="content-scroll">
          <h2>PROJECTS</h2>
          <div v-for="(proj, idx) in projectsData" :key="'proj-' + idx" class="content-item project">
            <div class="item-header">
              <div class="item-title">{{ proj.title }}</div>
              <span class="status-badge" :class="proj.status">{{ proj.status }}</span>
            </div>
            <div class="item-subtitle">{{ proj.subtitle }} ({{ proj.year }})</div>
            <div class="item-tags">
              <span v-for="tag in proj.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <div class="item-desc">{{ proj.description }}</div>
            <a v-if="proj.link" :href="proj.link" target="_blank" class="item-link">View Project →</a>
          </div>
        </div>

        <!-- Pins Content -->
        <div v-if="contentView === 'pins'" class="content-scroll">
          <h2>PINS</h2>
          <div v-for="(pin, idx) in pinsData" :key="'pin-' + idx" class="content-item pin">
            <template v-if="pin.type === 'quote'">
              <div class="quote-text">"{{ pin.message }}"</div>
              <div class="quote-author">— {{ pin.author }}</div>
            </template>
            <template v-else-if="pin.type === 'book'">
              <div class="book-item">
                <img v-if="pin.cover" :src="pin.cover" class="book-cover" :alt="pin.title" />
                <div class="book-info">
                  <div class="item-title">{{ pin.title }}</div>
                  <div class="item-subtitle">{{ pin.author }}</div>
                  <div v-if="pin.subtitle" class="item-desc">{{ pin.subtitle }}</div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <button @click="closeContent" class="menu-item back-btn">← Back to Menu</button>
      </div>
    </div>

    <!-- Game Over Screen -->
    <div class="menu-overlay" v-if="gameState === 'gameover' && !contentView">
      <div class="menu-panel gameover">
        <h2>GAME OVER</h2>
        <div class="final-score">Score: {{ score }}</div>
        <div class="final-score" v-if="isNewHighScore">NEW HIGH SCORE!</div>
        <button @click="restartGame" class="menu-item restart">Play Again</button>
        <div class="menu-divider"></div>
        <button @click="showContent('resume')" class="menu-item">Resume/CV</button>
        <button @click="showContent('projects')" class="menu-item">Projects</button>
        <button @click="showContent('pins')" class="menu-item">Pins</button>
      </div>
    </div>
  </div>
</template>

<script>
import spaceshipImg from '@/assets/space/spaceship.png';
import asteroid1Img from '@/assets/space/asteroid1.png';
import asteroid2Img from '@/assets/space/asteroid2.png';
import asteroid3Img from '@/assets/space/asteroid3.png';
import resumeData from '@/assets/resume.json';
import projectsData from '@/assets/projects.json';
import pinsData from '@/assets/pins.json';

export default {
  name: 'SpaceGameHome',
  data() {
    return {
      // Canvas
      canvas: null,
      ctx: null,
      width: 0,
      height: 0,

      // Sprites
      sprites: {
        ship: null,
        asteroids: [],
      },
      spritesLoaded: false,

      // Close-call streak system
      streak: 0,
      multiplier: 1,
      streakTimer: 0, // Time since last close call
      streakDecayTime: 60, // Frames before streak decays
      lastCloseCall: false,
      fireIntensity: 0, // Visual effect intensity 0-1
      prevStreak: 0, // Track previous streak for HUD flash

      // Streak particle trail system
      trailParticles: [],
      maxTrailParticles: 50,

      // HUD animation state
      hudFlashIntensity: 0,
      hudPulseScale: 1,
      glowPulsePhase: 0, // For pulsing glow animation

      // Game state
      gameState: 'playing', // 'playing', 'paused', 'gameover'
      score: 0,
      level: 1,
      highScore: 0,
      distance: 0,
      isNewHighScore: false,
      isDarkTheme: true,

      // Theme colors
      themes: {
        dark: {
          bg1: '#0a0a1a',
          bg2: '#1a1a3a',
          ship: '#00d4ff',
          engine: '#ff6b00',
          asteroid: '#4a4a6a',
          asteroidGlow: '#8b5cf6',
          text: '#00d4ff',
          textHigh: '#ffd700',
        },
        light: {
          bg1: '#e8f4fc',
          bg2: '#c5dff0',
          ship: '#0088cc',
          engine: '#ff8c00',
          asteroid: '#8888aa',
          asteroidGlow: '#6b4ce6',
          text: '#0066aa',
          textHigh: '#cc8800',
        },
      },

      // Ship
      ship: {
        x: 0,
        y: 0,
        width: 40,
        height: 50,
        speed: 12,
        velocityX: 0,
        velocityY: 0,
        acceleration: 0.8,
        friction: 0.92,
        targetX: null, // For touch controls
        targetY: null,
        minY: 0, // Will be set in resize()
        maxY: 0,
      },

      // Obstacles
      obstacles: [],
      obstacleSpawnTimer: 0,
      baseSpawnInterval: 60, // frames
      baseObstacleSpeed: 3,

      // Stars (parallax background)
      stars: [],

      // Input
      keys: {
        left: false,
        right: false,
        up: false,
        down: false,
      },
      isMobile: false,
      touchX: null,

      // Animation
      animationId: null,
      lastTime: 0,

      // Audio
      soundEnabled: true,
      audioContext: null,
      engineOscillator: null,
      engineGain: null,

      // Content viewer
      contentView: null, // null, 'resume', 'projects', 'pins'
      resumeData,
      projectsData,
      pinsData,
    };
  },

  computed: {
    theme() {
      return this.isDarkTheme ? this.themes.dark : this.themes.light;
    },

    // Compute streak hue for use in computed properties
    streakHue() {
      if (this.streak <= 2) {
        return 180;
      } else if (this.streak <= 5) {
        const t = (this.streak - 2) / 3;
        return 180 - (t * 150);
      }
      const t = Math.min((this.streak - 5) / 5, 1);
      return 30 - (t * 30);
    },

    // Dynamic HUD styling based on streak flash
    hudRightStyle() {
      if (this.hudFlashIntensity <= 0) return {};

      const hue = this.streak > 0 ? this.streakHue : 180;
      const glowSize = 10 + (this.hudFlashIntensity * 20);
      return {
        filter: `drop-shadow(0 0 ${glowSize}px hsl(${hue}, 100%, 50%))`,
      };
    },

    // Dynamic multiplier styling with pulse effect
    multiplierStyle() {
      const scale = this.hudPulseScale;
      const hue = this.streak > 0 ? this.streakHue : 30; // Default orange
      const glow1 = 10 + (this.hudFlashIntensity * 15);
      const glow2 = 20 + (this.hudFlashIntensity * 20);
      const glow3 = 30 + (this.hudFlashIntensity * 25);

      return {
        transform: `scale(${scale})`,
        color: `hsl(${hue}, 100%, 50%)`,
        textShadow: `0 0 ${glow1}px hsl(${hue}, 100%, 50%),
                     0 0 ${glow2}px hsl(${hue}, 100%, 40%),
                     0 0 ${glow3}px hsl(${hue}, 100%, 30%)`,
      };
    },
  },

  mounted() {
    this.init();
  },

  beforeDestroy() {
    this.cleanup();
  },

  methods: {
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme;
      localStorage.setItem('spaceGameTheme', this.isDarkTheme ? 'dark' : 'light');
    },

    toggleSound() {
      this.soundEnabled = !this.soundEnabled;
      localStorage.setItem('spaceGameSound', this.soundEnabled ? 'on' : 'off');

      // Start or stop engine sound based on sound state
      if (this.soundEnabled && this.gameState === 'playing') {
        this.startEngineSound();
      } else {
        this.stopEngineSound();
      }
    },

    initAudio() {
      // Create AudioContext (handle browser prefixes)
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioContext = new AudioContext();
      }

      // Load sound preference from localStorage
      const savedSound = localStorage.getItem('spaceGameSound');
      this.soundEnabled = savedSound !== 'off'; // Default to on
    },

    startEngineSound() {
      if (!this.soundEnabled || !this.audioContext) return;

      // Resume audio context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Don't create multiple engine oscillators
      if (this.engineOscillator) return;

      // Create engine hum - low frequency sawtooth wave
      this.engineOscillator = this.audioContext.createOscillator();
      this.engineGain = this.audioContext.createGain();

      this.engineOscillator.type = 'sawtooth';
      this.engineOscillator.frequency.setValueAtTime(55, this.audioContext.currentTime); // Low A

      this.engineGain.gain.setValueAtTime(0.08, this.audioContext.currentTime);

      this.engineOscillator.connect(this.engineGain);
      this.engineGain.connect(this.audioContext.destination);

      this.engineOscillator.start();
    },

    stopEngineSound() {
      if (this.engineOscillator) {
        this.engineOscillator.stop();
        this.engineOscillator.disconnect();
        this.engineOscillator = null;
      }
      if (this.engineGain) {
        this.engineGain.disconnect();
        this.engineGain = null;
      }
    },

    playCloseCallSound() {
      if (!this.soundEnabled || !this.audioContext) return;

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Short high-pitched "ding" - square wave
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // High A
      oscillator.frequency.setValueAtTime(1320, this.audioContext.currentTime + 0.05); // E (perfect fifth up)

      gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.15);
    },

    playGameOverSound() {
      if (!this.soundEnabled || !this.audioContext) return;

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Descending tone - sawtooth wave falling pitch
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
      oscillator.frequency.exponentialRampToValueAtTime(55, this.audioContext.currentTime + 0.8); // Drop to A1

      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.8);
    },

    playLevelUpSound() {
      if (!this.soundEnabled || !this.audioContext) return;

      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Ascending arpeggio - square wave
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (major chord arpeggio)
      const noteDuration = 0.1;

      notes.forEach((freq, index) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);

        const startTime = this.audioContext.currentTime + index * noteDuration;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + noteDuration + 0.05);
      });
    },

    init() {
      this.canvas = this.$refs.canvas;
      this.ctx = this.canvas.getContext('2d');

      // Ensure fullscreen display with no scrollbars
      document.body.style.overflow = 'hidden';
      document.body.style.margin = '0';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.margin = '0';

      // Load sprites
      this.loadSprites();

      // Load high score and theme preference
      this.highScore = parseInt(localStorage.getItem('spaceGameHighScore') || '0', 10);
      const savedTheme = localStorage.getItem('spaceGameTheme');
      this.isDarkTheme = savedTheme !== 'light'; // Default to dark

      // Detect mobile
      this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Setup canvas size
      this.resize();
      window.addEventListener('resize', this.resize);

      // Setup input handlers
      window.addEventListener('keydown', this.handleKeyDown);
      window.addEventListener('keyup', this.handleKeyUp);

      // Touch events
      this.canvas.addEventListener('touchstart', this.handleTouchStart, { passive: false });
      this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      this.canvas.addEventListener('touchend', this.handleTouchEnd);

      // Initialize audio
      this.initAudio();

      // Initialize game objects
      this.initShip();
      this.initStars();

      // Start game loop
      this.lastTime = performance.now();
      this.gameLoop();

      // Start engine sound (after user interaction to comply with autoplay policy)
      // We'll start it on first user input instead
      this.canvas.addEventListener('click', this.onFirstInteraction, { once: true });
      this.canvas.addEventListener('touchstart', this.onFirstInteraction, { once: true });
      window.addEventListener('keydown', this.onFirstInteraction, { once: true });
    },

    onFirstInteraction() {
      if (this.soundEnabled && this.gameState === 'playing') {
        this.startEngineSound();
      }
    },

    loadSprites() {
      // Load ship sprite
      const shipSprite = new Image();
      shipSprite.src = spaceshipImg;
      shipSprite.onload = () => {
        this.sprites.ship = shipSprite;
        this.checkSpritesLoaded();
      };

      // Load asteroid sprites
      const asteroidSrcs = [asteroid1Img, asteroid2Img, asteroid3Img];
      asteroidSrcs.forEach((src, index) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          this.sprites.asteroids[index] = img;
          this.checkSpritesLoaded();
        };
      });
    },

    checkSpritesLoaded() {
      if (this.sprites.ship && this.sprites.asteroids.filter(Boolean).length === 3) {
        this.spritesLoaded = true;
      }
    },

    cleanup() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      window.removeEventListener('resize', this.resize);
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('keyup', this.handleKeyUp);

      // Stop engine sound
      this.stopEngineSound();

      // Close audio context
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }

      // Restore body styles when leaving the game
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.margin = '';
    },

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.canvas.width = this.width;
      this.canvas.height = this.height;

      // Set vertical movement bounds (full screen with padding for ship)
      this.ship.minY = this.ship.height / 2 + 60; // Top edge + HUD clearance
      this.ship.maxY = this.height - this.ship.height / 2 - 20; // Bottom edge

      // Reposition ship if needed
      if (this.ship.x === 0) {
        this.ship.x = this.width / 2;
      }
      if (this.ship.y === 0 || this.ship.y > this.ship.maxY) {
        this.ship.y = this.ship.maxY - 40;
      }
    },

    initShip() {
      this.ship.x = this.width / 2;
      this.ship.y = this.height - 100;
    },

    initStars() {
      this.stars = [];
      // Create 3 layers of stars
      for (let layer = 0; layer < 3; layer++) {
        const count = 30 + layer * 20;
        const speed = 0.5 + layer * 0.5;
        const size = 1 + layer * 0.5;

        for (let i = 0; i < count; i++) {
          this.stars.push({
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            speed,
            size,
            alpha: 0.3 + Math.random() * 0.7,
          });
        }
      }
    },

    // Input handlers
    handleKeyDown(e) {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        this.keys.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        this.keys.right = true;
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        this.keys.up = true;
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        this.keys.down = true;
      } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (this.gameState === 'playing') {
          this.toggleMenu();
        } else if (this.gameState === 'paused') {
          this.resumeGame();
        }
      }
    },

    handleKeyUp(e) {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        this.keys.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        this.keys.right = false;
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        this.keys.up = false;
      } else if (e.key === 'ArrowDown' || e.key === 's') {
        this.keys.down = false;
      }
    },

    handleTouchStart(e) {
      e.preventDefault();
      if (this.gameState !== 'playing') return;
      const touch = e.touches[0];
      this.touchX = touch.clientX;
      this.ship.targetX = touch.clientX;
      this.ship.targetY = touch.clientY;
    },

    handleTouchMove(e) {
      e.preventDefault();
      if (this.gameState !== 'playing') return;
      const touch = e.touches[0];
      this.touchX = touch.clientX;
      this.ship.targetX = touch.clientX;
      this.ship.targetY = touch.clientY;
    },

    handleTouchEnd() {
      this.touchX = null;
      this.ship.targetX = null;
      this.ship.targetY = null;
    },

    // Game state
    toggleMenu() {
      if (this.gameState === 'playing') {
        this.gameState = 'paused';
      } else if (this.gameState === 'paused') {
        this.gameState = 'playing';
      }
    },

    resumeGame() {
      this.contentView = null;
      this.gameState = 'playing';
    },

    showContent(view) {
      this.contentView = view;
    },

    closeContent() {
      this.contentView = null;
    },

    restartGame() {
      this.score = 0;
      this.level = 1;
      this.distance = 0;
      this.obstacles = [];
      this.obstacleSpawnTimer = 0;
      this.isNewHighScore = false;
      this.streak = 0;
      this.prevStreak = 0;
      this.multiplier = 1;
      this.fireIntensity = 0;
      this.trailParticles = [];
      this.hudFlashIntensity = 0;
      this.hudPulseScale = 1;
      this.glowPulsePhase = 0;
      this.ship.velocityX = 0;
      this.ship.velocityY = 0;
      this.initShip();
      this.gameState = 'playing';
      this.startEngineSound();
    },

    gameOver() {
      this.gameState = 'gameover';
      this.stopEngineSound();
      this.playGameOverSound();
      if (this.score > this.highScore) {
        this.highScore = this.score;
        this.isNewHighScore = true;
        localStorage.setItem('spaceGameHighScore', this.highScore.toString());
      }
    },

    // Game loop
    gameLoop(currentTime = 0) {
      this.animationId = requestAnimationFrame(this.gameLoop);

      const deltaTime = (currentTime - this.lastTime) / 16.67; // Normalize to ~60fps
      this.lastTime = currentTime;

      if (this.gameState === 'playing') {
        this.update(deltaTime);
      }

      this.render();
    },

    update(dt) {
      // Update ship position
      this.updateShip(dt);

      // Update stars
      this.updateStars(dt);

      // Spawn obstacles
      this.spawnObstacles(dt);

      // Update obstacles
      this.updateObstacles(dt);

      // Check collisions (will end game if hit)
      this.checkCollisions();

      // Check close calls for streak bonus
      this.checkCloseCalls();

      // Update streak timer and decay
      this.updateStreak(dt);

      // Update glow pulse phase for animation
      this.glowPulsePhase += dt * 0.15;

      // Update trail particles
      this.updateTrailParticles(dt);

      // Decay HUD flash effect
      if (this.hudFlashIntensity > 0) {
        this.hudFlashIntensity = Math.max(0, this.hudFlashIntensity - 0.05 * dt);
      }
      if (this.hudPulseScale > 1) {
        this.hudPulseScale = Math.max(1, this.hudPulseScale - 0.02 * dt);
      }

      // Update score with multiplier
      this.distance += dt * this.multiplier;
      this.score = Math.floor(this.distance);

      const newLevel = Math.floor(this.distance / 1000) + 1;
      if (newLevel > this.level) {
        this.level = newLevel;
        this.playLevelUpSound();
      }
    },

    checkCloseCalls() {
      const shipX = this.ship.x;
      const shipY = this.ship.y;
      const closeCallDistance = 80; // Distance to trigger close call
      const dangerDistance = 40; // Extra close = better bonus

      let closestDistance = Infinity;
      let isCloseToAny = false;

      for (const obs of this.obstacles) {
        // Calculate distance from ship center to obstacle center
        const dx = shipX - obs.x;
        const dy = shipY - obs.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const combinedRadius = (this.ship.width + obs.width) / 2;

        // Check if close but not colliding
        const gap = distance - combinedRadius;

        if (gap > 0 && gap < closeCallDistance) {
          isCloseToAny = true;
          closestDistance = Math.min(closestDistance, gap);

          // Mark this obstacle as passed close
          if (!obs.closeCallCounted && obs.y > shipY) {
            obs.closeCallCounted = true;

            // Calculate bonus based on how close (closer = better)
            const closenessBonus = 1 - (gap / closeCallDistance);

            // Track previous streak for HUD flash
            this.prevStreak = this.streak;

            // Increment streak
            this.streak += 1;
            this.streakTimer = 0;

            // Trigger HUD flash effect on new streak
            this.hudFlashIntensity = 1.0;
            this.hudPulseScale = 1.2;

            // Play close call sound
            this.playCloseCallSound();

            // Multiplier increases with streak (max 10x)
            this.multiplier = Math.min(1 + this.streak * 0.5, 10);

            // Fire intensity based on closeness and streak
            this.fireIntensity = Math.min(closenessBonus + (this.streak * 0.1), 1);
          }
        }
      }

      // Update ongoing close call state
      this.lastCloseCall = isCloseToAny;

      // If currently very close, boost fire effect
      if (isCloseToAny && closestDistance < dangerDistance) {
        this.fireIntensity = Math.min(this.fireIntensity + 0.05, 1);
      }
    },

    updateStreak(dt) {
      // Decay streak timer
      this.streakTimer += dt;

      // If no close calls for a while, decay the streak
      if (this.streakTimer > this.streakDecayTime) {
        if (this.streak > 0) {
          this.streak = Math.max(0, this.streak - 1);
          this.multiplier = Math.max(1, 1 + this.streak * 0.5);
          this.streakTimer = this.streakDecayTime * 0.5; // Slow decay
        }
        // Decay fire intensity
        this.fireIntensity = Math.max(0, this.fireIntensity - 0.02);
      }
    },

    updateShip(dt) {
      // Horizontal keyboard movement with acceleration
      if (this.keys.left) {
        this.ship.velocityX -= this.ship.acceleration * dt;
      }
      if (this.keys.right) {
        this.ship.velocityX += this.ship.acceleration * dt;
      }

      // Vertical keyboard movement with acceleration
      if (this.keys.up) {
        this.ship.velocityY -= this.ship.acceleration * dt;
      }
      if (this.keys.down) {
        this.ship.velocityY += this.ship.acceleration * dt;
      }

      // Apply friction
      this.ship.velocityX *= this.ship.friction;
      this.ship.velocityY *= this.ship.friction;

      // Clamp velocity to max speed
      this.ship.velocityX = Math.max(-this.ship.speed, Math.min(this.ship.speed, this.ship.velocityX));
      this.ship.velocityY = Math.max(-this.ship.speed, Math.min(this.ship.speed, this.ship.velocityY));

      // Apply velocity to position
      this.ship.x += this.ship.velocityX * dt;
      this.ship.y += this.ship.velocityY * dt;

      // Touch movement (smooth follow)
      if (this.ship.targetX !== null) {
        const diffX = this.ship.targetX - this.ship.x;
        this.ship.x += diffX * 0.2 * dt;
      }
      if (this.ship.targetY !== null) {
        const diffY = this.ship.targetY - this.ship.y;
        this.ship.y += diffY * 0.2 * dt;
      }

      // Keep ship in horizontal bounds
      const halfWidth = this.ship.width / 2;
      this.ship.x = Math.max(halfWidth, Math.min(this.width - halfWidth, this.ship.x));

      // Keep ship in vertical bounds (bottom portion of screen)
      this.ship.y = Math.max(this.ship.minY, Math.min(this.ship.maxY, this.ship.y));
    },

    updateStars(dt) {
      for (const star of this.stars) {
        star.y += star.speed * dt;
        if (star.y > this.height) {
          star.y = 0;
          star.x = Math.random() * this.width;
        }
      }
    },

    updateTrailParticles(dt) {
      // Spawn new particles when on a streak
      if (this.streak > 0 && this.gameState === 'playing') {
        // Spawn rate increases with streak
        const spawnChance = Math.min(0.3 + this.streak * 0.1, 0.8);
        if (Math.random() < spawnChance && this.trailParticles.length < this.maxTrailParticles) {
          // Calculate glow color based on streak (cyan -> orange -> red)
          const hue = this.getStreakHue();

          this.trailParticles.push({
            x: this.ship.x + (Math.random() - 0.5) * this.ship.width * 0.6,
            y: this.ship.y + this.ship.height / 2,
            vx: (Math.random() - 0.5) * 2,
            vy: 2 + Math.random() * 3,
            life: 1.0,
            decay: 0.02 + Math.random() * 0.02,
            size: 2 + Math.random() * 3 + this.streak * 0.5,
            hue,
          });
        }
      }

      // Update existing particles
      for (let i = this.trailParticles.length - 1; i >= 0; i--) {
        const p = this.trailParticles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= p.decay * dt;

        // Remove dead particles
        if (p.life <= 0) {
          this.trailParticles.splice(i, 1);
        }
      }
    },

    // Get glow color hue based on streak level (180=cyan, 30=orange, 0=red)
    getStreakHue() {
      // streak 0-2: cyan (180)
      // streak 3-5: transition to orange (30)
      // streak 6+: transition to red (0)
      if (this.streak <= 2) {
        return 180;
      } else if (this.streak <= 5) {
        // Interpolate from cyan (180) to orange (30)
        const t = (this.streak - 2) / 3;
        return 180 - t * 150;
      }
      // Interpolate from orange (30) to red (0)
      const t = Math.min((this.streak - 5) / 5, 1);
      return 30 - t * 30;
    },

    spawnObstacles(dt) {
      this.obstacleSpawnTimer += dt;

      // Spawn interval decreases with level
      const spawnInterval = this.baseSpawnInterval / (1 + (this.level - 1) * 0.1);

      if (this.obstacleSpawnTimer >= spawnInterval) {
        this.obstacleSpawnTimer = 0;

        // Obstacle properties scale with level
        const speed = this.baseObstacleSpeed * (1 + (this.level - 1) * 0.05);
        const size = 30 + Math.random() * 30;

        this.obstacles.push({
          x: Math.random() * (this.width - size) + size / 2,
          y: -size,
          width: size,
          height: size,
          speed,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
          vertices: this.generateAsteroidVertices(),
          spriteIndex: Math.floor(Math.random() * 3), // Random asteroid sprite
          passedBy: false, // Track if ship passed by for close-call detection
        });
      }
    },

    generateAsteroidVertices() {
      const vertices = [];
      const numVertices = 7 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numVertices; i++) {
        const angle = (i / numVertices) * Math.PI * 2;
        const radius = 0.7 + Math.random() * 0.3;
        vertices.push({ angle, radius });
      }
      return vertices;
    },

    updateObstacles(dt) {
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.y += obs.speed * dt;
        obs.rotation += obs.rotationSpeed * dt;

        // Remove if off screen
        if (obs.y > this.height + obs.height) {
          this.obstacles.splice(i, 1);
        }
      }
    },

    checkCollisions() {
      const shipHitbox = {
        x: this.ship.x - this.ship.width * 0.35,
        y: this.ship.y - this.ship.height * 0.35,
        width: this.ship.width * 0.7,
        height: this.ship.height * 0.7,
      };

      for (const obs of this.obstacles) {
        const obsHitbox = {
          x: obs.x - obs.width * 0.4,
          y: obs.y - obs.height * 0.4,
          width: obs.width * 0.8,
          height: obs.height * 0.8,
        };

        if (this.aabbCollision(shipHitbox, obsHitbox)) {
          this.gameOver();
          return;
        }
      }
    },

    aabbCollision(a, b) {
      return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
      );
    },

    // Rendering
    render() {
      const ctx = this.ctx;

      // Clear and draw background
      this.renderBackground();

      // Draw stars
      this.renderStars();

      // Draw trail particles (behind ship)
      this.renderTrailParticles();

      // Draw obstacles
      this.renderObstacles();

      // Draw ship
      this.renderShip();
    },

    renderBackground() {
      const ctx = this.ctx;
      const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
      gradient.addColorStop(0, this.theme.bg1);
      gradient.addColorStop(1, this.theme.bg2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.width, this.height);
    },

    renderStars() {
      const ctx = this.ctx;
      const starColor = this.isDarkTheme ? '255, 255, 255' : '0, 0, 50';
      for (const star of this.stars) {
        ctx.fillStyle = `rgba(${starColor}, ${star.alpha * (this.isDarkTheme ? 1 : 0.3)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    },

    renderTrailParticles() {
      const ctx = this.ctx;

      for (const p of this.trailParticles) {
        ctx.save();

        // Draw glowing particle
        const alpha = p.life * 0.8;
        ctx.globalAlpha = alpha;

        // Glow effect
        ctx.shadowColor = `hsl(${p.hue}, 100%, 60%)`;
        ctx.shadowBlur = p.size * 2;

        ctx.fillStyle = `hsl(${p.hue}, 100%, 70%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    },

    renderShip() {
      const ctx = this.ctx;
      const { x, y, width, height } = this.ship;

      ctx.save();
      ctx.translate(x, y);

      // Enhanced fire effect based on streak
      const baseFlameHeight = 15;
      const streakFlameBonus = this.fireIntensity * 40;
      const flameHeight = baseFlameHeight + streakFlameBonus + Math.random() * 5;

      // Draw pulsing glow aura when on a streak
      if (this.streak > 0) {
        const hue = this.getStreakHue();
        const pulseAmount = Math.sin(this.glowPulsePhase) * 0.3 + 0.7; // Pulse between 0.4 and 1.0
        const baseGlowRadius = 30 + this.streak * 8; // Glow gets bigger with streak
        const glowRadius = baseGlowRadius * pulseAmount;
        const glowAlpha = Math.min(0.3 + this.streak * 0.05, 0.6) * pulseAmount;

        // Draw multiple glow layers for a softer effect
        for (let i = 3; i >= 1; i--) {
          const layerRadius = glowRadius * (i / 3);
          const layerAlpha = glowAlpha * (1 - i / 4);

          const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, layerRadius);
          gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, ${layerAlpha})`);
          gradient.addColorStop(0.5, `hsla(${hue}, 100%, 50%, ${layerAlpha * 0.5})`);
          gradient.addColorStop(1, `hsla(${hue}, 100%, 40%, 0)`);

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(0, 0, layerRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw streak fire trail (behind ship)
      if (this.fireIntensity > 0) {
        const trailLength = 20 + this.fireIntensity * 60;
        const hue = this.getStreakHue();
        const gradient = ctx.createLinearGradient(0, height / 2, 0, height / 2 + trailLength);
        gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, ${0.8 * this.fireIntensity})`);
        gradient.addColorStop(0.3, `hsla(${Math.max(0, hue - 20)}, 100%, 60%, ${0.6 * this.fireIntensity})`);
        gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-width / 3, height / 2);
        ctx.lineTo(0, height / 2 + trailLength);
        ctx.lineTo(width / 3, height / 2);
        ctx.closePath();
        ctx.fill();
      }

      // Use sprite if loaded, otherwise fallback to shape
      if (this.spritesLoaded && this.sprites.ship) {
        const spriteSize = Math.max(width, height) * 1.5;

        // Add glow around the sprite when on streak
        if (this.streak > 0) {
          const hue = this.getStreakHue();
          ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
          ctx.shadowBlur = 15 + this.streak * 5;
        }

        ctx.drawImage(
          this.sprites.ship,
          -spriteSize / 2,
          -spriteSize / 2,
          spriteSize,
          spriteSize,
        );
      } else {
        // Fallback: draw shape
        const hue = this.streak > 0 ? this.getStreakHue() : 180; // Cyan default
        ctx.shadowColor = this.streak > 0 ? `hsl(${hue}, 100%, 50%)` : this.theme.ship;
        ctx.shadowBlur = 20 + this.streak * 3;

        ctx.fillStyle = this.streak > 0 ? `hsl(${hue}, 100%, 50%)` : this.theme.ship;
        ctx.beginPath();
        ctx.moveTo(0, -height / 2);
        ctx.lineTo(-width / 2, height / 2);
        ctx.lineTo(width / 2, height / 2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = this.theme.bg1;
        ctx.beginPath();
        ctx.moveTo(0, -height / 4);
        ctx.lineTo(-width / 4, height / 4);
        ctx.lineTo(width / 4, height / 4);
        ctx.closePath();
        ctx.fill();

        // Engine glow
        ctx.shadowColor = this.theme.engine;
        ctx.shadowBlur = 15 + this.fireIntensity * 20;
        ctx.fillStyle = this.theme.engine;
        ctx.beginPath();
        ctx.moveTo(-width / 4, height / 2);
        ctx.lineTo(0, height / 2 + flameHeight);
        ctx.lineTo(width / 4, height / 2);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    },

    renderObstacles() {
      const ctx = this.ctx;

      for (const obs of this.obstacles) {
        ctx.save();
        ctx.translate(obs.x, obs.y);
        ctx.rotate(obs.rotation);

        // Use sprite if loaded
        if (this.spritesLoaded && this.sprites.asteroids[obs.spriteIndex]) {
          const sprite = this.sprites.asteroids[obs.spriteIndex];
          const size = obs.width * 1.2;
          ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
        } else {
          // Fallback: draw shape
          ctx.shadowColor = this.theme.asteroidGlow;
          ctx.shadowBlur = 10;

          ctx.fillStyle = this.theme.asteroid;
          ctx.strokeStyle = this.theme.asteroidGlow;
          ctx.lineWidth = 2;

          ctx.beginPath();
          for (let i = 0; i < obs.vertices.length; i++) {
            const v = obs.vertices[i];
            const vx = Math.cos(v.angle) * v.radius * obs.width / 2;
            const vy = Math.sin(v.angle) * v.radius * obs.height / 2;
            if (i === 0) {
              ctx.moveTo(vx, vy);
            } else {
              ctx.lineTo(vx, vy);
            }
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      }
    },
  },
};
</script>

<style>
/* Global overrides for full-screen game */
html, body {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  overflow: hidden !important;
  background: #0a0a1a !important;
}

#app {
  width: 100% !important;
  height: 100% !important;
  min-height: 100vh !important;
  background: #0a0a1a !important;
}

/* Hide global theme toggle on space game */
#app > .theme-toggle {
  display: none !important;
}
</style>

<style scoped>
.space-game {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: 'Courier New', monospace;
  margin: 0;
  padding: 0;
  background: #0a0a1a;
}

canvas {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* HUD */
.hud {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  pointer-events: none;
}

.hud-left,
.hud-right {
  pointer-events: auto;
}

.hud-right {
  text-align: right;
}

.menu-btn,
.theme-btn,
.sound-btn {
  background: rgba(0, 212, 255, 0.2);
  border: 2px solid #00d4ff;
  color: #00d4ff;
  padding: 8px 16px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-btn,
.sound-btn {
  margin-left: 8px;
  padding: 8px 12px;
  font-size: 16px;
}

.menu-btn:hover,
.theme-btn:hover,
.sound-btn:hover {
  background: rgba(0, 212, 255, 0.4);
}

.hud-left {
  display: flex;
  align-items: center;
}

.stat {
  color: #00d4ff;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5),
               0 0 20px rgba(0, 212, 255, 0.4),
               0 0 30px rgba(0, 212, 255, 0.3);
  margin-bottom: 5px;
}

.stat.high {
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5),
               0 0 20px rgba(255, 215, 0, 0.4),
               0 0 30px rgba(255, 215, 0, 0.3);
}

.stat.multiplier {
  color: #ff9500;
  font-size: 28px;
  text-shadow: 0 0 10px rgba(255, 149, 0, 0.6),
               0 0 20px rgba(255, 149, 0, 0.5),
               0 0 30px rgba(255, 200, 0, 0.4);
  animation: pulse-multiplier 0.8s ease-in-out infinite alternate;
}

@keyframes pulse-multiplier {
  0% {
    transform: scale(1);
    text-shadow: 0 0 10px rgba(255, 149, 0, 0.6),
                 0 0 20px rgba(255, 149, 0, 0.5),
                 0 0 30px rgba(255, 200, 0, 0.4);
  }
  100% {
    transform: scale(1.1);
    text-shadow: 0 0 15px rgba(255, 149, 0, 0.8),
                 0 0 30px rgba(255, 149, 0, 0.6),
                 0 0 45px rgba(255, 200, 0, 0.5);
  }
}

/* Controls legend */
.controls-legend {
  position: fixed;
  bottom: 20px;
  left: 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  display: flex;
  gap: 20px;
}

/* Menu overlay */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.menu-panel {
  background: rgba(10, 10, 26, 0.95);
  border: 2px solid #00d4ff;
  padding: 30px 40px;
  min-width: 250px;
  text-align: center;
}

.menu-panel h2 {
  color: #00d4ff;
  margin: 0 0 20px 0;
  font-size: 24px;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
}

.menu-panel.gameover h2 {
  color: #ff4444;
  text-shadow: 0 0 20px rgba(255, 68, 68, 0.5);
}

.menu-item {
  display: block;
  width: 100%;
  box-sizing: border-box;
  background: transparent;
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  padding: 12px 20px;
  margin: 8px 0;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  text-align: center;
}

.menu-item:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: #00d4ff;
}

.menu-item.restart {
  display: block;
  width: 100%;
  box-sizing: border-box;
  background: rgba(0, 212, 255, 0.2);
  border-color: #00d4ff;
}

.menu-item.small {
  padding: 8px 15px;
  font-size: 12px;
  margin: 4px 0;
}

.menu-divider {
  height: 1px;
  background: rgba(0, 212, 255, 0.3);
  margin: 15px 0;
}

.menu-submenu {
  margin-top: 10px;
}

.menu-label {
  display: block;
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.final-score {
  color: #ffd700;
  font-size: 18px;
  margin-bottom: 10px;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

/* Content Viewer */
.content-viewer {
  z-index: 110;
}

.content-panel {
  background: rgba(10, 10, 26, 0.98);
  border: 2px solid #00d4ff;
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  position: relative;
  display: flex;
  flex-direction: column;
}

.content-panel h2 {
  color: #00d4ff;
  text-align: center;
  margin: 0;
  padding: 20px;
  font-size: 24px;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
  flex-shrink: 0;
}

.content-panel h3 {
  color: #8b5cf6;
  font-size: 14px;
  text-transform: uppercase;
  margin: 20px 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(139, 92, 246, 0.3);
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: 2px solid #ff4444;
  color: #ff4444;
  width: 36px;
  height: 36px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.close-btn:hover {
  background: rgba(255, 68, 68, 0.2);
}

.content-scroll {
  padding: 0 25px 20px 25px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.content-section {
  margin-bottom: 25px;
}

.content-item {
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  padding: 15px;
  margin-bottom: 12px;
}

.content-item.project {
  border-color: rgba(139, 92, 246, 0.3);
}

.content-item.pin {
  border-color: rgba(255, 215, 0, 0.3);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.item-title {
  color: #00d4ff;
  font-size: 16px;
  font-weight: bold;
}

.item-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  margin-bottom: 5px;
}

.item-subtitle a {
  color: #8b5cf6;
  text-decoration: none;
}

.item-subtitle a:hover {
  text-decoration: underline;
}

.item-date {
  color: rgba(255, 255, 255, 0.4);
  font-size: 11px;
  margin-bottom: 8px;
}

.item-desc {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  line-height: 1.5;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 8px 0;
}

.tag {
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #8b5cf6;
  padding: 3px 8px;
  font-size: 10px;
  text-transform: uppercase;
}

.item-link {
  display: inline-block;
  color: #00d4ff;
  font-size: 12px;
  margin-top: 10px;
  text-decoration: none;
}

.item-link:hover {
  text-decoration: underline;
}

.status-badge {
  padding: 3px 8px;
  font-size: 10px;
  text-transform: uppercase;
  border: 1px solid;
}

.status-badge.live {
  color: #00ff88;
  border-color: #00ff88;
  background: rgba(0, 255, 136, 0.1);
}

.status-badge.graveyard {
  color: #888;
  border-color: #888;
  background: rgba(136, 136, 136, 0.1);
}

.languages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}

.lang-item {
  background: rgba(0, 212, 255, 0.05);
  border: 1px solid rgba(0, 212, 255, 0.2);
  padding: 10px;
  text-align: center;
}

.lang-name {
  display: block;
  color: #00d4ff;
  font-size: 14px;
  margin-bottom: 4px;
}

.lang-level {
  color: rgba(255, 255, 255, 0.5);
  font-size: 11px;
}

.quote-text {
  color: #ffd700;
  font-size: 15px;
  font-style: italic;
  line-height: 1.6;
  margin-bottom: 10px;
}

.quote-author {
  color: rgba(255, 215, 0, 0.6);
  font-size: 13px;
  text-align: right;
}

.book-item {
  display: flex;
  gap: 15px;
}

.book-cover {
  width: 60px;
  height: 90px;
  object-fit: cover;
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.book-info {
  flex: 1;
}

.back-btn {
  margin: 15px 25px;
  flex-shrink: 0;
}

/* Mobile adjustments */
@media (max-width: 600px) {
  .hud {
    padding: 10px 15px;
  }

  .menu-btn {
    padding: 10px 14px;
    font-size: 12px;
  }

  .stat {
    font-size: 18px;
  }

  .stat.multiplier {
    font-size: 20px;
  }

  .menu-panel {
    padding: 20px 25px;
    min-width: 200px;
  }

  .menu-panel h2 {
    font-size: 20px;
  }

  .menu-item {
    padding: 10px 15px;
    font-size: 13px;
  }

  .content-panel {
    width: 95%;
    max-height: 90vh;
  }

  .content-panel h2 {
    font-size: 20px;
    padding: 15px;
  }

  .content-scroll {
    padding: 0 15px 15px 15px;
  }

  .content-item {
    padding: 12px;
  }

  .item-title {
    font-size: 14px;
  }

  .quote-text {
    font-size: 13px;
  }

  .book-cover {
    width: 50px;
    height: 75px;
  }

  .back-btn {
    margin: 10px 15px 15px 15px;
  }
}
</style>
