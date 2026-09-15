import test from 'node:test';
import assert from 'node:assert/strict';
import { EXTRA_BUDDY_LINES, EXTRA_BUDDY_REACTIONS, KINDNESS_QUOTE } from '../../src/utils/buddy-personality.js';

test('the attributed kindness excerpt is available for pokes and quiet moments', () => {
  assert.ok(KINDNESS_QUOTE.includes('try to be a little kinder'));
  assert.ok(KINDNESS_QUOTE.endsWith('Aldous Huxley'));
  assert.ok(EXTRA_BUDDY_LINES.includes(KINDNESS_QUOTE));
  assert.ok(EXTRA_BUDDY_REACTIONS.idle.includes(KINDNESS_QUOTE));
});
