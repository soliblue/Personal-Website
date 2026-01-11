// Game configuration and constants

export const THEMES = {
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
};

// Reference width for scaling - sizes stay fixed above this, scale down below
export const REFERENCE_WIDTH = 500;

export const SHIP_CONFIG = {
  width: 40,
  height: 50,
  speed: 12,
  acceleration: 0.8,
  friction: 0.92,
};

export const OBSTACLE_CONFIG = {
  baseSpawnInterval: 60, // frames
  baseSpeed: 6, // doubled for faster start
  minSize: 30,
  maxSize: 60,
};

export const STREAK_CONFIG = {
  decayTime: 90, // frames before streak starts decaying (1.5x longer)
  closeCallDistance: 160, // pixels
  dangerDistance: 80, // extra close = better bonus
  maxMultiplier: 10,
  multiplierPerStreak: 0.5,
};

// Helper to scale sizes for mobile - only scales DOWN, never up
export function getScaleFactor(screenWidth) {
  if (screenWidth >= REFERENCE_WIDTH) return 1;
  return screenWidth / REFERENCE_WIDTH;
}

export const PARTICLE_CONFIG = {
  maxTrailParticles: 50,
};

export const LEVEL_CONFIG = {
  pointsPerLevel: 1000,
};

// Get streak hue color based on streak level
// streak 0-2: cyan (180), streak 3-5: orange (30), streak 6+: red (0)
export function getStreakHue(streak) {
  if (streak <= 2) {
    return 180;
  } else if (streak <= 5) {
    const t = (streak - 2) / 3;
    return 180 - t * 150;
  }
  const t = Math.min((streak - 5) / 5, 1);
  return 30 - t * 30;
}
