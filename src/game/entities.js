// Entity creation and initialization

import { SHIP_CONFIG, getScaleFactor } from './config.js';

export function createShip(screenWidth, screenHeight) {
  // Scale down for mobile, keep original size for desktop
  const scale = getScaleFactor(screenWidth);

  return {
    x: screenWidth / 2,
    y: screenHeight - 100,
    width: SHIP_CONFIG.width * scale,
    height: SHIP_CONFIG.height * scale,
    speed: SHIP_CONFIG.speed,
    velocityX: 0,
    velocityY: 0,
    acceleration: SHIP_CONFIG.acceleration,
    friction: SHIP_CONFIG.friction,
    targetX: null,
    targetY: null,
    minY: 0,
    maxY: 0,
  };
}

export function createStars(width, height) {
  const stars = [];
  // Create 3 layers of stars for parallax
  for (let layer = 0; layer < 3; layer++) {
    const count = 30 + layer * 20;
    const speed = 0.5 + layer * 0.5;
    const size = 1 + layer * 0.5;

    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speed,
        size,
        alpha: 0.3 + Math.random() * 0.7,
      });
    }
  }
  return stars;
}

export function generateAsteroidVertices() {
  const vertices = [];
  const numVertices = 7 + Math.floor(Math.random() * 4);
  for (let i = 0; i < numVertices; i++) {
    const angle = (i / numVertices) * Math.PI * 2;
    const radius = 0.7 + Math.random() * 0.3;
    vertices.push({ angle, radius });
  }
  return vertices;
}

export function createObstacle(x, size, speed) {
  return {
    x,
    y: -size,
    width: size,
    height: size,
    speed,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.1,
    vertices: generateAsteroidVertices(),
    spriteIndex: Math.floor(Math.random() * 3),
    passedBy: false,
    closeCallCounted: false,
    flashIntensity: 0, // For close-call flash effect
  };
}

export function createTrailParticle(x, y, shipWidth, shipHeight, streak, hue) {
  return {
    x: x + (Math.random() - 0.5) * shipWidth * 0.6,
    y: y + shipHeight / 2,
    vx: (Math.random() - 0.5) * 2,
    vy: 2 + Math.random() * 3,
    life: 1.0,
    decay: 0.02 + Math.random() * 0.02,
    size: 2 + Math.random() * 3 + streak * 0.5,
    hue,
  };
}

// Death explosion particles
export function createExplosionParticles(x, y, count = 20) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const speed = 3 + Math.random() * 5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0,
      decay: 0.015 + Math.random() * 0.01,
      size: 3 + Math.random() * 5,
      hue: 180 + Math.random() * 40, // Cyan-ish
      type: 'explosion',
    });
  }
  return particles;
}

// Score popup entity
export function createScorePopup(x, y, text, hue = 50) {
  return {
    x,
    y,
    text,
    hue,
    life: 1.0,
    decay: 0.02,
    vy: -2, // Float upward
  };
}
