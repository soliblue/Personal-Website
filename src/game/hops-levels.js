export const HOPS_LEVELS = [
  { name: 'Meadow.exe', sky: '#9ddce5', speed: 38, gaps: [[920, 80], [1740, 90], [2520, 80]],
    platforms: [[280, 288, 96], [470, 224, 96], [660, 272, 96], [1110, 284, 128], [1300, 218, 96], [1920, 278, 96], [2070, 214, 96]] },
  { name: 'Cloud Cache', sky: '#c1daf5', speed: 48, gaps: [[760, 85], [1480, 90], [2200, 100]],
    platforms: [[240, 280, 96], [390, 212, 96], [540, 146, 96], [705, 202, 128], [900, 270, 96], [1190, 280, 96], [1350, 214, 96], [1500, 152, 96], [1790, 278, 96], [1950, 212, 96], [2150, 258, 160], [2440, 280, 96]] },
  { name: 'The Final Build', sky: '#f2bcc3', speed: 58, gaps: [[840, 90], [1640, 100], [2360, 100]],
    platforms: [[280, 280, 64], [420, 216, 64], [560, 152, 96], [735, 216, 64], [1070, 278, 96], [1230, 214, 64], [1530, 278, 64], [1670, 214, 64], [1810, 152, 96], [2110, 278, 64], [2250, 214, 64], [2390, 152, 96]] },
];

export const LEVEL_WIDTH = 3100;
export const FLOOR_Y = 344;
export const HOPS_PHYSICS = { gravity: 1100, jump: -465, run: 205, acceleration: 1400 };

export function levelGround(level) {
  const spans = [];
  let start = 0;
  for (const [x, width] of level.gaps) {
    spans.push([start, x - start]);
    start = x + width;
  }
  spans.push([start, LEVEL_WIDTH - start]);
  return spans;
}
