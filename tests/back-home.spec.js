const { test, expect } = require('@playwright/test');

test('TC-008 กลับหน้าแรก', async ({ page }) => {

  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('text=กลับหน้าหลัก');

  await page.click('text=กลับหน้าหลัก');

  await expect(
    page.locator('text=Smart Logistic Express')
  ).toBeVisible({ timeout: 10000 });

});