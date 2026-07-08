const { test, expect } = require('@playwright/test');

test('TC-006 เปิดหน้า login เจ้าหน้าที่', async ({ page }) => {

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('text=สำหรับเจ้าหน้าที่');

  await page.click('text=สำหรับเจ้าหน้าที่');

  await expect(
    page.locator('text=เจ้าหน้าที่เข้าสู่ระบบ')
  ).toBeVisible({ timeout: 10000 });

});