import { expect, test } from '@playwright/test';

test('matching desktop icons load and still open their apps', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/windows95');
  await expect(page.locator('.boot-screen')).toBeHidden();
  const icons = ['Internet', 'Messenger', 'Resume.doc', 'Contact'];
  const sources = new Map();
  for (const name of icons) {
    const icon = page.getByRole('button', { name, exact: true }).locator('img');
    await expect(icon).toBeVisible();
    await expect.poll(() => icon.evaluate(img => img.complete && img.naturalWidth === 128)).toBe(true);
    sources.set(name, await icon.getAttribute('src'));
  }
  await page.screenshot({ path: `/tmp/soli-matching-icons-${test.info().project.name}.png` });
  for (const name of icons) {
    await page.getByRole('button', { name, exact: true }).press('Enter');
    await expect(page.locator('.title-bar img').filter({ visible: true })).not.toHaveCount(0);
    expect(await page.locator('.title-bar img').evaluateAll(imgs => imgs.map(img => img.getAttribute('src'))))
      .toContain(sources.get(name));
  }
  expect(errors).toEqual([]);
});
