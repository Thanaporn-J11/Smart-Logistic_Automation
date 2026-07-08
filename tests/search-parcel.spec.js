const { test, expect } = require('@playwright/test');

test('TC-003 ค้นหาพัสดุ', async ({ page }) => {

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('text=เช็คพัสดุ');
  await page.click('text=เช็คพัสดุ');

  await page.waitForSelector('input');

  await page.fill('input', 'T715479');

  await page.click('text=ค้นหา');

  await expect(
    page.locator('text=T715479')
  ).toBeVisible({ timeout: 10000 });

});