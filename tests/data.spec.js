import { test, expect } from '@playwright/test';

test('projects data loads from JSON', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.card', { timeout: 5000 });

  const firstCard = page.locator('.card').first();
  await expect(firstCard.locator('.project-name')).not.toHaveText('');
  await expect(firstCard.locator('.card-desc')).not.toHaveText('');
});

test('stack section renders', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('.stack-group', { timeout: 5000 });

  const groups = page.locator('.stack-group');
  await expect(groups.first()).toBeVisible();

  const bars = page.locator('.stack-group .bar');
  await expect(bars.first()).toBeVisible();
});

test('hero meta content populates', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1000);

  const tools = page.locator('#heroTools');
  await expect(tools).not.toHaveText('...');
  await expect(tools).not.toHaveText('');
});

test('about stats populate', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(1000);

  await expect(page.locator('#aboutShipped')).not.toHaveText('...');
  await expect(page.locator('#aboutLanguages')).not.toHaveText('...');
});