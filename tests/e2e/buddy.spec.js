import { expect, test } from '@playwright/test';

async function boot(page) {
  await page.goto('/windows95');
  await expect(page.locator('.desktop-icon').first()).toBeVisible();
  await expect(page.locator('.boot-screen')).toBeHidden();
  await expect(page.locator('.buddy-activities')).toHaveCount(0);
}

async function action(page, name) {
  await page.getByRole('button', { name: 'Talk to the desktop squirrel' }).press('Shift+F10');
  await page.getByRole('menuitem', { name, exact: true }).click();
}

test('squirrel fetches acorns, remembers treats, and accepts head pats', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await boot(page);
  const pet = page.locator('.desktop-buddy');
  await action(page, 'Toss an acorn');
  await expect(page.locator('.buddy-acorn')).toBeVisible();
  await expect(pet).toHaveAttribute('data-activity', 'fetching');
  await expect(pet).toHaveAttribute('data-phase', 'nibble');
  await expect(page.locator('.buddy-held-acorn')).toBeVisible();
  await expect(pet).toHaveAttribute('data-treats', '0');
  await expect(page.locator('.buddy-crumbs')).toBeVisible();
  await expect(pet).toHaveAttribute('data-treats', '1');
  await expect(page.locator('.buddy-acorn')).toHaveCount(0);
  await expect(page.locator('.buddy-bubble')).toContainText('An acorn? For me?');
  await action(page, 'Head pats');
  await expect(pet).toHaveAttribute('data-activity', 'petted');
  await expect(page.locator('.buddy-hearts')).toBeVisible();
  const first = await page.locator('.buddy-bubble').textContent();
  await action(page, 'Head pats');
  await expect(page.locator('.buddy-bubble')).not.toHaveText(first);
  await page.reload();
  await expect(pet).toHaveAttribute('data-treats', '1');
  expect(errors).toEqual([]);
});

test('big jumps and flips travel through the air and land inside the desktop', async ({ page }) => {
  await boot(page);
  const pet = page.locator('.desktop-buddy');
  for (const name of ['Big jump', 'Do a flip']) {
    await action(page, name);
    await expect(pet).toHaveAttribute('data-phase', 'airborne');
    await expect.poll(async () => Number(await pet.getAttribute('data-lift'))).toBeGreaterThan(65);
    expect(await page.locator('.buddy-pose').evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
    await expect(page.locator('.buddy-character')).toHaveCSS('outline-style', 'none');
    await page.waitForFunction(() => document.querySelector('.desktop-buddy')?.dataset.phase === 'landing');
    await expect(page.locator('.buddy-dust')).toBeVisible();
    await expect(pet).toHaveAttribute('data-activity', 'idle');
    await expect(pet).toHaveAttribute('data-lift', '0');
    const box = await pet.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
  }
});

test('desktop actions do not interrupt eating, but sleep cancels it without a reward', async ({ page }) => {
  await boot(page);
  const pet = page.locator('.desktop-buddy');
  await action(page, 'Toss an acorn');
  await expect(pet).toHaveAttribute('data-phase', 'nibble');
  await page.getByRole('button', { name: 'Projects', exact: true }).press('Enter');
  await expect(pet).toHaveAttribute('data-activity', 'eating');
  await action(page, 'Take a nap');
  await page.waitForTimeout(3000);
  await expect(pet).toHaveAttribute('data-treats', '0');
  await expect(pet).toHaveAttribute('data-frame', 'sleep');
  await expect(page.locator('.buddy-held-acorn')).toHaveCount(0);
});

test('reduced-motion jumps stay grounded and treats still work', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await boot(page);
  const pet = page.locator('.desktop-buddy');
  const before = await pet.boundingBox();
  await action(page, 'Do a flip');
  await page.waitForTimeout(700);
  await expect(pet).toHaveAttribute('data-lift', '0');
  expect((await pet.boundingBox()).x).toBe(before.x);
  await action(page, 'Toss an acorn');
  await expect(pet).toHaveAttribute('data-treats', '1');
  expect((await pet.boundingBox()).x).toBe(before.x);
});

