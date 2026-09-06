import { expect, test } from '@playwright/test';

test('site and share metadata say soli without changing the resume job title', async ({ page, request }) => {
  const response = await request.get('/');
  expect(await response.text()).not.toContain('Staff AI Engineer');
  await page.goto('/windows95');
  await expect(page).toHaveTitle('soli');
  for (const attribute of ['property="og:title"', 'name="twitter:title"']) {
    await expect(page.locator(`meta[${attribute}]`)).toHaveAttribute('content', 'soli');
  }
  for (const attribute of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
    await expect(page.locator(`meta[${attribute}]`)).toHaveAttribute('content', 'soli');
  }
  for (const attribute of ['property="og:image:alt"', 'name="twitter:image:alt"']) {
    await expect(page.locator(`meta[${attribute}]`)).toHaveAttribute('content', 'soli');
  }
  const structured = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  const person = structured['@graph'].find(item => item['@type'] === 'Person');
  expect(person.alternateName).toBe('soli');
  expect(person).not.toHaveProperty('jobTitle');
  await expect(page.locator('.desktop-icon').first()).toBeVisible();
  await expect(page.locator('.boot-screen')).toBeHidden();
  await page.getByRole('button', { name: 'Resume.doc', exact: true }).press('Enter');
  await expect(page.locator('.resume-item', { hasText: 'Knowunity' })).toContainText('Staff AI Engineer');
});
