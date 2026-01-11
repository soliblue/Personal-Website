// Physics system - movement, collision detection

import { OBSTACLE_CONFIG, getScaleFactor } from './config.js';
import { createObstacle } from './entities.js';

export function updateShip(ship, keys, touchTarget, width, dt) {
  // Keyboard movement with acceleration
  if (keys.left) {
    ship.velocityX -= ship.acceleration * dt;
  }
  if (keys.right) {
    ship.velocityX += ship.acceleration * dt;
  }
  if (keys.up) {
    ship.velocityY -= ship.acceleration * dt;
  }
  if (keys.down) {
    ship.velocityY += ship.acceleration * dt;
  }

  // Apply friction
  ship.velocityX *= ship.friction;
  ship.velocityY *= ship.friction;

  // Clamp velocity
  ship.velocityX = Math.max(-ship.speed, Math.min(ship.speed, ship.velocityX));
  ship.velocityY = Math.max(-ship.speed, Math.min(ship.speed, ship.velocityY));

  // Apply velocity
  ship.x += ship.velocityX * dt;
  ship.y += ship.velocityY * dt;

  // Touch movement (smooth follow)
  if (touchTarget.x !== null) {
    const diffX = touchTarget.x - ship.x;
    ship.x += diffX * 0.2 * dt;
  }
  if (touchTarget.y !== null) {
    const diffY = touchTarget.y - ship.y;
    ship.y += diffY * 0.2 * dt;
  }

  // Keep ship in bounds
  const halfWidth = ship.width / 2;
  ship.x = Math.max(halfWidth, Math.min(width - halfWidth, ship.x));
  ship.y = Math.max(ship.minY, Math.min(ship.maxY, ship.y));
}

export function updateStars(stars, width, height, dt) {
  for (const star of stars) {
    star.y += star.speed * dt;
    if (star.y > height) {
      star.y = 0;
      star.x = Math.random() * width;
    }
  }
}

export function updateObstacles(obstacles, height, dt) {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.y += obs.speed * dt;
    obs.rotation += obs.rotationSpeed * dt;

    // Decay flash intensity
    if (obs.flashIntensity > 0) {
      obs.flashIntensity = Math.max(0, obs.flashIntensity - 0.05 * dt);
    }

    // Remove if off screen
    if (obs.y > height + obs.height) {
      obstacles.splice(i, 1);
    }
  }
}

export function spawnObstacles(obstacles, state, width, level, dt) {
  state.timer += dt;

  const spawnInterval = OBSTACLE_CONFIG.baseSpawnInterval / (1 + (level - 1) * 0.1);

  if (state.timer >= spawnInterval) {
    state.timer = 0;

    // Speed doubles every 10 levels (exponential growth)
    const speed = OBSTACLE_CONFIG.baseSpeed * Math.pow(2, (level - 1) / 10);

    // Scale down for mobile, keep original size for desktop
    const scale = getScaleFactor(width);
    const minSize = OBSTACLE_CONFIG.minSize * scale;
    const maxSize = OBSTACLE_CONFIG.maxSize * scale;
    const size = minSize + Math.random() * (maxSize - minSize);

    obstacles.push(createObstacle(
      Math.random() * (width - size) + size / 2,
      size,
      speed,
    ));
  }
}

export function checkCollisions(ship, obstacles) {
  const shipHitbox = {
    x: ship.x - ship.width * 0.35,
    y: ship.y - ship.height * 0.35,
    width: ship.width * 0.7,
    height: ship.height * 0.7,
  };

  for (const obs of obstacles) {
    const obsHitbox = {
      x: obs.x - obs.width * 0.4,
      y: obs.y - obs.height * 0.4,
      width: obs.width * 0.8,
      height: obs.height * 0.8,
    };

    if (aabbCollision(shipHitbox, obsHitbox)) {
      return true; // Collision detected
    }
  }
  return false;
}

export function aabbCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function updateParticles(particles, dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += (p.vx || 0) * dt;
    p.y += (p.vy || 0) * dt;
    p.life -= p.decay * dt;

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

export function updateScorePopups(popups, dt) {
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.y += p.vy * dt;
    p.life -= p.decay * dt;

    if (p.life <= 0) {
      popups.splice(i, 1);
    }
  }
}
