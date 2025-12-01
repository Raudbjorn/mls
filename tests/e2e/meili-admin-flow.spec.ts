import { test, expect } from '@playwright/test';

test.describe('E2E: Meilisearch Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Assuming the app runs on localhost:5173
    await page.goto('http://localhost:5173');
  });

  test.describe('authentication flow', () => {
    test('should prompt for API key on first visit', async ({ page }) => {
      // Expect to see an input for API Key
      await expect(page.getByLabel(/API Key/i)).toBeVisible();
      await expect(page.getByText('Connect')).toBeVisible();
    });

    test('should validate API key against Meilisearch', async ({ page }) => {
      await page.getByLabel(/API Key/i).fill('invalid-key');
      await page.getByText('Connect').click();
      await expect(page.getByText(/Invalid API key/i)).toBeVisible();
    });

    test('should allow login with valid key', async ({ page }) => {
      // Mock validation if needed, or assume running instance
      // For E2E we usually expect a real instance or mocked network
      await page.getByLabel(/API Key/i).fill('masterKey');
      await page.getByText('Connect').click();
      await expect(page.getByText(/Dashboard/i)).toBeVisible();
    });
  });

  test.describe('index management flow', () => {
    // meaningful tests require auth first
    test.beforeEach(async ({ page }) => {
        // Setup auth state or login
        await page.getByLabel(/API Key/i).fill('masterKey');
        await page.getByText('Connect').click();
    });

    test('should create a new index', async ({ page }) => {
      await page.getByText('Create Index').click();
      await page.getByLabel('Index UID').fill('movies');
      await page.getByLabel('Primary Key').fill('id');
      await page.getByText('Create', { exact: true }).click();
      
      await expect(page.getByText('Index "movies" created')).toBeVisible();
      await expect(page.getByText('movies')).toBeVisible();
    });

    test('should delete an index with confirmation', async ({ page }) => {
      // Assume 'movies' exists or create it
      await page.getByText('movies').first().click();
      await page.getByRole('button', { name: 'Delete Index' }).click();
      await page.getByRole('button', { name: 'Confirm' }).click();
      
      await expect(page.getByText('movies')).not.toBeVisible();
    });
  });

  test.describe('document management flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.getByLabel(/API Key/i).fill('masterKey');
        await page.getByText('Connect').click();
        await page.getByText('movies').first().click();
    });

    test('should import documents from JSON', async ({ page }) => {
      await page.getByText('Documents').click();
      await page.getByText('Add Documents').click();
      
      // TODO: Upload file interaction
      // await page.setInputFiles('input[type="file"]', 'test-docs.json');
      
      // For now check UI exists
      await expect(page.getByText('Upload JSON')).toBeVisible();
    });
  });
});

