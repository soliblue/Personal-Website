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
    await expect(page.locator('.about-content')).not.toContainText('ai engineer');
    await expect(page.locator('.desktop-icon', { hasText: 'World Pins' })).toHaveCount(0);

    await page.locator('.desktop-icon', { hasText: 'Resume' }).dblclick();
    const knowunityRole = page.locator('.resume-item', { hasText: 'Knowunity' });
    await expect(knowunityRole).toContainText('Staff AI Engineer');
    await expect(knowunityRole.locator('.resume-date')).toHaveText('Sep 2025 - Present');

    await page.getByRole('button', { name: /start/i }).click();
    await expect(page.locator('.start-menu')).toBeVisible();
    await expect(page.locator('.start-menu')).not.toContainText('World Pins');
    await expect(page.locator('.start-menu')).not.toContainText('Terminal Mode');
    await expect(page.locator('.start-menu')).not.toContainText('Animation Mode');
    await expect(page.locator('.start-menu')).not.toContainText('Newspaper Mode');
    await expect(page.locator('.start-menu')).not.toContainText('Wikipedia Mode');
    await page.locator('.menu-item-row', { hasText: 'Projects' }).click();

    await expect(page.locator('.titlebar-text', { hasText: 'Projects' })).toBeVisible();
    await expect(page.getByText('10 object(s)')).toBeVisible();
    const projectsWindow = page.locator('.win95-window').filter({
      has: page.locator('.titlebar-text', { hasText: 'Projects' }),
    });
    const projectGroups = projectsWindow.locator('.project-group');
    await expect(
      projectGroups.nth(0).locator('.project-group-header'),
    ).toContainText('Live Projects');
    await expect(projectGroups.nth(0).locator('.project-group-count')).toHaveText('3');
    await expect(
      projectGroups.nth(1).locator('.project-group-header'),
    ).toContainText('Archive');
    await expect(projectGroups.nth(1).locator('.project-group-count')).toHaveText('7');
    await expect(projectsWindow.locator('.project-status-dot.live').first()).toBeVisible();
    await expect(projectsWindow.locator('.project-status-dot.archive').first()).toBeVisible();
    await expect(projectsWindow).not.toContainText('.doc');
    const remoteClaudeFile = projectGroups.nth(1).locator(
      '.project-item',
      { hasText: 'remote claude' },
    );
    await expect(remoteClaudeFile).toBeVisible();
    await expect(remoteClaudeFile.locator('img')).toHaveAttribute(
      'alt',
      'remote claude icon',
    );
    const machtblickFile = projectsWindow.locator(
      '.project-item',
      { hasText: 'machtblick' },
    );
    await expect(machtblickFile.locator('img')).toHaveAttribute(
      'alt',
      'machtblick icon',
    );
    await machtblickFile.dblclick();
    const projectDocument = page.locator('.notepad-text');
    await expect(projectDocument).toContainText('A transparency platform');
    await expect(projectDocument).not.toContainText('MACHTBLICK');
    await expect(projectDocument).not.toContainText('bundestag transparency');
    await expect(projectDocument).not.toContainText('status:');
    await expect(
      page.locator('.titlebar-text', { hasText: 'machtblick - Notepad' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Website' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'App Store' })).toBeVisible();
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

  test('Internet Explorer includes Machtblick and embedded SongGPT', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Desktop browser flow is covered once.');
    const errors = collectPageErrors(page);

    await page.route('https://songgpt.soli.blue/', route => route.fulfill({
      contentType: 'text/html',
      body: '<title>SongGPT test</title><main>SongGPT is framed</main>',
    }));
    await page.addInitScript(() => sessionStorage.setItem('soli95-booted', 'true'));
    await page.goto('/windows95');
    await page.locator('.desktop-icon', { hasText: 'Internet' }).dblclick();

    const browserWindow = page.locator('.win95-window').filter({
      has: page.locator('.titlebar-text', { hasText: 'Internet Explorer' }),
    });
    const address = browserWindow.locator('.url-select');
    await address.selectOption('songgpt');
    await expect(browserWindow.locator('.browser-frame')).toHaveAttribute(
      'src',
      'https://songgpt.soli.blue/',
    );
    await expect(browserWindow.locator('.browser-frame')).toHaveAttribute('title', 'SongGPT');

    await address.selectOption('machtblick');
    await expect(browserWindow.locator('.browser-launch-page')).toContainText('Machtblick');
    await expect(browserWindow.getByRole('button', { name: 'Open machtblick.de' })).toBeVisible();
    await expect(browserWindow.locator('.browser-frame')).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('Windows 95 Paint draws, undoes, redoes, and restores the picture', async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium', 'Desktop Paint flow is covered once.');
    const errors = collectPageErrors(page);

    await page.addInitScript(() => {
      sessionStorage.setItem('soli95-booted', 'true');
      localStorage.removeItem('soli95-paint-document');
    });
    await page.goto('/windows95');

    const aboutIcon = page.locator('.desktop-icon', { hasText: 'About Me' }).locator('img');
    const computerIcon = page.locator('.desktop-icon', { hasText: 'My Computer' }).locator('img');
    await expect(aboutIcon).not.toHaveAttribute('src', await computerIcon.getAttribute('src'));

    await page.locator('.desktop-icon', { hasText: 'Paint' }).dblclick();
    const paintWindow = page.locator('.win95-window').filter({
      has: page.locator('.titlebar-text', { hasText: 'untitled - Paint' }),
    });
    const canvas = paintWindow.locator('.paint-stage canvas');
    await expect(canvas).toBeVisible();
    await expect(canvas).toHaveAttribute('data-tool', 'pencil');

    await paintWindow.getByRole('button', { name: 'Brush', exact: true }).click();
    await paintWindow.getByRole('button', { name: 'Brush size 10' }).click();
    await paintWindow.getByRole('button', { name: 'Use #ff0000' }).click();
    const box = await canvas.boundingBox();
    const start = { x: box.x + box.width * 0.25, y: box.y + box.height * 0.45 };
    const finish = { x: box.x + box.width * 0.55, y: box.y + box.height * 0.45 };
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(finish.x, finish.y, { steps: 10 });
    await page.mouse.up();

    const samplePixel = async () => canvas.evaluate((element) => {
      const context = element.getContext('2d');
      return Array.from(context.getImageData(360, 198, 1, 1).data);
    });
    await expect.poll(samplePixel).toEqual([255, 0, 0, 255]);

    await paintWindow.getByRole('button', { name: 'Undo' }).click();
    await expect.poll(samplePixel).toEqual([255, 255, 255, 255]);
    await paintWindow.getByRole('button', { name: 'Redo' }).click();
    await expect.poll(samplePixel).toEqual([255, 0, 0, 255]);

    await paintWindow.locator('.win-btn.close').click();
    await page.locator('.desktop-icon', { hasText: 'Paint' }).dblclick();
    await expect.poll(samplePixel).toEqual([255, 0, 0, 255]);
    expect(errors).toEqual([]);
  });

  test('Windows 95 includes an always-on interactive squirrel', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Desktop pet behavior is covered once.');
    const errors = collectPageErrors(page);

    await page.addInitScript(() => sessionStorage.setItem('soli95-booted', 'true'));
    await page.goto('/windows95');
    const buddy = page.locator('.desktop-buddy');
    const talkToBuddy = page.getByRole('button', { name: 'Talk to the desktop squirrel' });
    await expect(buddy).toBeVisible();
    await expect(talkToBuddy.locator('img')).toHaveAttribute('alt', 'Pixel squirrel');
    await expect(buddy).toHaveAttribute('data-frame', /idle|curious/);

    await page.locator('.desktop-icon', { hasText: 'My Computer' }).dblclick();

    const computerWindow = page.locator('.win95-window').filter({
      has: page.locator('.titlebar-text', { hasText: 'My Computer' }),
    });
    await expect(computerWindow).toBeVisible();
    await computerWindow.locator('.folder-item', { hasText: 'Local Disk (C:)' }).dblclick();
    await expect(computerWindow.locator('.address-bar')).toHaveText('C:\\');
    await computerWindow.locator('.folder-item', { hasText: 'DO_NOT_OPEN' }).dblclick();
    await expect(computerWindow.locator('.explorer-status')).toContainText('You were warned');
    await expect(computerWindow.locator('.folder-item', { hasText: 'claude.exe' })).toHaveCount(0);

    await computerWindow.locator('.folder-item', { hasText: 'readme.txt' }).dblclick();
    const notepadWindow = page.locator('.win95-window').filter({
      has: page.locator('.titlebar-text', { hasText: 'readme.txt' }),
    });
    await expect(notepadWindow.locator('.notepad-text')).toContainText('DESKTOP PET NOTES');
    await notepadWindow.locator('.win-btn.close').click();

    await talkToBuddy.click();
    await expect(page.locator('.buddy-bubble')).toContainText('I was told this was production.');
    await expect(buddy).toHaveAttribute('data-mood', 'surprised');
    await expect(buddy).toHaveAttribute('data-frame', /hop|curious/);
    await talkToBuddy.click();
    await expect(page.locator('.buddy-bubble')).toContainText('Yes, I noticed the first poke.');
    await talkToBuddy.click();
    await expect(page.locator('.buddy-bubble')).toContainText('repeatable test case');
    await expect(buddy).toHaveAttribute('data-pokes', '3');
    await expect(buddy).toHaveAttribute('data-mood', 'suspicious');

    await page.waitForTimeout(1300);
    const buddyBeforeDrag = await buddy.boundingBox();
    await page.mouse.move(buddyBeforeDrag.x + 27, buddyBeforeDrag.y + 27);
    await page.mouse.down();
    await page.mouse.move(buddyBeforeDrag.x + 127, buddyBeforeDrag.y + 27);
    await page.mouse.up();
    await expect(page.locator('.buddy-bubble')).toContainText('pixel reserved');
    await expect(buddy).toHaveAttribute('data-frame', 'annoyed');
    await page.waitForTimeout(1300);
    const buddyAfterDrag = await buddy.boundingBox();
    expect(buddyAfterDrag.x).toBeGreaterThan(buddyBeforeDrag.x + 80);

    await talkToBuddy.click({ button: 'right' });
    await expect(page.locator('.buddy-context-menu')).toBeVisible();
    await page.getByRole('menuitem', { name: 'Take a stroll' }).click();
    await expect(page.locator('.buddy-bubble')).toContainText('quick lap');
    await expect(buddy).toHaveAttribute('data-frame', /walk-a|walk-b/);

    await talkToBuddy.click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Inspect desktop' }).click();
    await expect(page.locator('.buddy-bubble')).toContainText('visible windows');
    await expect(buddy).toHaveAttribute('data-history', /[8-9]|[1-9][0-9]/);

    await talkToBuddy.click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Open desktop.log' }).click();
    const logWindow = page.locator('.win95-window').filter({
      has: page.locator('.titlebar-text', { hasText: 'desktop.log' }),
    });
    await expect(logWindow.locator('.notepad-text')).toContainText('DESKTOP PET EVENT LOG');
    await expect(logWindow.locator('.notepad-text')).toContainText('poke #3');
    await expect(logWindow.locator('.notepad-text')).toContainText('drag:');
    await expect(logWindow.locator('.notepad-text')).toContainText('stroll:');
    await logWindow.locator('.win-btn.close').click();

    await talkToBuddy.click({ button: 'right' });
    await page.getByRole('menuitem', { name: 'Take a nap' }).click();
    await expect(buddy).toHaveAttribute('data-sleeping', 'true');
    await expect(buddy).toHaveAttribute('data-frame', 'sleep');
    await expect(page.locator('.buddy-bubble')).toContainText('tiny nap');

    await page.getByRole('button', { name: /start/i }).click();
    await page.locator('.menu-item-row', { hasText: 'Claude Hops' }).click();
    await expect(page.locator('.buddy-bubble')).toContainText('Different department');
    await expect(buddy).toHaveAttribute('data-mood', 'excited');
    await expect(buddy).toHaveAttribute('data-frame', 'excited');
    await expect(buddy).toHaveAttribute('data-sleeping', 'false');

    const codeHopWindow = page.locator('.win95-window').filter({
      has: page.locator('.titlebar-text', { hasText: 'Claude Hops' }),
    });
    await codeHopWindow.locator('.win-btn.minimize').click();
    await expect(page.locator('.buddy-bubble')).toContainText('Out of sight, still using memory.');
    await page.locator('.taskbar-window', { hasText: 'Claude Hops' }).click();
    await expect(page.locator('.buddy-bubble')).toContainText('Welcome back');
    await codeHopWindow.locator('.win-btn.maximize').click();
    await expect(page.locator('.buddy-bubble')).toContainText('Maximum window');

    await expect(buddy).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close Claude buddy' })).toHaveCount(0);
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
    const machtblick = page.locator('.project', { hasText: 'machtblick' });
    await expect(machtblick).toBeVisible();
    await expect(machtblick.locator('a[title="App Store"]')).toHaveAttribute(
      'href',
      'https://apps.apple.com/de/app/machtblick/id6787755187',
    );
    await expect(machtblick.locator('a[title="Website"]')).toHaveAttribute(
      'href',
      'https://machtblick.de/',
    );

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
    await expect(page.locator('.hud-stats')).toContainText('COMBO:');
    await expect(page.locator('.hud-stats')).toContainText('SAFE:');

    const upgradedState = await page.evaluate(() => {
      const game = document.querySelector('.code-hop').__vue__;
      game.obstacles = [];
      game.powerups = [{
        x: game.player.x + game.player.width / 2,
        y: game.player.y + game.player.height / 2,
        size: 34,
        altitude: 100,
        phase: 0,
        taken: false,
      }];
      game.collectPowerups();
      const shieldCollected = game.shielded;

      game.obstacles = [{
        x: game.player.x,
        y: game.player.y,
        width: game.player.width,
        height: game.player.height,
        passed: false,
        flying: false,
        destroyed: false,
      }];
      game.checkCollisions();
      const recovered = game.gameState === 'playing'
        && !game.shielded
        && game.obstacles[0].destroyed;

      game.obstacles = [];
      game.worldIndex = 2;
      game.elapsed = 0;
      const realRandom = Math.random;
      Math.random = () => 0;
      game.spawnObstacle();
      Math.random = realRandom;
      const pairedObstacles = game.obstacles.length;

      game.worldIndex = 1;
      game.elapsed = 22.1;
      game.updateWorld();
      return {
        shieldCollected,
        recovered,
        pairedObstacles,
        world: game.worldIndex,
        milestone: game.milestone.title,
      };
    });

    expect(upgradedState).toEqual({
      shieldCollected: true,
      recovered: true,
      pairedObstacles: 2,
      world: 2,
      milestone: 'WORLD 1-2',
    });
    await expect(page.locator('.code-hop')).toHaveAttribute('data-world', '2');
    await expect(page.locator('.world-banner')).toContainText('CHECKPOINT +100');
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
