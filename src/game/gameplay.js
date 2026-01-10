// Gameplay systems - scoring, streaks, level progression, celebrations

import { STREAK_CONFIG, LEVEL_CONFIG, getStreakHue } from './config.js';
import { createTrailParticle, createScorePopup, createExplosionParticles } from './entities.js';

// Orbit detection config
const ORBIT_CONFIG = {
  maxDistance: 150, // Max distance to track orbit
  minDistance: 40, // Min distance (too close = collision territory)
  requiredAngle: Math.PI * 2, // Full circle (360 degrees)
  basePoints: 200, // Base points for completing an orbit
};

export class GameplaySystem {
  constructor() {
    this.reset();
  }

  reset() {
    this.score = 0;
    this.level = 1;
    this.distance = 0;

    // Streak system
    this.streak = 0;
    this.multiplier = 1;
    this.streakTimer = 0;
    this.fireIntensity = 0;

    // Visual state
    this.hudFlashIntensity = 0;
    this.hudPulseScale = 1;
    this.glowPulsePhase = 0;
    this.screenShakeIntensity = 0;

    // Level up celebration
    this.levelUpAnimation = null; // { level, progress }

    // Particles and popups
    this.trailParticles = [];
    this.explosionParticles = [];
    this.scorePopups = [];

    // Death state
    this.isDying = false;
    this.deathTimer = 0;
  }

