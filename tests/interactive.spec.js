import { test, expect } from '@playwright/test';

test('carousel navigation works', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('#carouselTrack')).toBeVisible();

  await page.waitForSelector('.card', { timeout: 5000 });
  const cards = page.locator('.card');
  await expect(cards.first()).toBeVisible();
});

test('navigation links work', async ({ page }) => {
  await page.goto('/');

  for (const [href, id] of [
    ['#home', '#home'],
    ['#carousel-projects', '#carousel-projects'],
    ['#stack', '#stack'],
    ['#about', '#about'],
    ['#contact', '#contact'],
  ]) {
    await page.click(`a[href="${href}"]`);
    await expect(page.locator(id)).toBeInViewport();
  }
});