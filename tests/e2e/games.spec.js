import { expect, test } from '@playwright/test';

test('Claude uses the same transparent pixel mascot across desktop and game', async ({ page }) => {
  await page.goto('/windows95');
  await expect(page.locator('.boot-screen')).toBeHidden();
  const icon = page.getByRole('img', { name: 'Claude Hops', exact: true });
  await expect(icon).toBeVisible();
  const source = await icon.getAttribute('src');
  const pixels = await icon.evaluate(async image => {
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let opaque = 0;
    const colors = new Set();
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3]) {
        opaque++;
        colors.add(`${data[i]},${data[i + 1]},${data[i + 2]}`);
      }
    }
    return { cornerAlpha: data[3], coverage: opaque / (data.length / 4), colors: colors.size };
  });
  expect(pixels.cornerAlpha).toBe(0);
  expect(pixels.coverage).toBeGreaterThan(0.4);
  expect(pixels.coverage).toBeLessThan(0.8);
  expect(pixels.colors).toBe(6);
  await page.getByRole('button', { name: /start/i }).click();
  const menuItem = page.locator('.menu-item-row', { hasText: 'Claude Hops' });
  await expect(menuItem.locator('img')).toHaveAttribute('src', source);
  await menuItem.click();
  const window = page.locator('.win95-window').filter({ has: page.locator('.code-hop') });
  await expect(window.locator('.titlebar-icon')).toHaveAttribute('src', source);
  await expect(window.locator('.panel-mascot')).toHaveAttribute('src', source);
  await expect(window.locator('.hud-brand img')).toHaveAttribute('src', source);
  await expect(window.getByRole('button', { name: 'START', exact: true })).toBeEnabled();
});

test('Claude can jump through a ledge, land on it, and collect stars', async ({ page }) => {
  test.skip(test.info().project.name !== 'chromium', 'Keyboard platforming flow.');
  await page.goto('/code-hop');
  await page.getByRole('button', { name: 'START', exact: true }).click();
  const game = page.locator('.code-hop');
  await expect(game).toHaveAttribute('data-airborne', 'false');
  await page.keyboard.down('ArrowRight');
  await expect.poll(async () => Number(await game.getAttribute('data-x')), { intervals: [30] }).toBeGreaterThan(300);
  await page.keyboard.up('ArrowRight');
  await page.keyboard.down('Space');
  await expect.poll(async () => Number(await game.getAttribute('data-y'))).toBeLessThan(270);
  await page.keyboard.up('Space');
  await expect(game).toHaveAttribute('data-airborne', 'false');
  expect(Number(await game.getAttribute('data-y'))).toBeLessThan(290);
  expect(Number(await game.getAttribute('data-score'))).toBeGreaterThan(25);
});

test('Claude touch controls support moving and jumping together', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile-chrome', 'Multitouch flow.');
  await page.goto('/code-hop');
  await page.getByRole('button', { name: 'START', exact: true }).tap();
  const game = page.locator('.code-hop');
  await expect(game).toHaveAttribute('data-airborne', 'false');
  const right = await page.getByRole('button', { name: 'Move right' }).boundingBox();
  const jump = await page.getByRole('button', { name: 'Jump', exact: true }).boundingBox();
  const cdp = await page.context().newCDPSession(page);
  const point = (box, id) => ({ x: box.x + box.width / 2, y: box.y + box.height / 2, id });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(right, 1)] });
  await page.waitForTimeout(50);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(right, 1), point(jump, 2)] });
  await expect(game).toHaveAttribute('data-airborne', 'true');
  await expect.poll(async () => Number(await game.getAttribute('data-y')), { intervals: [20] }).toBeLessThan(280);
  await expect.poll(async () => Number(await game.getAttribute('data-x'))).toBeGreaterThan(130);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  const size = await page.locator('.hop-stage canvas').boundingBox();
  expect(size.width).toBeLessThanOrEqual(394);
  await page.screenshot({ path: 'test-results/claude-mobile.png' });
});

test('falling in Claude respawns without freezing the game', async ({ page }) => {
  test.skip(test.info().project.name !== 'chromium', 'Physics recovery flow.');
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/code-hop');
  await page.getByRole('button', { name: 'START', exact: true }).click();
  const game = page.locator('.code-hop');
  await page.keyboard.down('ArrowRight');
  await expect.poll(async () => Number(await game.getAttribute('data-x')), { intervals: [30], timeout: 10000 }).toBeGreaterThan(850);
  await expect.poll(async () => Number(await game.getAttribute('data-x')), { intervals: [30] }).toBeLessThan(250);
  await page.keyboard.up('ArrowRight');
  await expect(game).toHaveAttribute('data-state', 'playing');
  expect(Number(await game.getAttribute('data-hearts'))).toBeLessThan(3);
  await expect(game).toHaveAttribute('data-airborne', 'false');
  await page.keyboard.down('Space');
  await expect.poll(async () => Number(await game.getAttribute('data-y')), { intervals: [20] }).toBeLessThan(280);
  await page.keyboard.up('Space');
  expect(errors).toEqual([]);
});

test('Codex Cruise keeps the old high score and uses its ship throughout the desktop', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('spaceGameHighScore', '123456'));
  await page.goto('/windows95');
  await expect(page.locator('.boot-screen')).toBeHidden();
  const icon = page.getByRole('img', { name: 'Codex Cruise', exact: true });
  await expect(icon).toBeVisible();
  const source = await icon.getAttribute('src');
  expect(source).toContain('codex-flies-ship');
  await page.getByRole('button', { name: /start/i }).click();
  const menuItem = page.locator('.menu-item-row', { hasText: 'Codex Cruise' });
  await expect(menuItem.locator('img')).toHaveAttribute('src', source);
  await menuItem.click();
  const window = page.locator('.win95-window').filter({ has: page.locator('.space-game') });
  await expect(window.locator('.titlebar-text')).toHaveText('Codex Cruise');
  await expect(window.locator('.titlebar-icon')).toHaveAttribute('src', source);
  await expect(window.locator('.high')).toHaveText('HIGH: 123456');
  await window.getByRole('button', { name: 'MENU', exact: true }).click();
  await expect(window.locator('.flight-emblem')).toHaveAttribute('src', source);
  await expect(window.locator('.flight-title')).toHaveText('CODEX CRUISE');
  await expect(page.locator('.taskbar-window', { hasText: 'Codex Cruise' })).toBeVisible();
});

test('Space pulse spends its charge, pauses, and resets', async ({ page }) => {
  await page.goto('/space');
  const pulse = page.getByRole('button', { name: 'PULSE', exact: true });
  await expect(pulse).toBeEnabled();
  await pulse.click();
  await expect(page.locator('.hud-left button').nth(1)).toBeDisabled();
  await page.getByRole('button', { name: 'MENU', exact: true }).click();
  const panel = await page.locator('.menu-panel').boundingBox();
  expect(panel.y).toBeGreaterThanOrEqual(0);
  expect(panel.y + panel.height).toBeLessThanOrEqual(page.viewportSize().height);
  const charge = await page.locator('.hud-left button').nth(1).textContent();
  await page.waitForTimeout(400);
  await expect(page.locator('.hud-left button').nth(1)).toHaveText(charge);
  await page.getByRole('button', { name: 'New flight' }).click();
  await expect(pulse).toBeEnabled();
  await expect(page.locator('.shield-stat')).toContainText('READY');
  await page.screenshot({ path: `test-results/space-${test.info().project.name}.png` });
});
