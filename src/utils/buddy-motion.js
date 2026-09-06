const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => value * value * (3 - 2 * value);
const mix = (from, to, progress) => from + (to - from) * progress;

export const BUDDY_MOTION_DURATION = { snack: 4700, jump: 1500, flip: 1700 };

// Absolute elapsed time keeps poses and travel in sync, even after a slow frame.
export function sampleBuddyMotion(kind, elapsed, from, to, reduced = false) {
  const duration = BUDDY_MOTION_DURATION[kind];
  const time = Math.max(0, Math.min(duration, elapsed));
  const pose = {
    x: from, lift: 0, tilt: 0, scaleX: 1, scaleY: 1,
    frame: 'idle', activity: 'idle', phase: 'idle', acorn: null,
    bite: 0, crumbs: false, dust: false, ate: false, done: time >= duration,
  };
  if (kind === 'snack') {
    if (time < 1720) {
      pose.activity = 'fetching';
      const toss = clamp(time / 600);
      pose.acorn = {
        x: mix(from + 38, to + 38, smooth(toss)),
        lift: reduced ? 0 : 100 * 4 * toss * (1 - toss),
        tilt: reduced ? 0 : mix(-100, 35, toss),
      };
      if (time < 420) {
        pose.phase = 'spot';
        pose.frame = 'curious';
      } else if (time < 1350) {
        const chase = clamp((time - 420) / 930);
        pose.phase = 'chase';
        pose.x = mix(from, to, smooth(chase));
        pose.frame = Math.floor(time / 105) % 2 ? 'walk-a' : 'walk-b';
        pose.lift = Math.abs(Math.sin(chase * Math.PI * 6)) * 5;
      } else {
        pose.x = to;
        pose.phase = 'pickup';
        pose.frame = 'sit';
        pose.tilt = 12;
        pose.scaleY = 0.9;
      }
    } else if (time < 3820) {
      pose.x = to;
      pose.phase = 'nibble';
      pose.activity = 'eating';
      pose.frame = 'sit';
      pose.bite = clamp((time - 1720) / 2100);
      pose.crumbs = time > 1950;
      const chew = Math.sin((time - 1720) / 65);
      pose.scaleX = 1 + chew * 0.018;
      pose.scaleY = 1 - chew * 0.025;
      pose.tilt = chew * 1.5;
    } else {
      const hop = clamp((time - 3820) / 650);
      pose.x = to;
      pose.phase = 'satisfied';
      pose.activity = 'celebrating';
      pose.frame = hop < 1 ? 'excited' : 'blink';
      pose.lift = Math.sin(hop * Math.PI) * 28;
      pose.ate = true;
      pose.dust = hop >= 1;
    }
  } else {
    const flightEnd = kind === 'flip' ? 1300 : 1100;
    pose.activity = kind === 'flip' ? 'flipping' : 'jumping';
    if (time < 220) {
      const crouch = time / 220;
      pose.phase = 'crouch';
      pose.frame = 'sit';
      pose.scaleX = 1 + crouch * 0.16;
      pose.scaleY = 1 - crouch * 0.2;
    } else if (time < flightEnd) {
      const flight = (time - 220) / (flightEnd - 220);
      pose.phase = 'airborne';
      pose.frame = 'hop';
      pose.x = mix(from, to, smooth(flight));
      pose.lift = 4 * flight * (1 - flight) * (kind === 'flip' ? 125 : 95);
      pose.tilt = kind === 'flip' ? smooth(flight) * 360 : -12 + flight * 24;
      pose.scaleX = 0.94;
      pose.scaleY = 1.06;
    } else {
      const landing = clamp((time - flightEnd) / 260);
      pose.x = to;
      pose.phase = 'landing';
      pose.frame = landing < 0.5 ? 'sit' : 'excited';
      pose.scaleX = 1 + (1 - landing) * 0.2;
      pose.scaleY = 1 - (1 - landing) * 0.24;
      pose.dust = true;
    }
  }
  if (reduced) {
    pose.x = from;
    pose.lift = 0;
    pose.tilt = 0;
    pose.scaleX = 1;
    pose.scaleY = 1;
    pose.dust = false;
    pose.crumbs = false;
    if (pose.acorn) pose.acorn = { x: from + 38, lift: 0, tilt: 0 };
    if (kind !== 'snack') pose.frame = 'excited';
  }
  return pose;
}
