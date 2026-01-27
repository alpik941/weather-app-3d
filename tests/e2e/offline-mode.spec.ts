import { test, expect } from '@playwright/test';

/**
 * Offline mode E2E test
 * Verifies that the app works correctly in offline mode and shows cached data
 */
test.describe('Offline Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and cache before each test
    await page.goto('http://localhost:5174');
    await page.evaluate(() => localStorage.clear());
  });

  test('should cache weather data on successful fetch', async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5174');

    // Wait for weather data to load (check for weather card)
    await page.waitForSelector('text=London', { timeout: 10000 });
    
    // Check that data is displayed
    const hasWeatherData = await page.locator('[class*="weather"]').count();
    expect(hasWeatherData).toBeGreaterThan(0);

    // Verify cache was created in localStorage
    const cacheExists = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      return keys.some(key => key.includes('weather-cache:v1:bundle:london'));
    });
    expect(cacheExists).toBe(true);
  });

  test('should display offline snapshot banner when using cached data', async ({ page, context }) => {
    // First visit - load data and cache it
    await page.goto('http://localhost:5174');
    await page.waitForSelector('text=London', { timeout: 10000 });
    
    // Wait a bit for all data to be cached
    await page.waitForTimeout(2000);

    // Now go offline
    await context.setOffline(true);

    // Reload the page while offline
    await page.reload();

    // Wait for page to render
    await page.waitForLoadState('domcontentloaded');

    // Check that offline snapshot banner is displayed
    const offlineBanner = page.locator('text=/offline.*snapshot/i');
    await expect(offlineBanner).toBeVisible({ timeout: 5000 });

    // Verify that cached weather data is still displayed
    const hasWeatherData = await page.locator('text=London').count();
    expect(hasWeatherData).toBeGreaterThan(0);
  });

  test('should show error when no cache available offline', async ({ page, context }) => {
    // Start offline immediately (no cached data)
    await context.setOffline(true);
    
    // Navigate to app while offline
    await page.goto('http://localhost:5174');
    
    // Search for a city (should fail and show error)
    const searchInput = page.locator('input[placeholder*="Search" i]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Paris');
      await searchInput.press('Enter');
      
      // Wait a bit for the error to appear
      await page.waitForTimeout(2000);
      
      // Check for error message
      const hasError = await page.locator('text=/failed.*load/i').count();
      expect(hasError).toBeGreaterThan(0);
    }
  });

  test('should update from cache when searching for previously cached city offline', async ({ page, context }) => {
    // First visit - search for Paris and cache it
    await page.goto('http://localhost:5174');
    
    const searchInput = page.locator('input[placeholder*="Search" i]');
    await searchInput.fill('Paris');
    await searchInput.press('Enter');
    
    // Wait for Paris weather to load
    await page.waitForSelector('text=Paris', { timeout: 10000 });
    await page.waitForTimeout(2000); // Allow cache to be saved
    
    // Go back to London
    await searchInput.fill('London');
    await searchInput.press('Enter');
    await page.waitForSelector('text=London', { timeout: 10000 });
    
    // Now go offline
    await context.setOffline(true);
    
    // Search for Paris again (should load from cache)
    await searchInput.fill('Paris');
    await searchInput.press('Enter');
    
    // Wait for Paris to be displayed from cache
    await page.waitForSelector('text=Paris', { timeout: 5000 });
    
    // Check that offline banner is shown
    const offlineBanner = page.locator('text=/offline.*snapshot/i');
    await expect(offlineBanner).toBeVisible();
  });

  test('should display timestamp of cached data', async ({ page, context }) => {
    // Load data online first
    await page.goto('http://localhost:5174');
    await page.waitForSelector('text=London', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Go offline and reload
    await context.setOffline(true);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Check that timestamp is displayed in offline banner
    const offlineBanner = page.locator('text=/offline.*snapshot/i');
    await expect(offlineBanner).toBeVisible({ timeout: 5000 });
    
    // Verify timestamp format (should show date and time)
    const bannerText = await offlineBanner.textContent();
    expect(bannerText).toMatch(/\d+/); // Should contain numbers (date/time)
  });

  test('should work with "Find My Location" feature offline', async ({ page, context }) => {
    // Grant geolocation permissions
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 51.5074, longitude: -0.1278 }); // London coords

    // Load data online with location
    await page.goto('http://localhost:5174');
    
    const locateButton = page.locator('button[title*="Find" i]');
    await locateButton.click();
    
    // Wait for location-based data to load
    await page.waitForTimeout(3000);
    
    // Go offline
    await context.setOffline(true);
    
    // Click locate again (should use cached data)
    await locateButton.click();
    await page.waitForTimeout(2000);
    
    // Check that offline banner appears
    const offlineBanner = page.locator('text=/offline.*snapshot/i');
    await expect(offlineBanner).toBeVisible({ timeout: 5000 });
  });

  test('should maintain all forecast panels (hourly, weekly) from cache', async ({ page, context }) => {
    // Load data online
    await page.goto('http://localhost:5174');
    await page.waitForSelector('text=London', { timeout: 10000 });
    await page.waitForTimeout(3000); // Allow all data to load and cache

    // Go offline
    await context.setOffline(true);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // Navigate to Hourly forecast
    const hourlyButton = page.locator('button:has-text("Hourly")');
    if (await hourlyButton.isVisible()) {
      await hourlyButton.click();
      await page.waitForTimeout(1000);
      
      // Check that hourly data is displayed
      const hourlyItems = await page.locator('[class*="hourly"]').count();
      expect(hourlyItems).toBeGreaterThan(0);
    }

    // Navigate to Weekly forecast
    const weeklyButton = page.locator('button:has-text(/7.*day/i)');
    if (await weeklyButton.isVisible()) {
      await weeklyButton.click();
      await page.waitForTimeout(1000);
      
      // Check that weekly data is displayed
      const weeklyItems = await page.locator('[class*="forecast"]').count();
      expect(weeklyItems).toBeGreaterThan(0);
    }

    // Verify offline banner is still visible
    const offlineBanner = page.locator('text=/offline.*snapshot/i');
    await expect(offlineBanner).toBeVisible();
  });
});
