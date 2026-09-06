import { expect, test } from '@playwright/test';

test('standalone terminal has consistent type, readable input, and working commands', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/chat', route => route.fulfill({
    contentType: 'text/event-stream',
    body: `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: '## A reply\n\nTry `hello` or [this link](https://soli.blue/).\n\n```text\n' + 'long-line-'.repeat(40) + '\n```' }] } }] })}\n\ndata: [DONE]\n\n`,
  }));
  await page.goto('/terminal');
  const input = page.getByPlaceholder('Type your question...');
  const body = page.locator('.terminal-body');
  const font = await body.evaluate(el => getComputedStyle(el).fontFamily);
  const size = '16px';
  await expect(body).toHaveCSS('font-family', font);
  expect(font).toContain('Courier New');
  await expect(body).toHaveCSS('font-size', size);
  await expect(input).toHaveCSS('font-family', font);
  await expect(input).toHaveCSS('font-size', size);
  expect(await input.evaluate(el => {
    const style = getComputedStyle(el);
    const scale = style.transform === 'none' ? 1 : new DOMMatrix(style.transform).a;
    return parseFloat(style.fontSize) * scale;
  })).toBe(16);
  await expect(page.locator('.welcome code').first()).toHaveCSS('font-size', size);
  await input.fill('/he');
  await expect(page.locator('.suggestion')).toHaveText('/help');
  await input.press('Tab');
  await expect(input).toHaveValue('/help');
  await input.press('Enter');
  await expect(page.locator('.terminal-line.assistant').last()).toContainText('Available commands:');
  await expect(page.locator('.suggestions')).toHaveCount(0);
  await input.fill('/resume');
  await expect(page.locator('.suggestions')).toBeVisible();
  await input.press('Enter');
  await expect(page.locator('.terminal-line.assistant').last()).toContainText('RESUME');
  await expect(page.locator('.suggestions')).toHaveCount(0);
  await input.fill('Hello');
  await input.press('Enter');
  const reply = page.locator('.terminal-line.assistant').last();
  await expect(reply.locator('h2')).toHaveText('A reply');
  await expect(reply.locator('h2')).toHaveCSS('font-size', '24px');
  await expect(reply.locator('code').first()).toHaveCSS('font-family', font);
  await expect(reply.locator('code').first()).toHaveCSS('font-size', size);
  await expect(input).toBeEnabled();
  const inputBox = await input.boundingBox();
  const bodyBox = await body.boundingBox();
  expect(inputBox.x + inputBox.width).toBeLessThanOrEqual(bodyBox.x + bodyBox.width);
  expect(errors).toEqual([]);
});
