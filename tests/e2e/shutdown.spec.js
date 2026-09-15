import { expect, test } from '@playwright/test';

test('shutdown stays off and Restart returns to the desktop without legacy views', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => sessionStorage.setItem('soli95-booted', 'true'));
  await page.goto('/windows95');
  await page.getByRole('button', { name: /start/i }).click();
  await page.locator('.menu-item-row.shutdown').click();
  const screen = page.locator('.shutdown-screen');
  await expect(screen).toContainText("It's now safe to turn off your computer.");
  await expect(page.locator('.desktop-icon')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Restart', exact: true })).toBeFocused();
  await screen.click({ position: { x: 10, y: 10 } });
  await page.keyboard.press('Escape');
  await expect(screen).toBeVisible();
  await expect(page).toHaveURL(/\/windows95$/);
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(screen).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Internet', exact: true })).toBeVisible();
  await expect(page.locator('.desktop-icon', { hasText: 'Projects' })).toHaveCount(0);
  await expect(page.locator('.desktop-icon', { hasText: 'Visitor Board' })).toHaveCount(0);
  expect(errors).toEqual([]);
});
