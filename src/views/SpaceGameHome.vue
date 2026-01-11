<template>
  <div class="space-game" :class="{ embedded }" ref="gameContainer">
    <canvas ref="canvas"></canvas>

    <!-- HUD -->
    <div class="hud">
      <div class="hud-left">
        <button class="menu-btn" @click="toggleMenu">MENU</button>
        <!-- Audio button hidden - not working reliably
        <button class="sound-btn" @click="toggleSound" :title="audio.enabled ? 'Mute sounds' : 'Enable sounds'">
          {{ audio.enabled ? '🔊' : '🔇' }}
        </button>
        -->
      </div>
      <div class="hud-right" :style="gameplay.getHudRightStyle()">
        <div class="stat">SCORE: {{ gameplay.score }}</div>
        <div class="stat">LEVEL: {{ gameplay.level }}</div>
        <div class="stat multiplier" v-if="gameplay.multiplier > 1" :style="gameplay.getMultiplierStyle()">{{ gameplay.multiplier.toFixed(1) }}x</div>
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
        <div class="menu-divider" v-if="!embedded"></div>
        <div class="menu-submenu" v-if="!embedded">
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

        <button @click="closeContent" class="menu-item back-btn">← Back</button>
      </div>
    </div>

    <!-- Game Over Screen -->
    <div class="menu-overlay gameover-overlay" v-if="gameState === 'gameover' && !contentView">
      <div class="gameover-panel" :class="{ 'new-record': isNewHighScore }">
        <div class="gameover-title">
          <span v-if="isNewHighScore" class="glitch gold" data-text="NEW HIGH SCORE!">NEW HIGH SCORE!</span>
          <span v-else class="glitch" data-text="GAME OVER">GAME OVER</span>
        </div>

        <div class="gameover-stats">
          <div class="stat-row main-score">
            <span class="stat-value">{{ gameplay.score.toLocaleString() }}</span>
            <span class="stat-label">SCORE</span>
          </div>

          <div class="stat-divider"></div>

          <div class="stat-row-group">
            <div class="stat-row small">
              <span class="stat-label">LEVEL</span>
              <span class="stat-value">{{ gameplay.level }}</span>
            </div>
            <div class="stat-row small" v-if="!isNewHighScore">
              <span class="stat-label">HIGH SCORE</span>
              <span class="stat-value">{{ highScore.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div class="gameover-actions">
          <button @click="restartGame" class="action-btn primary">
            <span class="btn-icon">&#9658;</span>
            PLAY AGAIN
          </button>
          <button @click="toggleMenu" class="action-btn secondary">MENU</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// Asset imports
import spaceshipImg from '@/assets/space/spaceship.png';
import asteroid1Img from '@/assets/space/asteroid1.png';
import asteroid2Img from '@/assets/space/asteroid2.png';
import asteroid3Img from '@/assets/space/asteroid3.png';
import resumeData from '@/assets/resume.json';
import projectsData from '@/assets/projects.json';
import pinsData from '@/assets/pins.json';

// Game module imports
import { THEMES, LEVEL_CONFIG } from '@/game/config.js';
import { createShip, createStars } from '@/game/entities.js';
import { AudioSystem } from '@/game/audio.js';
import { InputSystem } from '@/game/input.js';
import { GameplaySystem } from '@/game/gameplay.js';
import {
  updateShip,
  updateStars,
  updateObstacles,
  spawnObstacles,
  checkCollisions,
} from '@/game/physics.js';
import {
  renderBackground,
  renderStars,
  renderTrailParticles,
  renderExplosionParticles,
  renderShip,
  renderObstacles,
  renderScorePopups,
  renderLevelUpCelebration,
  renderProgressBar,
  applyScreenShake,
} from '@/game/rendering.js';

export default {
  name: 'SpaceGameHome',

  props: {
    embedded: {
      type: Boolean,
      default: false,
    },
  },

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

      // Game state
      gameState: 'playing',
      highScore: 0,
      isNewHighScore: false,
      isDarkTheme: true,
      isMobile: false,

      // Systems (initialized in created/mounted)
      audio: new AudioSystem(),
      input: new InputSystem(),
      gameplay: new GameplaySystem(),

      // Game objects
      ship: null,
      stars: [],
      obstacles: [],
      obstacleSpawnState: { timer: 0 },

      // Animation
      animationId: null,
      lastTime: 0,

      // Content viewer
      contentView: null,
      resumeData,
      projectsData,
      pinsData,
    };
  },

  computed: {
    theme() {
      return this.isDarkTheme ? THEMES.dark : THEMES.light;
    },
  },

  mounted() {
    // Use nextTick to ensure container has dimensions when embedded
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

      // Fullscreen setup (only when standalone)
      if (!this.embedded) {
        document.body.style.overflow = 'hidden';
        document.body.style.margin = '0';
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.margin = '0';
      }

      // Load assets
      this.loadSprites();

      // Load preferences
      this.highScore = parseInt(localStorage.getItem('spaceGameHighScore') || '0', 10);
      const savedTheme = localStorage.getItem('spaceGameTheme');
      this.isDarkTheme = savedTheme !== 'light';

      // Detect mobile
      this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Setup canvas
      this.resize();
      window.addEventListener('resize', this.resize);

      // For embedded mode, observe container size changes (e.g., window resize in Win95)
      if (this.embedded && typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          this.resize();
        });
        this.resizeObserver.observe(this.$refs.gameContainer);
      }

      // Initialize systems
      this.audio.init();
      this.input.init(this.canvas, {
        onPause: () => {
          if (this.gameState === 'playing') {
            this.toggleMenu();
          } else if (this.gameState === 'paused') {
            this.resumeGame();
          }
        },
        isPlaying: () => this.gameState === 'playing',
      });

      // Initialize game objects
      this.ship = createShip(this.width, this.height);
      this.ship.minY = this.ship.height / 2 + 60;
      this.ship.maxY = this.height - this.ship.height / 2 - 20;
      this.stars = createStars(this.width, this.height);

      // Start game loop
      this.lastTime = performance.now();
      this.gameLoop();

      // Start engine sound on first interaction
      const startAudio = () => {
        if (this.audio.enabled && this.gameState === 'playing') {
          this.audio.startEngine();
        }
      };
      this.canvas.addEventListener('click', startAudio, { once: true });
      this.canvas.addEventListener('touchstart', startAudio, { once: true });
      window.addEventListener('keydown', startAudio, { once: true });
    },

    loadSprites() {
      const shipSprite = new Image();
      shipSprite.src = spaceshipImg;
      shipSprite.onload = () => {
        this.sprites.ship = shipSprite;
        this.checkSpritesLoaded();
      };

      [asteroid1Img, asteroid2Img, asteroid3Img].forEach((src, i) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          this.sprites.asteroids[i] = img;
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
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      this.input.cleanup();
      this.audio.cleanup();

      if (!this.embedded) {
        document.body.style.overflow = '';
        document.body.style.margin = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.margin = '';
      }
    },

    resize() {
      if (this.embedded) {
        const container = this.$refs.gameContainer;
        this.width = container.clientWidth || 800;
        this.height = container.clientHeight || 600;
      } else {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
      }
      this.canvas.width = this.width;
      this.canvas.height = this.height;

      if (this.ship) {
        this.ship.minY = this.ship.height / 2 + 60;
        this.ship.maxY = this.height - this.ship.height / 2 - 20;

        // Always reposition ship to be visible
        if (this.ship.x <= 0 || this.ship.x > this.width) {
          this.ship.x = this.width / 2;
        }
        if (this.ship.y <= 0 || this.ship.y > this.ship.maxY) {
          this.ship.y = this.ship.maxY - 40;
        }
      }
    },

    // Game state methods
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme;
      localStorage.setItem('spaceGameTheme', this.isDarkTheme ? 'dark' : 'light');
    },

    toggleSound() {
      const enabled = this.audio.toggle();
      if (enabled && this.gameState === 'playing') {
        this.audio.startEngine();
      } else {
        this.audio.stopEngine();
      }
    },

    toggleMenu() {
      if (this.gameState === 'playing') {
        this.gameState = 'paused';
        this.audio.stopEngine();
      } else if (this.gameState === 'paused') {
        this.gameState = 'playing';
        if (this.audio.enabled) {
          this.audio.startEngine();
        }
      } else if (this.gameState === 'gameover') {
        // From game over, go to paused menu
        this.gameState = 'paused';
      }
    },

    resumeGame() {
      this.contentView = null;
      this.gameState = 'playing';
      if (this.audio.enabled) {
        this.audio.startEngine();
      }
    },

    showContent(view) {
      this.contentView = view;
    },

    closeContent() {
      this.contentView = null;
    },

    restartGame() {
      this.gameplay.reset();
      this.obstacles = [];
      this.obstacleSpawnState.timer = 0;
      this.isNewHighScore = false;
      this.ship = createShip(this.width, this.height);
      this.ship.minY = this.ship.height / 2 + 60;
      this.ship.maxY = this.height - this.ship.height / 2 - 20;
      this.gameState = 'playing';
      this.audio.startEngine();
    },

    gameOver() {
      this.audio.stopEngine();
      this.gameplay.triggerDeath(this.ship);
      this.audio.playGameOver();
    },

    completeGameOver() {
      this.gameState = 'gameover';
      if (this.gameplay.score > this.highScore) {
        this.highScore = this.gameplay.score;
        this.isNewHighScore = true;
        localStorage.setItem('spaceGameHighScore', this.highScore.toString());
      }
    },

    // Game loop
    gameLoop(currentTime = 0) {
      this.animationId = requestAnimationFrame(this.gameLoop);

      let deltaTime = (currentTime - this.lastTime) / 16.67;
      this.lastTime = currentTime;

      // Cap delta time to prevent huge jumps when returning from background/tab switch
      // This prevents stars from all aligning when coming back to the page
      if (deltaTime > 3) {
        deltaTime = 1;
      }

      if (this.gameState === 'playing' || this.gameplay.isDying) {
        this.update(deltaTime);
      }

      this.render();
    },

    update(dt) {
      // Update gameplay (handles death animation too)
      this.gameplay.update(dt, {
        onLevelUp: () => {
          this.audio.playLevelUp();
        },
        onDeathComplete: () => {
          this.completeGameOver();
        },
      });

      // Skip other updates if dying
      if (this.gameplay.isDying) {
        this.gameplay.updateExplosionParticles(dt);
        return;
      }

      // Update ship position
      const touchTarget = this.input.getTargetPosition();
      updateShip(this.ship, this.input.keys, touchTarget, this.width, dt);

      // Update stars
      updateStars(this.stars, this.width, this.height, dt);

      // Spawn and update obstacles
      spawnObstacles(this.obstacles, this.obstacleSpawnState, this.width, this.gameplay.level, dt);
      updateObstacles(this.obstacles, this.height, dt);

      // Check collisions
      if (checkCollisions(this.ship, this.obstacles)) {
        this.gameOver();
        return;
      }

      // Check close calls (pass screen width for relative distance calculation)
      this.gameplay.checkCloseCalls(this.ship, this.obstacles, this.width, {
        onCloseCall: () => {
          this.audio.playCloseCall();
        },
      });

      // Check orbits (pass screen width for relative distance calculation)
      this.gameplay.checkOrbits(this.ship, this.obstacles, this.width, {
        onOrbit: () => {
          this.audio.playCloseCall(); // Play sound on orbit completion
        },
      });

      // Update streak and particles
      this.gameplay.updateStreak(dt);
      this.gameplay.updateTrailParticles(this.ship, this.gameState, dt);
      this.gameplay.updateScorePopups(dt);
    },

    render() {
      const ctx = this.ctx;

      ctx.save();

      // Apply screen shake
      applyScreenShake(ctx, this.gameplay.screenShakeIntensity);

      // Background
      renderBackground(ctx, this.width, this.height, this.theme);

      // Stars
      renderStars(ctx, this.stars, this.isDarkTheme);

      // Progress bar to next level
      renderProgressBar(ctx, this.width, this.gameplay.score, this.gameplay.level, LEVEL_CONFIG.pointsPerLevel);

      // Trail particles (behind ship)
      renderTrailParticles(ctx, this.gameplay.trailParticles);

      // Obstacles
      renderObstacles(ctx, this.obstacles, this.sprites, this.spritesLoaded, this.theme);

      // Ship (if not completely dead)
      if (!this.gameplay.isDying || this.gameplay.deathTimer < 10) {
        renderShip(
          ctx,
          this.ship,
          this.sprites,
          this.spritesLoaded,
          this.gameplay.streak,
          this.gameplay.fireIntensity,
          this.gameplay.glowPulsePhase,
          this.theme,
        );
      }

      // Explosion particles
      renderExplosionParticles(ctx, this.gameplay.explosionParticles);

      // Score popups
      renderScorePopups(ctx, this.gameplay.scorePopups);

      // Level up celebration
      if (this.gameplay.levelUpAnimation) {
        renderLevelUpCelebration(
          ctx,
          this.width,
          this.height,
          this.gameplay.levelUpAnimation.level,
          this.gameplay.levelUpAnimation.progress,
        );
      }

      ctx.restore();
    },
  },
};
</script>

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

