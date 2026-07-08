const { test, expect } = require('@playwright/test');

test('TC-001 เปิดหน้าเว็บหลัก', async ({ page }) => {

  await page.goto('/', {
    waitUntil: 'domcontentloaded'
  });

  await expect(
    page.locator('text=Smart Logistic Express')
  ).toBeVisible({ timeout: 10000 });

});