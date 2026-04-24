import { test, expect } from '@playwright/test';

test('page loads and key sections exist', async ({ page }) => {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('/');

  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('#heroTools')).toBeVisible();
  await expect(page.locator('#carousel-projects')).toBeVisible();
  await expect(page.locator('#stack')).toBeVisible();
  await expect(page.locator('#about')).toBeVisible();
  await expect(page.locator('#contact')).toBeVisible();

  expect(errors).toHaveLength(0);
});