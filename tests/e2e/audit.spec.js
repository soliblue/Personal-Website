import { test, expect } from '@playwright/test';

const routes = ['/windows95', '/terminal', '/newspaper', '/wikipedia', '/animation', '/home', '/pins', '/resume', '/projects', '/space', '/code-hop', '/apps/habibi/privacy', '/missing-page'];
for (const path of routes) {
  test(`route ${path} renders without errors or horizontal overflow`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => sessionStorage.setItem('soli95-booted', 'true'));
    await page.goto(path);
    if (['/wikipedia', '/newspaper', '/home', '/terminal', '/animation'].includes(path)) {
      await expect(page).toHaveURL(/\/windows95$/);
      await expect(page.locator('.desktop-icon').first()).toBeVisible();
    }
    await expect(page.locator('#app')).not.toBeEmpty();
    await expect(page.locator('a[href="/wikipedia"], a[href="/newspaper"], a[href="/home"], a[href="/terminal"], a[href="/animation"]')).toHaveCount(0);
    await expect(page.locator('#app')).toContainText(/\w/, { timeout: 8000 });
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test('blocked browser storage still permits desktop navigation', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    for (const name of ['localStorage', 'sessionStorage']) {
      Object.defineProperty(window, name, { get() { throw new DOMException('Blocked', 'SecurityError'); } });
    }
  });
  await page.goto('/');
  await expect(page.locator('.boot-screen')).toBeHidden({ timeout: 10000 });
  await expect(page.locator('.desktop-icon', { hasText: 'Resume' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('terminal streams a reply and keeps the latest user message out of history', async ({ page }) => {
  test.skip(true, 'Terminal is retired; Messenger and unit tests cover chat streaming.');
  let body;
  await page.route('**/api/chat', async route => {
    body = route.request().postDataJSON();
    await route.fulfill({ contentType: 'text/event-stream', body: `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Hello from the stream.' }] } }] })}\n\n` });
  });
  await page.goto('/terminal');
  await page.getByPlaceholder('Type your question...').fill('Hello');
  await page.getByPlaceholder('Type your question...').press('Enter');
  await expect(page.locator('.terminal-line.assistant').filter({ hasText: 'Hello from the stream.' })).toHaveCount(1);
  expect(body).toEqual({ message: 'Hello', history: [] });
});

test('unknown app document shows not found rather than the SPA shell', async ({ page }) => {
  await page.goto('/apps/missing/privacy');
  await expect(page.locator('.not-found')).toHaveText('Page not found');
});

test('desktop icons stay inside the visible viewport and control icons load', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('soli95-booted', 'true'));
  await page.goto('/windows95');
  await expect(page.locator('.desktop-icon').first()).toBeVisible();
  await expect(page.locator('.boot-screen')).toBeHidden();
  const bounds = await page.locator('.desktop-icon').evaluateAll(icons => icons.map(icon => {
    const rect = icon.getBoundingClientRect();
    return { label: icon.textContent, outside: rect.left < 0 || rect.right > innerWidth || rect.top < 0 || rect.bottom > innerHeight - 28 };
  }));
  expect(bounds.filter(icon => icon.outside)).toEqual([]);
  await page.getByRole('button', { name: /start/i }).click();
  await page.locator('.menu-item-row', { hasText: 'Resume' }).click();
  const closeIcon = await page.locator('.win95-window:visible .win-btn.close').evaluate(button => getComputedStyle(button).backgroundImage);
  expect(closeIcon).not.toContain('~98');
  expect(closeIcon).not.toBe('none');
});
