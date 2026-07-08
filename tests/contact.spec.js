const { test, expect } = require('@playwright/test');

test('TC-005 เปิดหน้าติดต่อเรา', async ({ page }) => {

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('text=ติดต่อเรา');

  await page.click('text=ติดต่อเรา');

  await expect(
    page.locator('text=ติดต่อ')
  ).toBeVisible({ timeout: 10000 });

});