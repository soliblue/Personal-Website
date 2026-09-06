import test from 'node:test';
import assert from 'node:assert/strict';
import { HOPS_LEVELS, HOPS_PHYSICS, LEVEL_WIDTH, levelGround } from '../../src/game/hops-levels.js';
import { InputSystem } from '../../src/game/input.js';
import { GameplaySystem } from '../../src/game/gameplay.js';

test('every Claude gap is comfortably within a running jump', () => {
  const range = 2 * Math.abs(HOPS_PHYSICS.jump) / HOPS_PHYSICS.gravity * HOPS_PHYSICS.run;
  for (const level of HOPS_LEVELS) {
    assert.ok(level.gaps.every(([, width]) => width + 45 < range));
    assert.equal(levelGround(level).reduce((sum, [, width]) => sum + width, 0)
      + level.gaps.reduce((sum, [, width]) => sum + width, 0), LEVEL_WIDTH);
    assert.ok(levelGround(level).every(([, width]) => width > 0));
  }
});

test('Space touch input maps a scaled window into canvas coordinates', () => {
  const input = new InputSystem();
  input.canvas = { width: 800, height: 600, getBoundingClientRect: () => ({ left: 100, top: 50, width: 400, height: 300 }) };
  input.touchX = 300; input.touchY = 200;
  assert.deepEqual(input.getTargetPosition(), { x: 400, y: 255 });
  input.reset();
  assert.deepEqual(input.getTargetPosition(), { x: null, y: null });
});

test('Space keyboard shortcuts ignore other windows and editable fields', () => {
  const input = new InputSystem();
  let pulses = 0;
  input.callbacks = { isActive: () => false, onPulse: () => pulses++ };
  const event = { key: ' ', target: { tagName: 'DIV' }, preventDefault() {} };
  input.onKeyDown(event);
  input.callbacks.isActive = () => true;
  input.onKeyDown({ ...event, target: { tagName: 'TEXTAREA' } });
  input.onKeyDown({ ...event, repeat: true });
  assert.equal(pulses, 0);
  input.onKeyDown(event);
  assert.equal(pulses, 1);
});

test('Space threading bonus is credited to the score, not only the popup', () => {
  const gameplay = new GameplaySystem();
  gameplay.awardThreadingBonus({ x: 100, y: 100 }, 10, 40, {});
  assert.ok(gameplay.distance >= 75);
  gameplay.update(0);
  assert.equal(gameplay.score, Math.floor(gameplay.distance));
});
