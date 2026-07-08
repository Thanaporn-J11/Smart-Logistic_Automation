const { test, expect } = require('@playwright/test');

test('TC-007 Login admin', async ({ page }) => {

  await page.goto('/login', { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('input[placeholder="Username"]');

  await page.fill('input[placeholder="Username"]', 'admin');

  await page.fill('input[placeholder="Password"]', '1234');

  await page.click('text=เข้าสู่ระบบ');

});