// Rendering system - all canvas drawing with visual juice

import { getStreakHue } from './config.js';

export function renderBackground(ctx, width, height, theme) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, theme.bg1);
  gradient.addColorStop(1, theme.bg2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

export function renderStars(ctx, stars, isDarkTheme) {
  const starColor = isDarkTheme ? '255, 255, 255' : '0, 0, 50';
  for (const star of stars) {
    ctx.fillStyle = `rgba(${starColor}, ${star.alpha * (isDarkTheme ? 1 : 0.3)})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function renderTrailParticles(ctx, particles) {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.life * 0.8;
    ctx.shadowColor = `hsl(${p.hue}, 100%, 60%)`;
    ctx.shadowBlur = p.size * 2;
    ctx.fillStyle = `hsl(${p.hue}, 100%, 70%)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function renderExplosionParticles(ctx, particles) {
  for (const p of particles) {
    if (p.type !== 'explosion') continue;
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.shadowColor = `hsl(${p.hue}, 100%, 60%)`;
    ctx.shadowBlur = p.size * 3;
    ctx.fillStyle = `hsl(${p.hue}, 100%, 70%)`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function renderShip(ctx, ship, sprites, spritesLoaded, streak, fireIntensity, glowPulsePhase, theme) {
  const { x, y, width, height } = ship;

  ctx.save();
  ctx.translate(x, y);

  const hue = getStreakHue(streak);

  // Pulsing glow aura when on streak
  if (streak > 0) {
    const pulseAmount = Math.sin(glowPulsePhase) * 0.3 + 0.7;
    const baseGlowRadius = 30 + streak * 8;
    const glowRadius = baseGlowRadius * pulseAmount;
    const glowAlpha = Math.min(0.3 + streak * 0.05, 0.6) * pulseAmount;

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

  // Fire trail behind ship
  if (fireIntensity > 0) {
    const trailLength = 20 + fireIntensity * 60;
    const gradient = ctx.createLinearGradient(0, height / 2, 0, height / 2 + trailLength);
    gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, ${0.8 * fireIntensity})`);
    gradient.addColorStop(0.3, `hsla(${Math.max(0, hue - 20)}, 100%, 60%, ${0.6 * fireIntensity})`);
    gradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(-width / 3, height / 2);
    ctx.lineTo(0, height / 2 + trailLength);
    ctx.lineTo(width / 3, height / 2);
    ctx.closePath();
    ctx.fill();
  }

  // Draw ship sprite or fallback
  if (spritesLoaded && sprites.ship) {
    const spriteSize = Math.max(width, height) * 1.5;

    if (streak > 0) {
      ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
      ctx.shadowBlur = 15 + streak * 5;
    }

    ctx.drawImage(sprites.ship, -spriteSize / 2, -spriteSize / 2, spriteSize, spriteSize);
  } else {
    // Fallback shape
    const shipHue = streak > 0 ? hue : 180;
    ctx.shadowColor = streak > 0 ? `hsl(${shipHue}, 100%, 50%)` : theme.ship;
    ctx.shadowBlur = 20 + streak * 3;

    ctx.fillStyle = streak > 0 ? `hsl(${shipHue}, 100%, 50%)` : theme.ship;
    ctx.beginPath();
    ctx.moveTo(0, -height / 2);
    ctx.lineTo(-width / 2, height / 2);
    ctx.lineTo(width / 2, height / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = theme.bg1;
    ctx.beginPath();
    ctx.moveTo(0, -height / 4);
    ctx.lineTo(-width / 4, height / 4);
    ctx.lineTo(width / 4, height / 4);
    ctx.closePath();
    ctx.fill();

    // Engine flame
    const flameHeight = 15 + fireIntensity * 40 + Math.random() * 5;
    ctx.shadowColor = theme.engine;
    ctx.shadowBlur = 15 + fireIntensity * 20;
    ctx.fillStyle = theme.engine;
    ctx.beginPath();
    ctx.moveTo(-width / 4, height / 2);
    ctx.lineTo(0, height / 2 + flameHeight);
    ctx.lineTo(width / 4, height / 2);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

export function renderObstacles(ctx, obstacles, sprites, spritesLoaded, theme) {
  for (const obs of obstacles) {
    ctx.save();
    ctx.translate(obs.x, obs.y);
    ctx.rotate(obs.rotation);

    // Flash effect on close call
    if (obs.flashIntensity > 0) {
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 30 * obs.flashIntensity;
      ctx.globalAlpha = 1;
    }

    if (spritesLoaded && sprites.asteroids[obs.spriteIndex]) {
      const size = obs.width * 1.2;
      ctx.drawImage(sprites.asteroids[obs.spriteIndex], -size / 2, -size / 2, size, size);
    } else {
      ctx.shadowColor = theme.asteroidGlow;
      ctx.shadowBlur = 10;
      ctx.fillStyle = theme.asteroid;
      ctx.strokeStyle = theme.asteroidGlow;
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
}

// Score popup rendering (+50, +100, etc.)
export function renderScorePopups(ctx, popups) {
  for (const p of popups) {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = `hsl(${p.hue}, 100%, 60%)`;
    ctx.shadowColor = `hsl(${p.hue}, 100%, 50%)`;
    ctx.shadowBlur = 10;
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
  }
}

// BIG LEVEL UP CELEBRATION
export function renderLevelUpCelebration(ctx, width, height, level, progress) {
  // progress: 0 to 1 (animation progress)
  // Easing function for smooth animation
  const easeOutBack = (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  const easeIn = progress < 0.5;
  const animProgress = easeIn ? easeOutBack(progress * 2) : 1 - ((progress - 0.5) * 2);

  // Scale: grows in, then fades out
  const scale = easeIn ? animProgress : 1;
  const alpha = easeIn ? Math.min(1, progress * 4) : Math.max(0, 1 - (progress - 0.5) * 2);

  // FULL SCREEN FLASH at the start
  if (progress < 0.15) {
    const flashAlpha = (0.15 - progress) / 0.15 * 0.4;
    ctx.save();
    ctx.fillStyle = `rgba(0, 212, 255, ${flashAlpha})`;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(width / 2, height / 2);
  ctx.scale(scale, scale);

  // Glow effect
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur = 50;

  // Main text
  ctx.font = 'bold 80px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#00d4ff';
  ctx.fillText(`LEVEL ${level}`, 0, -20);

  // Decorative lines
  ctx.strokeStyle = '#00d4ff';
  ctx.lineWidth = 3;
  const lineWidth = 150 * animProgress;
  ctx.beginPath();
  ctx.moveTo(-lineWidth, 30);
  ctx.lineTo(lineWidth, 30);
  ctx.stroke();

  // Stars around the text
  if (easeIn) {
    const starCount = 8;
    for (let i = 0; i < starCount; i++) {
      const angle = (i / starCount) * Math.PI * 2 + progress * 2;
      const dist = 120 + Math.sin(progress * 10 + i) * 20;
      const sx = Math.cos(angle) * dist;
      const sy = Math.sin(angle) * dist;

      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700';
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();

  // Screen flash at start
  if (progress < 0.1) {
    ctx.save();
    ctx.globalAlpha = (0.1 - progress) * 3;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}

// Progress bar to next level
export function renderProgressBar(ctx, width, score, level, pointsPerLevel) {
  const barWidth = 200;
  const barHeight = 4;
  const barX = width / 2 - barWidth / 2;
  const barY = 10;

  const currentLevelStart = (level - 1) * pointsPerLevel;
  const progress = (score - currentLevelStart) / pointsPerLevel;

  ctx.save();

  // Background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fillRect(barX, barY, barWidth, barHeight);

  // Progress fill
  const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
  gradient.addColorStop(0, '#00d4ff');
  gradient.addColorStop(1, '#00ffaa');
  ctx.fillStyle = gradient;
  ctx.fillRect(barX, barY, barWidth * Math.min(progress, 1), barHeight);

  // Glow when nearly full
  if (progress > 0.8) {
    ctx.shadowColor = '#00ffaa';
    ctx.shadowBlur = 10 + Math.sin(Date.now() / 100) * 5;
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
  }

  ctx.restore();
}

// Screen shake helper
export function applyScreenShake(ctx, intensity) {
  if (intensity <= 0) return;
  const shakeX = (Math.random() - 0.5) * intensity * 10;
  const shakeY = (Math.random() - 0.5) * intensity * 10;
  ctx.translate(shakeX, shakeY);
}