.space-game.embedded {
  position: relative;
  width: 100%;
  height: 100%;
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

.embedded .hud {
  position: absolute;
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

.embedded .controls-legend {
  position: absolute;
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

.embedded .menu-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
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

/* Epic Game Over Screen */
.gameover-overlay {
  background: radial-gradient(ellipse at center, rgba(20, 0, 30, 0.95) 0%, rgba(5, 5, 15, 0.98) 100%);
}

.gameover-panel {
  text-align: center;
  padding: 50px 60px;
  min-width: 400px;
  background: linear-gradient(180deg, rgba(30, 10, 40, 0.9) 0%, rgba(15, 5, 25, 0.95) 100%);
  border: 2px solid rgba(255, 50, 50, 0.4);
  border-radius: 8px;
  box-shadow:
    0 0 60px rgba(255, 50, 50, 0.3),
    inset 0 0 60px rgba(255, 50, 50, 0.05);
  animation: panelAppear 0.5s ease-out;
}

/* Gold theme for new high score */
.gameover-panel.new-record {
  border: 2px solid rgba(255, 215, 0, 0.6);
  box-shadow:
    0 0 80px rgba(255, 215, 0, 0.4),
    0 0 120px rgba(255, 180, 0, 0.2),
    inset 0 0 60px rgba(255, 215, 0, 0.05);
}

@keyframes panelAppear {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.gameover-title {
  margin-bottom: 40px;
}

.glitch {
  font-family: 'Courier New', monospace;
  font-size: 56px;
  font-weight: bold;
  color: #ff3333;
  text-shadow:
    0 0 10px #ff3333,
    0 0 20px #ff3333,
    0 0 40px #ff0000,
    0 0 80px #ff0000;
  letter-spacing: 8px;
  position: relative;
  animation: textGlow 2s ease-in-out infinite alternate;
}

/* Gold glitch for new high score */
.glitch.gold {
  color: #ffd700;
  font-size: 42px;
  text-shadow:
    0 0 10px #ffd700,
    0 0 20px #ffd700,
    0 0 40px #ffaa00,
    0 0 80px #ff8800;
  animation: goldGlow 1.5s ease-in-out infinite alternate;
}

@keyframes goldGlow {
  from {
    text-shadow:
      0 0 10px #ffd700,
      0 0 20px #ffd700,
      0 0 40px #ffaa00;
  }
  to {
    text-shadow:
      0 0 20px #ffd700,
      0 0 40px #ffd700,
      0 0 60px #ffaa00,
      0 0 100px #ff8800;
  }
}

@keyframes textGlow {
  from {
    text-shadow:
      0 0 10px #ff3333,
      0 0 20px #ff3333,
      0 0 40px #ff0000;
  }
  to {
    text-shadow:
      0 0 20px #ff3333,
      0 0 40px #ff3333,
      0 0 60px #ff0000,
      0 0 100px #ff0000;
  }
}

.gameover-stats {
  margin-bottom: 40px;
}

.stat-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
}

.stat-row.main-score .stat-value {
  font-size: 72px;
  font-weight: bold;
  color: #00d4ff;
  text-shadow:
    0 0 20px rgba(0, 212, 255, 0.8),
    0 0 40px rgba(0, 212, 255, 0.4);
  font-family: 'Courier New', monospace;
  line-height: 1;
  animation: scoreCount 0.5s ease-out;
}

@keyframes scoreCount {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.stat-row.main-score .stat-label {
  font-size: 14px;
  color: rgba(0, 212, 255, 0.6);
  letter-spacing: 4px;
  margin-top: 5px;
}

.stat-divider {
  width: 200px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent);
  margin: 25px auto;
}

.stat-row-group {
  display: flex;
  justify-content: center;
  gap: 50px;
}

.stat-row.small {
  flex-direction: column;
}

.stat-row.small .stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 2px;
  margin-bottom: 5px;
}

.stat-row.small .stat-value {
  font-size: 28px;
  color: #fff;
  font-family: 'Courier New', monospace;
}

.new-highscore {
  margin-top: 25px;
  animation: highscorePulse 0.6s ease-in-out infinite alternate;
}

.highscore-text {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
  text-shadow:
    0 0 10px rgba(255, 215, 0, 0.8),
    0 0 30px rgba(255, 215, 0, 0.5),
    0 0 50px rgba(255, 215, 0, 0.3);
  letter-spacing: 3px;
}

@keyframes highscorePulse {
  from {
    transform: scale(1);
    filter: brightness(1);
  }
  to {
    transform: scale(1.08);
    filter: brightness(1.3);
  }
}

.gameover-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 40px;
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 2px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: linear-gradient(180deg, #00d4ff 0%, #0099cc 100%);
  color: #000;
  box-shadow:
    0 0 20px rgba(0, 212, 255, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.action-btn.primary:hover {
  transform: scale(1.05);
  box-shadow:
    0 0 30px rgba(0, 212, 255, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.action-btn.secondary {
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
}

.btn-icon {
  font-size: 14px;
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
  margin: 15px 25px 20px 25px;
  flex-shrink: 0;
  width: calc(100% - 50px);
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
    width: calc(100% - 30px);
  }
}
</style>
