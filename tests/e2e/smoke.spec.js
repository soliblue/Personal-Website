const { expect, test } = require('@playwright/test');

const collectPageErrors = (page) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
};

test.describe('site smoke', () => {
  test('Windows 95 shell boots and opens Projects from Start', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Desktop shell flow is covered once.');
    const errors = collectPageErrors(page);

    await page.goto('/');
    await expect(page).toHaveURL(/\/windows95$/);
    await expect(page.locator('.boot-screen')).toBeHidden({ timeout: 8000 });
    await expect(page.locator('.titlebar-text', { hasText: 'About Me' })).toBeVisible();
    await expect(page.locator('.desktop-icon', { hasText: 'World Pins' })).toHaveCount(0);

    await page.getByRole('button', { name: /start/i }).click();
    await expect(page.locator('.start-menu')).toBeVisible();
    await expect(page.locator('.start-menu')).not.toContainText('World Pins');
    await page.locator('.menu-item-row', { hasText: 'Projects' }).click();

    await expect(page.locator('.titlebar-text', { hasText: 'Projects' })).toBeVisible();
    await expect(page.getByText('9 object(s)')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('Windows 95 contact form sends through the API', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Desktop shell flow is covered once.');
    const errors = collectPageErrors(page);
    let requestBody;

    await page.route('**/api/contact', async (route) => {
      requestBody = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto('/windows95');
    await expect(page.locator('.boot-screen')).toBeHidden({ timeout: 8000 });
    await page.locator('.desktop-icon', { hasText: 'Contact' }).dblclick();

    await expect(page.locator('.titlebar-text', { hasText: 'New Message' })).toBeVisible();
    await page.getByLabel('Your email').fill('visitor@example.com');
    await page.getByLabel('Subject').fill('Website hello');
    await page.getByLabel('Message').fill('This came through the contact form.');
    await page.getByRole('button', { name: /Send/ }).click();

    await expect(page.locator('.mail-status.success')).toContainText('Message sent');
    await expect(page.getByLabel('Message')).toHaveValue('');
    expect(requestBody).toEqual({
      email: 'visitor@example.com',
      subject: 'Website hello',
      message: 'This came through the contact form.',
      company: '',
    });
    expect(errors).toEqual([]);
  });

  test('My Computer hides an interactive Claude desktop buddy', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Desktop easter egg is covered once.');
    const errors = collectPageErrors(page);

    await page.addInitScript(() => sessionStorage.setItem('soli95-booted', 'true'));
    await page.goto('/windows95');
    await page.locator('.desktop-icon', { hasText: 'My Computer' }).dblclick();

    const computerWindow = page.locator('.win95-window').filter({
      has: page.locator('.titlebar-text', { hasText: 'My Computer' }),
    });
    await expect(computerWindow).toBeVisible();
    await computerWindow.locator('.folder-item', { hasText: 'Local Disk (C:)' }).dblclick();
    await expect(computerWindow.locator('.address-bar')).toHaveText('C:\\');
    await computerWindow.locator('.folder-item', { hasText: 'DO_NOT_OPEN' }).dblclick();
    await expect(computerWindow.locator('.explorer-status')).toContainText('You were warned');

    await computerWindow.locator('.folder-item', { hasText: 'readme.txt' }).dblclick();
    const notepadWindow = page.locator('.win95-window').filter({
      has: page.locator('.titlebar-text', { hasText: 'readme.txt' }),
    });
    await expect(notepadWindow.locator('.notepad-text')).toContainText('do not run the executable');
    await notepadWindow.locator('.win-btn.close').click();

    await computerWindow.locator('.folder-item', { hasText: 'claude.exe' }).dblclick();
    await expect(page.locator('.claude-buddy')).toBeVisible();
    await expect(page.locator('.buddy-bubble')).toContainText('You ran it. Bold choice.');
    const talkToClaude = page.getByRole('button', { name: 'Talk to Claude' });
    await talkToClaude.click();
    await expect(page.locator('.buddy-bubble')).toContainText('I was told this was production.');
    await expect(page.locator('.claude-buddy')).toHaveAttribute('data-mood', 'surprised');
    await talkToClaude.click();
    await expect(page.locator('.buddy-bubble')).toContainText('Yes, I noticed the first poke.');
    await talkToClaude.click();
    await expect(page.locator('.buddy-bubble')).toContainText('repeatable test case');
    await expect(page.locator('.claude-buddy')).toHaveAttribute('data-pokes', '3');
    await expect(page.locator('.claude-buddy')).toHaveAttribute('data-mood', 'suspicious');

    await page.getByRole('button', { name: /start/i }).click();
    await page.locator('.menu-item-row', { hasText: 'Claude Hops' }).click();
    await expect(page.locator('.buddy-bubble')).toContainText('Wait. Is that me?');
    await expect(page.locator('.claude-buddy')).toHaveAttribute('data-mood', 'excited');

    const codeHopWindow = page.locator('.win95-window').filter({
      has: page.locator('.titlebar-text', { hasText: 'Claude Hops' }),
    });
    await codeHopWindow.locator('.win-btn.minimize').click();
    await expect(page.locator('.buddy-bubble')).toContainText('Out of sight, still using memory.');
    await page.locator('.taskbar-window', { hasText: 'Claude Hops' }).click();
    await expect(page.locator('.buddy-bubble')).toContainText('Welcome back');
    await codeHopWindow.locator('.win-btn.maximize').click();
    await expect(page.locator('.buddy-bubble')).toContainText('Maximum window');

    await page.getByRole('button', { name: 'Close Claude buddy' }).click();
    await expect(page.locator('.claude-buddy')).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('Pins route remains available as a standalone page', async ({ page }) => {
    const errors = collectPageErrors(page);

    await page.goto('/pins');
    await expect(page).toHaveURL(/\/pins$/);
    await expect(page.locator('.pin-card')).toHaveCount(15);
    await expect(page.locator('.pin-card').first()).toContainText('Aldous Huxley');
    expect(errors).toEqual([]);
  });

  test('terminal escapes typed HTML while keeping command formatting', async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.route('**/api/chat', route => route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ response: 'Safe stub response.' }),
    }));

    await page.goto('/terminal');
    const input = page.getByPlaceholder('Type your question...');
    await input.fill('<img src=x onerror="window.__terminalXss = true">');
    await input.press('Enter');

    const userLine = page.locator('.terminal-line.user').last();
    await expect(userLine).toContainText('<img src=x');
    await expect(userLine.locator('img')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => window.__terminalXss)).not.toBe(true);

    await input.fill('/help');
    await input.press('Enter');
    await expect(page.locator('.terminal-line.assistant').last()).toContainText('/projects');
    expect(errors).toEqual([]);
  });

  test('Projects route keeps live/graveyard tab interaction', async ({ page }) => {
    const errors = collectPageErrors(page);

    await page.goto('/projects');
    await expect(page.locator('.tabs button.active')).toHaveText('Live');
    await expect(page.locator('.project', { hasText: 'machtblick' })).toBeVisible();

    await page.getByRole('button', { name: 'Graveyard' }).click();
    await expect(page.locator('.tabs button.active')).toHaveText('Graveyard');
    await expect(page.locator('.project', { hasText: 'toy2life' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('App markdown docs render as document content', async ({ page }) => {
    const errors = collectPageErrors(page);

    await page.goto('/apps/habibi/privacy');
    await expect(page.locator('.doc-content h1')).toHaveText('Privacy Policy');
    await expect(page.locator('.doc-content')).toContainText('Habibi');
    await expect(page.locator('.doc-content script')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('Space route draws a nonblank canvas and opens the pause menu', async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium', 'Canvas pixel check is covered once.');
    const errors = collectPageErrors(page);

    await page.goto('/space');
    await expect(page.locator('canvas')).toBeVisible();
    await page.waitForTimeout(1200);

    const canvasState = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      const context = canvas.getContext('2d');
      const image = context.getImageData(0, 0, Math.min(canvas.width, 80), 80).data;
      let nonTransparent = 0;

      for (let index = 3; index < image.length; index += 16) {
        if (image[index] > 0) nonTransparent += 1;
      }

      return {
        width: canvas.width,
        height: canvas.height,
        nonTransparent,
      };
    });

    expect(canvasState.width).toBeGreaterThan(300);
    expect(canvasState.height).toBeGreaterThan(300);
    expect(canvasState.nonTransparent).toBeGreaterThan(0);

    await page.getByRole('button', { name: 'MENU' }).click();
    await expect(page.locator('.menu-panel')).toContainText('PAUSED');
    expect(errors).toEqual([]);
  });

  test('Space game starts with a nonnegative score after a long-lived page clock', async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium', 'Desktop shell flow is covered once.');
    const errors = collectPageErrors(page);

    await page.addInitScript(() => {
      const realNow = performance.now.bind(performance);
      Object.defineProperty(performance, 'now', {
        configurable: true,
        value: () => realNow() + 180000,
      });
    });

    await page.goto('/windows95');
    await expect(page.locator('.boot-screen')).toBeHidden({ timeout: 8000 });
    await page.locator('.desktop-icon', { hasText: 'Space Game' }).dblclick();

    await expect(page.locator('.titlebar-text', { hasText: 'Space Game' })).toBeVisible();
    const score = page.locator('.space-game .stat').filter({ hasText: 'SCORE:' }).first();
    await expect(score).toBeVisible();
    await expect(score).not.toContainText('-');
    await expect.poll(async () => {
      const text = await score.textContent();
      return Number(text.replace(/\D/g, ''));
    }).toBeGreaterThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test('Claude Hops route draws a playable canvas and jumps cleanly', async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium', 'Canvas pixel check is covered once.');
    const errors = collectPageErrors(page);

    await page.goto('/code-hop');
    await expect(page.locator('.code-hop canvas')).toBeVisible();
    await expect(page.locator('.panel')).toContainText('CLAUDE HOPS');
    await page.waitForTimeout(500);

    const canvasState = await page.evaluate(() => {
      const canvas = document.querySelector('.code-hop canvas');
      const context = canvas.getContext('2d');
      const image = context.getImageData(0, 0, Math.min(canvas.width, 100), 100).data;
      let nonTransparent = 0;

      for (let index = 3; index < image.length; index += 16) {
        if (image[index] > 0) nonTransparent += 1;
      }

      return {
        width: canvas.width,
        height: canvas.height,
        nonTransparent,
      };
    });

    expect(canvasState.width).toBeGreaterThan(300);
    expect(canvasState.height).toBeGreaterThan(300);
    expect(canvasState.nonTransparent).toBeGreaterThan(0);

    await page.locator('.code-hop .panel button.primary').click();
    await expect(page.locator('.code-hop .overlay')).toBeHidden();
    await page.keyboard.press('Space');
    await expect.poll(async () => page.locator('.code-hop').getAttribute('data-airborne')).toBe('true');
    await page.waitForTimeout(900);
    await expect(page.locator('.code-hop')).toHaveAttribute('data-state', 'playing');
    await expect(page.locator('.hud-stats')).toContainText('SCORE:');
    await expect(page.locator('.hud-stats')).toContainText('SPEED:');
    expect(errors).toEqual([]);
  });

  test('Windows 95 opens Claude Hops as an embedded desktop game', async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium', 'Desktop shell flow is covered once.');
    const errors = collectPageErrors(page);

    await page.goto('/windows95');
    await expect(page.locator('.boot-screen')).toBeHidden({ timeout: 8000 });
    await page.locator('.desktop-icon', { hasText: 'Claude Hops' }).dblclick();

    await expect(page.locator('.titlebar-text', { hasText: 'Claude Hops' })).toBeVisible();
    await expect(page.locator('.code-hop.embedded canvas')).toBeVisible();
    await page.locator('.code-hop.embedded .panel button.primary').click();
    await expect(page.locator('.code-hop.embedded .overlay')).toBeHidden();
    await expect(page.locator('.code-hop.embedded .hud-brand')).toContainText('CLAUDE HOPS');
    expect(errors).toEqual([]);
  });

  test('Projects mobile viewport does not horizontally overflow', async ({ page }) => {
    test.skip(test.info().project.name !== 'mobile-chrome', 'Mobile layout check only.');
    const errors = collectPageErrors(page);

    await page.goto('/projects');
    const metrics = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
    expect(errors).toEqual([]);
  });
});
