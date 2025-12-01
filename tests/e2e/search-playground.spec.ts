import { test, expect } from '@playwright/test';

test.describe('E2E: Search Playground Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/playground');
    // Handle auth if needed
    if (await page.getByLabel(/API Key/i).isVisible()) {
        await page.getByLabel(/API Key/i).fill('masterKey');
        await page.getByText('Connect').click();
    }
  });

  test.describe('basic search', () => {
    test('should execute search query and display results', async ({ page }) => {
      await page.getByPlaceholder('Search...').fill('batman');
      // Wait for results
      await expect(page.getByText('Batman Begins')).toBeVisible();
    });

    test('should show result count', async ({ page }) => {
      await page.getByPlaceholder('Search...').fill('a');
      await expect(page.getByText(/Found \d+ hits/)).toBeVisible();
    });
  });

  test.describe('search configuration', () => {
    test('should apply filters to search', async ({ page }) => {
      await page.getByPlaceholder('Filter...').fill('id = 1');
      await expect(page.getByText('Found 1 hits')).toBeVisible();
    });

    test('should limit result count', async ({ page }) => {
      await page.getByLabel('Limit').fill('5');
      // Verify only 5 items
      const items = await page.locator('.hit-item').count();
      expect(items).toBeLessThanOrEqual(5);
    });
  });

  test.describe('hybrid search', () => {
    test('should toggle hybrid search mode', async ({ page }) => {
      await page.getByLabel('Hybrid Search').check();
      await expect(page.getByText('Semantic Ratio')).toBeVisible();
    });

    test('should configure semantic ratio', async ({ page }) => {
      await page.getByLabel('Hybrid Search').check();
      await page.getByLabel('Semantic Ratio').fill('0.8');
      // Trigger search
      await page.getByPlaceholder('Search...').fill('matrix');
      // Check results updated (hard to verify semantic vs keyword without specific data, but check UI interaction)
      await expect(page.getByText('Score:')).toBeVisible();
    });
  });
});

