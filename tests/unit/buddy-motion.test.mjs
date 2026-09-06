import assert from 'node:assert/strict';
import test from 'node:test';
import { BUDDY_MOTION_DURATION, sampleBuddyMotion } from '../../src/utils/buddy-motion.js';

test('snack has a chase, pickup, visible eating, and rewards only after eating', () => {
  assert.equal(sampleBuddyMotion('snack', 0, 100, 240).phase, 'spot');
  const chase = sampleBuddyMotion('snack', 900, 100, 240);
  assert.equal(chase.phase, 'chase');
  assert.ok(chase.x > 100 && chase.x < 240);
  assert.equal(sampleBuddyMotion('snack', 1400, 100, 240).phase, 'pickup');
  const eating = sampleBuddyMotion('snack', 2500, 100, 240);
  assert.equal(eating.activity, 'eating');
  assert.equal(eating.acorn, null);
  assert.equal(eating.ate, false);
  assert.ok(eating.bite > 0 && eating.bite < 1);
  assert.equal(sampleBuddyMotion('snack', 3820, 100, 240).ate, true);
});

test('jump and flip rise, travel, squash on landing, and settle exactly', () => {
  for (const kind of ['jump', 'flip']) {
    const crouch = sampleBuddyMotion(kind, 180, 300, 180);
    assert.ok(crouch.scaleY < 1);
    const peak = sampleBuddyMotion(kind, kind === 'flip' ? 760 : 660, 300, 180);
    assert.equal(peak.phase, 'airborne');
    assert.ok(peak.lift >= 95);
    assert.equal(peak.x, 240);
    if (kind === 'flip') assert.equal(peak.tilt, 180);
    const land = sampleBuddyMotion(kind, kind === 'flip' ? 1300 : 1100, 300, 180);
    assert.equal(land.lift, 0);
    assert.ok(land.scaleY < 1);
    const done = sampleBuddyMotion(kind, 99999, 300, 180);
    assert.equal(done.x, 180);
    assert.equal(done.scaleY, 1);
    assert.equal(done.tilt, 0);
    assert.equal(done.done, true);
  }
});

test('motion stays within its route and reduced motion has no displacement', () => {
  for (const [kind, duration] of Object.entries(BUDDY_MOTION_DURATION)) {
    for (let time = 0; time <= duration + 500; time += 20) {
      const pose = sampleBuddyMotion(kind, time, 240, 20);
      assert.ok(pose.x >= 20 && pose.x <= 240);
      assert.ok(pose.lift >= -1e-10 && pose.lift <= 125);
      const still = sampleBuddyMotion(kind, time, 240, 20, true);
      assert.equal(still.x, 240);
      assert.equal(still.lift, 0);
      assert.equal(still.tilt, 0);
      assert.equal(still.scaleY, 1);
      assert.equal(still.crumbs, false);
      assert.equal(still.dust, false);
    }
  }
});