test('hiding the page cancels a snack and resizing lands the squirrel inside the viewport', async ({ page }) => {
  await boot(page);
  const pet = page.locator('.desktop-buddy');
  await action(page, 'Toss an acorn');
  await expect(pet).toHaveAttribute('data-phase', 'nibble');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(pet).toHaveAttribute('data-activity', 'idle');
  await page.waitForTimeout(3000);
  await expect(pet).toHaveAttribute('data-treats', '0');
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await action(page, 'Do a flip');
  await page.waitForFunction(() => Number(document.querySelector('.desktop-buddy')?.dataset.lift) > 60);
  await page.setViewportSize({ width: 320, height: 568 });
  await expect(pet).toHaveAttribute('data-lift', '0');
  const box = await pet.boundingBox();
  expect(box.x + box.width).toBeLessThanOrEqual(320);
  await action(page, 'Toss an acorn');
  await expect(pet).toHaveAttribute('data-treats', '1');
});

test('touch and hold reveals actions without an extra button or accidental poke', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile-chrome', 'Touch interaction.');
  await boot(page);
  const button = page.getByRole('button', { name: 'Talk to the desktop squirrel' });
  const box = await button.boundingBox();
  const touch = await page.context().newCDPSession(page);
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + 30, y: box.y + 30 }] });
  await expect(page.getByRole('menuitem', { name: 'Big jump', exact: true })).toBeVisible();
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await touch.detach();
  await expect(page.locator('.desktop-buddy')).toHaveAttribute('data-pokes', '0');
  await page.getByRole('menuitem', { name: 'Big jump', exact: true }).click();
  await expect(page.locator('.desktop-buddy')).toHaveAttribute('data-activity', 'jumping');
});

test('sleep cancels an unfinished fetch and tapping wakes the squirrel', async ({ page }) => {
  await boot(page);
  const pet = page.locator('.desktop-buddy');
  await action(page, 'Toss an acorn');
  await action(page, 'Take a nap');
  await expect(page.locator('.buddy-acorn')).toHaveCount(0);
  await page.waitForTimeout(1600);
  await expect(pet).toHaveAttribute('data-treats', '0');
  await expect(pet).toHaveAttribute('data-frame', 'sleep');
  await page.getByRole('button', { name: 'Talk to the desktop squirrel' }).click();
  await expect(pet).toHaveAttribute('data-sleeping', 'false');
  await expect(page.locator('.buddy-bubble')).toContainText('alarm clock');
});

test('cursor following is opt-in, stops at app windows, and can be stopped', async ({ page }) => {
  test.skip(test.info().project.name !== 'chromium', 'Mouse-only interaction.');
  await boot(page);
  await page.getByRole('button', { name: /start/i }).click();
  await page.locator('.menu-item-row', { hasText: 'Projects' }).click();
  const pet = page.locator('.desktop-buddy');
  const before = await pet.boundingBox();
  await action(page, 'Follow my cursor');
  await page.mouse.move(250, 570);
  await expect(pet).toHaveAttribute('data-following', 'true');
  await expect.poll(async () => (await pet.boundingBox()).x).toBeLessThan(before.x - 100);
  await page.mouse.move(450, 230);
  await page.waitForTimeout(400);
  const parked = await pet.boundingBox();
  await page.waitForTimeout(500);
  expect(Math.abs((await pet.boundingBox()).x - parked.x)).toBeLessThan(2);
  await action(page, 'Stop following');
  await expect(pet).toHaveAttribute('data-following', 'false');
});

test('dance respects reduced motion and the activities menu stays inside the screen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await boot(page);
  await action(page, 'Do a little dance');
  await expect(page.locator('.desktop-buddy')).toHaveAttribute('data-activity', 'dancing');
  expect(await page.locator('.buddy-character').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await page.getByRole('button', { name: 'Talk to the desktop squirrel' }).click({ button: 'right' });
  const menu = page.locator('.buddy-context-menu');
  const box = await menu.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width);
  expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize().height);
  await page.getByRole('menuitem', { name: 'Say something' }).focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'Toss an acorn' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Talk to the desktop squirrel' })).toBeFocused();
});