  update(dt, callbacks = {}) {
    // Update glow pulse animation
    this.glowPulsePhase += dt * 0.15;

    // Decay HUD effects
    if (this.hudFlashIntensity > 0) {
      this.hudFlashIntensity = Math.max(0, this.hudFlashIntensity - 0.05 * dt);
    }
    if (this.hudPulseScale > 1) {
      this.hudPulseScale = Math.max(1, this.hudPulseScale - 0.02 * dt);
    }

    // Decay screen shake
    if (this.screenShakeIntensity > 0) {
      this.screenShakeIntensity = Math.max(0, this.screenShakeIntensity - 0.08 * dt);
    }

    // Update level up animation
    if (this.levelUpAnimation) {
      this.levelUpAnimation.progress += dt * 0.015; // ~2 seconds total
      if (this.levelUpAnimation.progress >= 1) {
        this.levelUpAnimation = null;
      }
    }

    // Death animation
    if (this.isDying) {
      this.deathTimer += dt;
      if (this.deathTimer > 60 && callbacks.onDeathComplete) { // ~1 second
        callbacks.onDeathComplete();
      }
      return;
    }

    // Update score with multiplier
    this.distance += dt * this.multiplier;
    this.score = Math.floor(this.distance);

    // Check for level up
    const newLevel = Math.floor(this.distance / LEVEL_CONFIG.pointsPerLevel) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.triggerLevelUp(newLevel);
      if (callbacks.onLevelUp) {
        callbacks.onLevelUp(newLevel);
      }
    }
  }

  updateStreak(dt) {
    this.streakTimer += dt;

    // Decay streak after timeout
    if (this.streakTimer > STREAK_CONFIG.decayTime) {
      if (this.streak > 0) {
        this.streak = Math.max(0, this.streak - 1);
        this.multiplier = Math.max(1, 1 + this.streak * STREAK_CONFIG.multiplierPerStreak);
        this.streakTimer = STREAK_CONFIG.decayTime * 0.5;
      }
      this.fireIntensity = Math.max(0, this.fireIntensity - 0.02);
    }
  }

  checkCloseCalls(ship, obstacles, callbacks = {}) {
    const shipX = ship.x;
    const shipY = ship.y;
    let closestDistance = Infinity;
    let isCloseToAny = false;

    // Track obstacles for "threading the needle" detection
    const nearbyObstacles = [];

    for (const obs of obstacles) {
      const dx = shipX - obs.x;
      const dy = shipY - obs.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const combinedRadius = (ship.width + obs.width) / 2;
      const gap = distance - combinedRadius;

      // Track obstacles at similar Y position for threading detection
      const yDiff = Math.abs(obs.y - shipY);
      if (yDiff < obs.height && !obs.closeCallCounted) {
        nearbyObstacles.push({ obs, dx, gap, distance });
      }

      if (gap > 0 && gap < STREAK_CONFIG.closeCallDistance) {
        isCloseToAny = true;
        closestDistance = Math.min(closestDistance, gap);

        // Mark close call if asteroid has passed ship
        if (!obs.closeCallCounted && obs.y > shipY) {
          obs.closeCallCounted = true;

          // Calculate bonus
          const closenessBonus = 1 - (gap / STREAK_CONFIG.closeCallDistance);
          const basePoints = Math.floor(50 + closenessBonus * 50);

          // Increment streak
          this.streak += 1;
          this.streakTimer = 0;

          // Update multiplier (max 10x)
          this.multiplier = Math.min(
            1 + this.streak * STREAK_CONFIG.multiplierPerStreak,
            STREAK_CONFIG.maxMultiplier,
          );

          // Visual feedback
          this.hudFlashIntensity = 1.0;
          this.hudPulseScale = 1.2;
          this.fireIntensity = Math.min(closenessBonus + (this.streak * 0.1), 1);

          // Flash the asteroid
          obs.flashIntensity = 1.0;

          // Screen shake on very close calls
          if (gap < STREAK_CONFIG.dangerDistance) {
            this.screenShakeIntensity = 0.5;
          }

          // Create score popup
          const popupText = `+${basePoints}`;
          this.scorePopups.push(createScorePopup(
            obs.x,
            obs.y - 30,
            popupText,
            getStreakHue(this.streak),
          ));

          if (callbacks.onCloseCall) {
            callbacks.onCloseCall(this.streak, basePoints);
          }
        }
      }
    }

    // "Threading the needle" - check if ship passed between two obstacles
    // Find pairs: one on left (dx > 0), one on right (dx < 0)
    const leftObs = nearbyObstacles.filter(o => o.dx > 0); // obstacle is to the left of ship
    const rightObs = nearbyObstacles.filter(o => o.dx < 0); // obstacle is to the right of ship

    for (const left of leftObs) {
      for (const right of rightObs) {
        // Check if they're close together (threading opportunity)
        const gapBetween = left.gap + right.gap + ship.width;

        // If the gap between obstacles is small (less than 2x closeCallDistance)
        // and ship is between them, award a threading bonus
        if (gapBetween < STREAK_CONFIG.closeCallDistance * 2.5) {
          // Check if either obstacle has already been counted by normal close call
          const leftCounted = left.obs.closeCallCounted;
          const rightCounted = right.obs.closeCallCounted;

          // Only trigger if both obstacles are passing the ship (y > shipY)
          if (left.obs.y > shipY && right.obs.y > shipY) {
            // Mark both as counted if not already
            if (!leftCounted) {
              left.obs.closeCallCounted = true;
              this.awardThreadingBonus(left.obs, left.gap, callbacks);
            }
            if (!rightCounted) {
              right.obs.closeCallCounted = true;
              this.awardThreadingBonus(right.obs, right.gap, callbacks);
            }
          }
        }
      }
    }

    // Extra fire intensity when very close
    if (isCloseToAny && closestDistance < STREAK_CONFIG.dangerDistance) {
      this.fireIntensity = Math.min(this.fireIntensity + 0.05, 1);
    }
  }

  awardThreadingBonus(obs, gap, callbacks) {
    // Threading the needle bonus - higher points for tight squeezes
    const closenessBonus = Math.max(0, 1 - (gap / (STREAK_CONFIG.closeCallDistance * 1.5)));
    const basePoints = Math.floor(75 + closenessBonus * 75); // Higher base for threading

    // Increment streak
    this.streak += 1;
    this.streakTimer = 0;

    // Update multiplier
    this.multiplier = Math.min(
      1 + this.streak * STREAK_CONFIG.multiplierPerStreak,
      STREAK_CONFIG.maxMultiplier,
    );

    // Visual feedback
    this.hudFlashIntensity = 1.0;
    this.hudPulseScale = 1.3; // Bigger pulse for threading
    this.fireIntensity = Math.min(closenessBonus + (this.streak * 0.1), 1);

    // Flash the asteroid
    obs.flashIntensity = 1.0;

    // Screen shake for tight threading
    this.screenShakeIntensity = 0.3;

    // Create score popup
    const popupText = `+${basePoints}`;
    this.scorePopups.push(createScorePopup(
      obs.x,
      obs.y - 30,
      popupText,
      getStreakHue(this.streak),
    ));

    if (callbacks.onCloseCall) {
      callbacks.onCloseCall(this.streak, basePoints);
    }
  }

  checkOrbits(ship, obstacles, callbacks = {}) {
    const shipX = ship.x;
    const shipY = ship.y;

    for (const obs of obstacles) {
      const dx = shipX - obs.x;
      const dy = shipY - obs.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Check if ship is in orbit range
      if (distance > ORBIT_CONFIG.minDistance && distance < ORBIT_CONFIG.maxDistance) {
        // Calculate current angle from obstacle to ship
        const currentAngle = Math.atan2(dy, dx);

        // Initialize orbit tracking if not present
        if (obs.orbitTracking === undefined) {
          obs.orbitTracking = {
            lastAngle: currentAngle,
            totalAngle: 0,
            direction: 0, // 1 = clockwise, -1 = counter-clockwise
          };
        } else {
          // Calculate angle change
          let angleDiff = currentAngle - obs.orbitTracking.lastAngle;

          // Handle angle wrapping (-π to π)
          if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

          // Detect direction on first significant movement
          if (obs.orbitTracking.direction === 0 && Math.abs(angleDiff) > 0.05) {
            obs.orbitTracking.direction = angleDiff > 0 ? 1 : -1;
          }

          // Only count angle if moving in consistent direction
          if (obs.orbitTracking.direction !== 0) {
            const expectedSign = obs.orbitTracking.direction > 0 ? 1 : -1;
            if (Math.sign(angleDiff) === expectedSign || Math.abs(angleDiff) < 0.1) {
              obs.orbitTracking.totalAngle += Math.abs(angleDiff);
            } else {
              // Wrong direction - reduce progress
              obs.orbitTracking.totalAngle = Math.max(0, obs.orbitTracking.totalAngle - Math.abs(angleDiff) * 0.5);
            }
          }

          obs.orbitTracking.lastAngle = currentAngle;

          // Check if orbit complete
          if (obs.orbitTracking.totalAngle >= ORBIT_CONFIG.requiredAngle) {
            this.awardOrbitBonus(obs, distance, callbacks);
            // Reset for another orbit
            obs.orbitTracking.totalAngle = 0;
          }
        }
      } else {
        // Out of range - reset tracking
        if (obs.orbitTracking) {
          obs.orbitTracking = undefined;
        }
      }
    }
  }

  awardOrbitBonus(obs, distance, callbacks) {
    // Closer orbit = more points
    const closenessBonus = 1 - ((distance - ORBIT_CONFIG.minDistance) /
      (ORBIT_CONFIG.maxDistance - ORBIT_CONFIG.minDistance));
    const basePoints = Math.floor(ORBIT_CONFIG.basePoints + closenessBonus * 100);

    // Big streak bonus for orbiting
    this.streak += 3;
    this.streakTimer = 0;

    // Update multiplier
    this.multiplier = Math.min(
      1 + this.streak * STREAK_CONFIG.multiplierPerStreak,
      STREAK_CONFIG.maxMultiplier,
    );

    // Strong visual feedback
    this.hudFlashIntensity = 1.0;
    this.hudPulseScale = 1.5; // Big pulse for orbit
    this.fireIntensity = Math.min(1, this.fireIntensity + 0.3);
    this.screenShakeIntensity = 0.4;

    // Flash the asteroid
    obs.flashIntensity = 1.0;

    // Create score popup with orbit text
    this.scorePopups.push(createScorePopup(
      obs.x,
      obs.y - 40,
      `ORBIT +${basePoints}`,
      getStreakHue(this.streak),
    ));

    if (callbacks.onOrbit) {
      callbacks.onOrbit(this.streak, basePoints);
    }
  }

  updateTrailParticles(ship, gameState, dt) {
    // Spawn new particles when on streak
    if (this.streak > 0 && gameState === 'playing') {
      const spawnChance = Math.min(0.3 + this.streak * 0.1, 0.8);
      if (Math.random() < spawnChance && this.trailParticles.length < 50) {
        this.trailParticles.push(createTrailParticle(
          ship.x,
          ship.y,
          ship.width,
          ship.height,
          this.streak,
          getStreakHue(this.streak),
        ));
      }
    }

    // Update existing particles
    for (let i = this.trailParticles.length - 1; i >= 0; i--) {
      const p = this.trailParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay * dt;

      if (p.life <= 0) {
        this.trailParticles.splice(i, 1);
      }
    }
  }

  updateExplosionParticles(dt) {
    for (let i = this.explosionParticles.length - 1; i >= 0; i--) {
      const p = this.explosionParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.1 * dt; // Gravity
      p.life -= p.decay * dt;

      if (p.life <= 0) {
        this.explosionParticles.splice(i, 1);
      }
    }
  }

  updateScorePopups(dt) {
    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const p = this.scorePopups[i];
      p.y += p.vy * dt;
      p.life -= p.decay * dt;

      if (p.life <= 0) {
        this.scorePopups.splice(i, 1);
      }
    }
  }

  triggerLevelUp(level) {
    this.levelUpAnimation = {
      level,
      progress: 0,
    };
    // Strong screen shake for level up
    this.screenShakeIntensity = 0.7;
    // Boost HUD effects
    this.hudFlashIntensity = 1.0;
    this.hudPulseScale = 1.4;
  }

  triggerDeath(ship) {
    this.isDying = true;
    this.deathTimer = 0;
    this.screenShakeIntensity = 1.0;

    // Create explosion particles
    this.explosionParticles = createExplosionParticles(ship.x, ship.y, 25);
  }

  // Computed properties for HUD styling
  getHudRightStyle() {
    if (this.hudFlashIntensity <= 0) return {};

    const hue = this.streak > 0 ? getStreakHue(this.streak) : 180;
    const glowSize = 10 + (this.hudFlashIntensity * 20);
    return {
      filter: `drop-shadow(0 0 ${glowSize}px hsl(${hue}, 100%, 50%))`,
    };
  }

  getMultiplierStyle() {
    const scale = this.hudPulseScale;
    const hue = this.streak > 0 ? getStreakHue(this.streak) : 30;
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
  }
}
