import { test, expect } from '@playwright/test';

// Smoke test: load app and toggle settings panel
// Note: selectors are best-effort based on current UI labels

test('time mode toggle UI is reachable', async ({ page }) => {
  await page.goto('/');

  // Wait for header text to appear
  await expect(page.locator('text=Advanced 3D Weather Experience')).toBeVisible({ timeout: 15000 });

  // Open settings by aria-label
  await page.getByLabel('Settings').click();

  // Cycle time format button exists
  await expect(page.getByText(/time format/i)).toBeVisible();
  await expect(page.getByText(/cycle/i)).toBeVisible();

  // Click cycle button once
  await page.getByText(/cycle/i).click();

  // Close settings (press Escape)
  await page.keyboard.press('Escape');

  // Back on main page
  await expect(page.getByLabel('Settings')).toBeVisible();
});
